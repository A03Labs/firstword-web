/**
 * GET /api/bibles/:translationId/:book/:chapter — one chapter.
 *
 * The generated chapter file already contains this endpoint's exact response
 * body, so the handler reads one small file and returns the bytes: no parsing,
 * and no contact with the 31,105-verse flat array.
 */

import {
    CACHE_ONE_HOUR,
    internalError,
    jsonError,
    jsonTextResponse,
    preflightResponse,
    toHeadResponse,
} from "@/lib/bible/http";
import { resolveChapterReference } from "@/lib/bible/resolve";
import { readChapterFile } from "@/lib/bible/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ translationId: string; book: string; chapter: string }> };

export async function GET(request: Request, { params }: Context) {
    const reference = resolveChapterReference(request, await params);
    if (!reference.ok) return reference.response;

    const { translation, book, chapter } = reference.value;
    try {
        const body = await readChapterFile(translation, book, chapter);
        if (body === null) {
            return jsonError(
                request,
                404,
                "CHAPTER_NOT_FOUND",
                `Chapter ${chapter} of book ${book} is not available in ${translation.id}.`,
            );
        }
        return jsonTextResponse(request, body, { cacheControl: CACHE_ONE_HOUR });
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
