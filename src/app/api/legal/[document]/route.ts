/**
 * GET /api/legal/:document — one legal document in full.
 *
 * `:document` is `terms` or `privacy`. The body is structured JSON by default;
 * `?format=markdown` returns the same content as CommonMark for clients that
 * already have a Markdown renderer.
 */

import {
    CACHE_ONE_HOUR,
    jsonError,
    jsonResponse,
    preflightResponse,
    textResponse,
    toHeadResponse,
} from "@/lib/bible/http";
import {
    LEGAL_DOCUMENTS,
    getLegalDocument,
    toApiDocument,
    toMarkdown,
} from "@/lib/legal/documents";

export const dynamic = "force-dynamic";

const FORMATS = ["json", "markdown"] as const;

type Context = { params: Promise<{ document: string }> };

export async function GET(request: Request, { params }: Context) {
    const slug = (await params).document;
    const document = getLegalDocument(slug);
    if (document === undefined) {
        const known = LEGAL_DOCUMENTS.map(({ slug }) => `"${slug}"`).join(" or ");
        return jsonError(request, 404, "UNKNOWN_DOCUMENT", `Unknown document. Use ${known}.`);
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "json";
    if (!(FORMATS as readonly string[]).includes(format)) {
        return jsonError(
            request,
            400,
            "INVALID_FORMAT",
            `Unsupported format. Use ${FORMATS.map((name) => `"${name}"`).join(" or ")}.`,
        );
    }

    // The version travels in a header as well, so a HEAD request is enough to
    // tell whether the document changed.
    const options = {
        cacheControl: CACHE_ONE_HOUR,
        headers: {
            "X-Document-Last-Updated": document.lastUpdated,
            "Access-Control-Expose-Headers": "X-Document-Last-Updated",
        },
    };

    if (format === "markdown") {
        return textResponse(
            request,
            toMarkdown(document, url.origin),
            "text/markdown; charset=utf-8",
            options,
        );
    }
    return jsonResponse(request, toApiDocument(document, url.origin), options);
}

export async function HEAD(request: Request, context: Context) {
    return toHeadResponse(await GET(request, context));
}

export async function OPTIONS(request: Request) {
    return preflightResponse(request);
}
