/**
 * GET /api/bibles/:translationId/download — the complete translation.
 *
 * Returns the original flat verse array byte-for-byte, streamed from disk. The
 * file is ~5 MB, so it is piped rather than buffered: a download costs the server
 * the same memory as a chapter request.
 *
 * `download` is a static segment and therefore takes precedence over the sibling
 * `[book]` dynamic segment, so `/api/bibles/GENZ/download` can never be read as
 * "book number `download`".
 */

import {
    CACHE_ONE_HOUR,
    corsHeaders,
    internalError,
    preflightResponse,
} from "@/lib/bible/http";
import { resolveTranslation } from "@/lib/bible/resolve";
import { fullFileSize, readFullFileStream } from "@/lib/bible/store";
import type { Translation } from "@/lib/bible/translations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ translationId: string }> };

async function downloadHeaders(request: Request, translation: Translation) {
    const headers = new Headers(corsHeaders(request.headers.get("origin")));
    headers.set("Content-Type", "application/json; charset=utf-8");
    // The filename is a constant from the allowlist, never request-derived, so
    // it cannot inject header syntax.
    headers.set(
        "Content-Disposition",
        `attachment; filename="${translation.downloadFilename}"`,
    );
    headers.set("Cache-Control", CACHE_ONE_HOUR);
    headers.set("Content-Length", String(await fullFileSize(translation)));
    return headers;
}

export async function GET(request: Request, { params }: Context) {
    const translation = resolveTranslation(request, (await params).translationId);
    if (!translation.ok) return translation.response;

    try {
        const headers = await downloadHeaders(request, translation.value);
        return new Response(readFullFileStream(translation.value), { status: 200, headers });
    } catch (error) {
        return internalError(request, error);
    }
}

/** Headers only — deliberately does not open the read stream. */
export async function HEAD(request: Request, { params }: Context) {
    const translation = resolveTranslation(request, (await params).translationId);
    if (!translation.ok) return new Response(null, { status: translation.response.status, headers: translation.response.headers });

    try {
        return new Response(null, {
            status: 200,
            headers: await downloadHeaders(request, translation.value),
        });
    } catch (error) {
        return internalError(request, error);
    }
}

export async function OPTIONS(request: Request) {
    return preflightResponse(request);
}
