/**
 * Preprocesses each source translation into per-chapter files.
 *
 * Run by `prebuild`, so a deployment always ships freshly generated data:
 *
 *     npm run build:bible-data
 *
 * Input   data/bibles/<ID>/full.json   flat array of 31,105 verses (committed)
 * Output  data/bibles/<ID>/index.json  verse counts per chapter
 *         data/bibles/<ID>/chapters/<book>/<chapter>.json
 *
 * Each chapter file holds the exact response body of
 * `GET /api/bibles/:id/:book/:chapter`, so the route can return the bytes
 * without parsing anything. The whole point is that no request ever scans the
 * flat array: this script pays that cost once, at build time.
 *
 * The script asserts what the API and the reader assume — 66 books, the canonical
 * chapter counts from `src/lib/bible/books.ts`, the registry's verse count, and
 * no duplicate references — and exits non-zero if any of it fails, so bad data
 * breaks the build rather than the API.
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import { BOOKS, BOOK_COUNT, formatReference } from "../src/lib/bible/books.ts";
import { TRANSLATIONS, type Translation } from "../src/lib/bible/translations.ts";

type SourceVerse = { book: number; chapter: number; verse: number; text: string };

const DATA_ROOT = path.resolve(
    process.env.BIBLE_DATA_DIR ?? path.join(process.cwd(), "data", "bibles"),
);

function fail(message: string): never {
    console.error(`\n✗ ${message}\n`);
    process.exit(1);
}

function readSource(translation: Translation): SourceVerse[] {
    const file = path.join(DATA_ROOT, translation.id, "full.json");
    let parsed: unknown;
    try {
        parsed = JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
        fail(
            `Could not read ${path.relative(process.cwd(), file)}: ${(error as Error).message}`,
        );
    }
    if (!Array.isArray(parsed)) {
        fail(`${path.relative(process.cwd(), file)} must contain a flat JSON array.`);
    }
    return parsed as SourceVerse[];
}

/** Groups the flat array by book then chapter, validating every entry. */
function groupVerses(translation: Translation, verses: SourceVerse[]) {
    const byBook = new Map<number, Map<number, SourceVerse[]>>();
    const seen = new Set<string>();

    verses.forEach((entry, position) => {
        const where = `${translation.id} entry ${position}`;
        if (
            !Number.isInteger(entry?.book) ||
            !Number.isInteger(entry?.chapter) ||
            !Number.isInteger(entry?.verse) ||
            typeof entry?.text !== "string"
        ) {
            fail(`${where} is not a {book, chapter, verse, text} record.`);
        }
        if (entry.book < 1 || entry.book > BOOK_COUNT) {
            fail(`${where} has book ${entry.book}, outside 1-${BOOK_COUNT}.`);
        }
        if (entry.chapter < 1 || entry.verse < 1) {
            fail(`${where} has a non-positive chapter or verse.`);
        }

        const reference = `${entry.book}:${entry.chapter}:${entry.verse}`;
        if (seen.has(reference)) {
            fail(`${translation.id} repeats ${formatReference(entry.book, entry.chapter, entry.verse)}.`);
        }
        seen.add(reference);

        let chapters = byBook.get(entry.book);
        if (!chapters) {
            chapters = new Map();
            byBook.set(entry.book, chapters);
        }
        const chapter = chapters.get(entry.chapter);
        if (chapter) chapter.push(entry);
        else chapters.set(entry.chapter, [entry]);
    });

    if (seen.size !== translation.verseCount) {
        fail(
            `${translation.id} has ${seen.size} unique references but the registry declares ${translation.verseCount}. ` +
                `Update verseCount in src/lib/bible/translations.ts if the source really changed.`,
        );
    }
    return byBook;
}

/** Checks the grouped data against the canon table the reader's pickers use. */
function assertCanonShape(translation: Translation, byBook: Map<number, Map<number, SourceVerse[]>>) {
    if (byBook.size !== BOOK_COUNT) {
        fail(`${translation.id} covers ${byBook.size} books, expected ${BOOK_COUNT}.`);
    }
    for (const book of BOOKS) {
        const chapters = byBook.get(book.number);
        if (!chapters) fail(`${translation.id} is missing ${book.name}.`);
        if (chapters.size !== book.chapters) {
            fail(
                `${translation.id} has ${chapters.size} chapters in ${book.name}, but ` +
                    `src/lib/bible/books.ts declares ${book.chapters}.`,
            );
        }
        for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
            if (!chapters.has(chapter)) {
                fail(`${translation.id} is missing ${formatReference(book.number, chapter)}.`);
            }
        }
    }
}

async function generate(translation: Translation) {
    const translationDir = path.join(DATA_ROOT, translation.id);
    const chaptersDir = path.join(translationDir, "chapters");

    const verses = readSource(translation);
    const byBook = groupVerses(translation, verses);
    assertCanonShape(translation, byBook);

    // Rebuilt from scratch: a chapter that disappeared from the source must not
    // survive as a stale file the API would still happily serve.
    await rm(chaptersDir, { recursive: true, force: true });

    const index: Record<string, Record<string, number>> = {};
    let written = 0;

    for (const book of BOOKS) {
        const chapters = byBook.get(book.number)!;
        const bookDir = path.join(chaptersDir, String(book.number));
        await mkdir(bookDir, { recursive: true });

        const bookIndex: Record<string, number> = {};
        for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
            const entries = chapters
                .get(chapter)!
                .slice()
                .sort((a, b) => a.verse - b.verse);

            // Stored in the API's response shape so the route returns it verbatim.
            const payload = {
                translationId: translation.id,
                book: book.number,
                chapter,
                verses: entries.map(({ verse, text }) => ({ verse, text })),
            };
            await writeFile(path.join(bookDir, `${chapter}.json`), JSON.stringify(payload), "utf8");
            bookIndex[String(chapter)] = entries.length;
            written += 1;
        }
        index[String(book.number)] = bookIndex;
    }

    await writeFile(
        path.join(translationDir, "index.json"),
        JSON.stringify(
            {
                translationId: translation.id,
                verseCount: verses.length,
                generatedAt: new Date().toISOString(),
                chapters: index,
            },
            null,
            0,
        ),
        "utf8",
    );

    console.log(
        `✓ ${translation.id.padEnd(6)} ${verses.length} verses → ${written} chapter files`,
    );
}

for (const translation of TRANSLATIONS) {
    await generate(translation);
}
console.log(`\nData root: ${path.relative(process.cwd(), DATA_ROOT)}`);
