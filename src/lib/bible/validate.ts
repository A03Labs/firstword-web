/**
 * Request-parameter validation.
 *
 * Everything a route handler receives from the URL passes through here first.
 * The functions return numbers or `undefined` — never a string — so downstream
 * code (in particular the path builders in `paths.ts`) can only ever
 * concatenate integers it produced itself.
 */

import { BOOK_COUNT, getBook } from "./books";

/**
 * Parse a route segment as a positive integer.
 *
 * Strict on purpose: `parseInt` would happily accept `"3abc"`, `"+3"`, `"3.0"`
 * and `"03"`, and `Number` would accept `"0x2b"`, `" 3 "` and `""`. Each of
 * those is a second spelling of a reference that we would then serve under a
 * distinct CDN cache key, so they are rejected instead.
 */
export function parsePositiveInt(raw: string): number | undefined {
    if (!/^[1-9][0-9]{0,6}$/.test(raw)) return undefined;
    const value = Number(raw);
    return Number.isSafeInteger(value) ? value : undefined;
}

/** A book number in 1-66. */
export function parseBookNumber(raw: string): number | undefined {
    const value = parsePositiveInt(raw);
    if (value === undefined || value > BOOK_COUNT) return undefined;
    return value;
}

/**
 * Whether a chapter can exist at all, from the static canon table — lets an
 * out-of-range chapter 404 without touching the filesystem.
 */
export function chapterExistsInCanon(book: number, chapter: number): boolean {
    const entry = getBook(book);
    return entry !== undefined && chapter >= 1 && chapter <= entry.chapters;
}
