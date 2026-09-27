/**
 * GET /api/legal — the list of legal documents (Terms of Use, Privacy Policy).
 *
 * Each row carries `lastUpdated`, so a client can check whether a document has
 * changed since the user last accepted it without fetching the full text.
 */

import {
    CACHE_ONE_HOUR,
    jsonResponse,
    preflightResponse,
    toHeadResponse,
} from "@/lib/bible/http";
import { LEGAL_DOCUMENTS, toApiSummary } from "@/lib/legal/documents";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const origin = new URL(request.url).origin;
    return jsonResponse(
        request,
        { documents: LEGAL_DOCUMENTS.map((document) => toApiSummary(document, origin)) },
        { cacheControl: CACHE_ONE_HOUR },
    );
}

export async function HEAD(request: Request) {
    return toHeadResponse(await GET(request));
}

export async function OPTIONS(request: Request) {
    return preflightResponse(request);
}
