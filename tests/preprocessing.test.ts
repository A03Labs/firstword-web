import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { BOOKS } from "@/lib/bible/books";
import { chapterFilePath, fullFilePath, indexFilePath } from "@/lib/bible/paths";
import { TRANSLATIONS, type Translation } from "@/lib/bible/translations";
import type { ChapterPayload, TranslationIndex } from "@/lib/bible/store";

type SourceVerse = { book: number; chapter: number; verse: number; text: string };

async function readJson<T>(file: string): Promise<T> {
    return JSON.parse(await readFile(file, "utf8")) as T;
}

/** Every chapter file of one translation, read once and shared by the assertions. */
async function readAllChapters(translation: Translation): Promise<ChapterPayload[]> {
    const files: Promise<ChapterPayload>[] = [];
    for (const book of BOOKS) {
        for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
            files.push(readJson<ChapterPayload>(chapterFilePath(translation, book.number, chapter)));
        }
    }
    return Promise.all(files);
}

describe.each(TRANSLATIONS.map((translation) => [translation.id, translation] as const))(
    "preprocessing of %s",
    (_id, translation) => {
        it("preserves all 31,105 references, uniquely and with identical text", async () => {
            const source = await readJson<SourceVerse[]>(fullFilePath(translation));
            expect(source).toHaveLength(translation.verseCount);

            const chapters = await readAllChapters(translation);

            // Flatten the chapter files back into a reference -> text map, failing
            // on any reference emitted twice.
            const generated = new Map<string, string>();
            for (const payload of chapters) {
                for (const entry of payload.verses) {
                    const reference = `${payload.book}:${payload.chapter}:${entry.verse}`;
                    expect(generated.has(reference)).toBe(false);
                    generated.set(reference, entry.text);
                }
            }

            expect(generated.size).toBe(translation.verseCount);

            // Same references, same text, no silent substitutions.
            const missing: string[] = [];
            const altered: string[] = [];
            for (const verse of source) {
                const reference = `${verse.book}:${verse.chapter}:${verse.verse}`;
                if (!generated.has(reference)) missing.push(reference);
                else if (generated.get(reference) !== verse.text) altered.push(reference);
            }

            expect(missing).toEqual([]);
            expect(altered).toEqual([]);
        });

        it("emits one file per canonical chapter, in verse order", async () => {
            const chapters = await readAllChapters(translation);

            expect(chapters).toHaveLength(1190);

            for (const payload of chapters) {
                expect(payload.translationId).toBe(translation.id);
                expect(payload.verses.length).toBeGreaterThan(0);

                const numbers = payload.verses.map((entry) => entry.verse);
                expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
                expect(new Set(numbers).size).toBe(numbers.length);
                expect(numbers[0]).toBe(1);
            }
        });

        it("writes an index whose per-chapter counts add up to the verse count", async () => {
            const index = await readJson<TranslationIndex>(indexFilePath(translation));

            expect(index.translationId).toBe(translation.id);
            expect(index.verseCount).toBe(translation.verseCount);
            expect(Object.keys(index.chapters)).toHaveLength(BOOKS.length);

            let total = 0;
            for (const book of BOOKS) {
                const counts = index.chapters[String(book.number)];
                expect(Object.keys(counts)).toHaveLength(book.chapters);
                for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
                    const count = counts[String(chapter)];
                    expect(count).toBeGreaterThan(0);
                    total += count;
                }
            }

            expect(total).toBe(translation.verseCount);
        });

        it("stores each chapter in the exact response shape of the chapter endpoint", async () => {
            const raw = await readFile(chapterFilePath(translation, 43, 3), "utf8");
            const payload = JSON.parse(raw) as ChapterPayload;

            // The route returns these bytes verbatim, so the key order matters as
            // much as the values.
            expect(Object.keys(payload)).toEqual(["translationId", "book", "chapter", "verses"]);
            expect(Object.keys(payload.verses[0])).toEqual(["verse", "text"]);
            expect(payload).toMatchObject({ translationId: translation.id, book: 43, chapter: 3 });
        });
    },
);

describe("the canon table used by the reader", () => {
    it("matches the generated data", async () => {
        for (const translation of TRANSLATIONS) {
            const index = await readJson<TranslationIndex>(indexFilePath(translation));
            for (const book of BOOKS) {
                expect(Object.keys(index.chapters[String(book.number)]).length).toBe(book.chapters);
            }
        }
    });

    it("covers 66 books and 1,190 chapters", () => {
        expect(BOOKS).toHaveLength(66);
        expect(BOOKS.reduce((sum, book) => sum + book.chapters, 0)).toBe(1190);
    });
});
