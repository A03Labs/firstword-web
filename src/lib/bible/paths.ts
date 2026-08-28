/**
 * Filesystem layout of the preprocessed Bible data. Server-only.
 *
 * The three exported builders are the only place a data path is constructed.
 * They take a `Translation` from the allowlist and integers from `validate.ts`,
 * so no request string is ever interpolated into a path; `assertInsideDataRoot`
 * is a second, cheap line of defence in case that ever stops being true.
 */

import path from "node:path";

import type { Translation } from "./translations";

/**
 * Root of the data tree, resolved once at module load.
 *
 * The default is written as a statically analysable `join` under `process.cwd()`
 * so Turbopack's file tracing can see it is scoped to `data/bibles`. Resolving a
 * bare variable here instead would make the tracer assume the route reads
 * anywhere, and it would pull the entire project — `public/` included — into the
 * server bundle. The `BIBLE_DATA_DIR` override is opted out of tracing for the
 * same reason: its value is only known at runtime, and a deployment that sets it
 * is supplying the data itself.
 */
export const DATA_ROOT = process.env.BIBLE_DATA_DIR
    ? path.resolve(/* turbopackIgnore: true */ process.env.BIBLE_DATA_DIR)
    : path.join(process.cwd(), "data", "bibles");

function assertInsideDataRoot(candidate: string): string {
    const resolved = path.resolve(candidate);
    if (resolved !== DATA_ROOT && !resolved.startsWith(DATA_ROOT + path.sep)) {
        // Never include `resolved` in the message — this surfaces as a 500 and
        // must not leak the server's directory layout.
        throw new Error("Refusing to read a Bible data path outside the data root");
    }
    return resolved;
}

/** The complete flat verse array, exactly as supplied. Served by /download. */
export function fullFilePath(translation: Translation): string {
    return assertInsideDataRoot(path.join(DATA_ROOT, translation.id, "full.json"));
}

/** Generated per-translation manifest (verse counts per chapter). */
export function indexFilePath(translation: Translation): string {
    return assertInsideDataRoot(path.join(DATA_ROOT, translation.id, "index.json"));
}

/**
 * One generated chapter file. `book` and `chapter` must already be validated
 * integers — they are stringified from numbers here, so they cannot contribute
 * a separator or a `..` segment.
 */
export function chapterFilePath(
    translation: Translation,
    book: number,
    chapter: number,
): string {
    if (!Number.isSafeInteger(book) || !Number.isSafeInteger(chapter)) {
        throw new Error("Chapter paths require integer book and chapter numbers");
    }
    return assertInsideDataRoot(
        path.join(DATA_ROOT, translation.id, "chapters", String(book), `${chapter}.json`),
    );
}
