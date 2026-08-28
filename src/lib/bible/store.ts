/**
 * Reads of the preprocessed Bible data. Server-only.
 *
 * The hot path (`readChapterFile`) reads exactly one small pre-rendered file per
 * request and hands the bytes straight to the client — no scan of the 31,105
 * verses and no `JSON.parse` of a multi-megabyte array. `readFullFileStream`
 * streams the complete file rather than buffering it, so a download costs the
 * same memory as a chapter.
 */

import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { Readable } from "node:stream";

import { chapterFilePath, fullFilePath, indexFilePath } from "./paths";
import type { Translation } from "./translations";

/** Response body of the chapter endpoint, stored verbatim on disk. */
export type ChapterPayload = {
    translationId: string;
    book: number;
    chapter: number;
    verses: { verse: number; text: string }[];
};

/** `data/bibles/<ID>/index.json`, written by the build script. */
export type TranslationIndex = {
    translationId: string;
    verseCount: number;
    generatedAt: string;
    /** Verse count per chapter, keyed by book number then chapter number. */
    chapters: Record<string, Record<string, number>>;
};

function isMissingFile(error: unknown): boolean {
    const code = (error as { code?: string } | null)?.code;
    return code === "ENOENT" || code === "ENOTDIR" || code === "EISDIR";
}

async function readFileOrNull(filePath: string): Promise<string | null> {
    try {
        return await readFile(filePath, "utf8");
    } catch (error) {
        if (isMissingFile(error)) return null;
        throw error;
    }
}

/**
 * The raw JSON text of a chapter, or `null` if that chapter does not exist.
 *
 * Returns text, not an object: the file already holds the exact response body,
 * so the chapter route never parses it.
 */
export async function readChapterFile(
    translation: Translation,
    book: number,
    chapter: number,
): Promise<string | null> {
    return readFileOrNull(chapterFilePath(translation, book, chapter));
}

/** A single verse, or `null` if the chapter or the verse is missing. */
export async function readVerse(
    translation: Translation,
    book: number,
    chapter: number,
    verse: number,
): Promise<{ verse: number; text: string } | null> {
    const raw = await readChapterFile(translation, book, chapter);
    if (raw === null) return null;
    const payload = JSON.parse(raw) as ChapterPayload;
    return payload.verses.find((entry) => entry.verse === verse) ?? null;
}

/**
 * The generated manifest, memoised per translation.
 *
 * ~15 KB per translation, so keeping it resident for the lifetime of a server
 * instance is cheap — unlike `full.json`, which is never held in memory.
 */
const indexCache = new Map<string, Promise<TranslationIndex>>();

export function readIndex(translation: Translation): Promise<TranslationIndex> {
    const cached = indexCache.get(translation.id);
    if (cached) return cached;

    const pending = readFile(indexFilePath(translation), "utf8")
        .then((raw) => JSON.parse(raw) as TranslationIndex)
        .catch((error: unknown) => {
            indexCache.delete(translation.id);
            if (isMissingFile(error)) {
                throw new Error(
                    `Missing generated index for ${translation.id}. Run "npm run build:bible-data".`,
                );
            }
            throw error;
        });

    indexCache.set(translation.id, pending);
    return pending;
}

/** Byte length of `full.json`, for `Content-Length` on download and HEAD. */
export async function fullFileSize(translation: Translation): Promise<number> {
    const stats = await stat(fullFilePath(translation));
    return stats.size;
}

/** `full.json` as a web stream, so the download never buffers 5 MB. */
export function readFullFileStream(translation: Translation): ReadableStream<Uint8Array> {
    const nodeStream = createReadStream(fullFilePath(translation));
    return Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
}
