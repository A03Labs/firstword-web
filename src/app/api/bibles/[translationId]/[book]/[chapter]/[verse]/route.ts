/**
 * GET /api/bibles/:translationId/:book/:chapter/:verse — one verse.
 *
 * Reads the same single chapter file as the chapter endpoint and picks the verse
 * out of it. That is one small parse of a few kilobytes, rather than a lookup
 * across the whole translation.
 */

import { formatReference } from "@/lib/bible/books";
import {
    CACHE_ONE_HOUR,
    internalError,
    jsonError,
    jsonResponse,
    preflightResponse,
    toHeadResponse,
} from "@/lib/bible/http";
import { resolveChapterReference, resolveVerseNumber } from "@/lib/bible/resolve";
import { readVerse } from "@/lib/bible/store";

export const dynamic = "force-dynamic";

type Context = {
    params: Promise<{
        translationId: string;
        book: string;
        chapter: string;
        verse: string;
    }>;
};

export async function GET(request: Request, { params }: Context) {
    const raw = await params;

    const reference = resolveChapterReference(request, raw);
    if (!reference.ok) return reference.response;

    const verseNumber = resolveVerseNumber(request, raw.verse);
    if (!verseNumber.ok) return verseNumber.response;

    const { translation, book, chapter } = reference.value;
    try {
        const found = await readVerse(translation, book, chapter, verseNumber.value);
        if (found === null) {
            return jsonError(
                request,
                404,
                "VERSE_NOT_FOUND",
                `${formatReference(book, chapter, verseNumber.value)} is not available in ${translation.id}.`,
            );
        }
        return jsonResponse(
            request,
            {
                translationId: translation.id,
                book,
                chapter,
                verse: found.verse,
                text: found.text,
            },
            { cacheControl: CACHE_ONE_HOUR },
        );
    } catch (error) {
        return internalError(request, error);
    }
}

export async function HEAD(request: Request, context: Context) {
    return toHeadResponse(await GET(request, context));
}

export async function OPTIONS(request: Request) {
    return preflightResponse(request);
}
