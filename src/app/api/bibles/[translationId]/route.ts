/**
 * GET /api/bibles/:translationId — one translation's metadata and structure.
 *
 * Additive to the documented catalog and chapter endpoints: it gives a client the
 * per-chapter verse counts in a single request, so a reader can build book and
 * chapter pickers without probing for 404s.
 */

import { BOOKS } from "@/lib/bible/books";
import {
    CACHE_ONE_HOUR,
    internalError,
    jsonResponse,
    preflightResponse,
    toHeadResponse,
} from "@/lib/bible/http";
import { resolveTranslation } from "@/lib/bible/resolve";
import { readIndex } from "@/lib/bible/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ translationId: string }> };

export async function GET(request: Request, { params }: Context) {
    const resolved = resolveTranslation(request, (await params).translationId);
    if (!resolved.ok) return resolved.response;
    const translation = resolved.value;

    try {
        const index = await readIndex(translation);
        return jsonResponse(
            request,
            {
                id: translation.id,
                name: translation.name,
                language: translation.language,
                direction: translation.direction,
                source: translation.source,
                verseCount: translation.verseCount,
                downloadUrl: `/api/bibles/${translation.id}/download`,
                books: BOOKS.map((book) => ({
                    book: book.number,
                    name: book.name,
                    testament: book.testament,
                    chapters: Array.from({ length: book.chapters }, (_, offset) => ({
                        chapter: offset + 1,
                        verseCount: index.chapters[String(book.number)]?.[String(offset + 1)] ?? 0,
                    })),
                })),
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
