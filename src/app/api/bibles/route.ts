/**
 * GET /api/bibles — the public translation catalog.
 *
 * Served straight from the allowlist in `src/lib/bible/translations.ts`, so it
 * touches no data files. The build script asserts each `verseCount` against the
 * corresponding source file, which is what keeps this hand-written list honest.
 */

import {
    CACHE_ONE_HOUR,
    jsonResponse,
    preflightResponse,
    toHeadResponse,
} from "@/lib/bible/http";
import { TRANSLATIONS } from "@/lib/bible/translations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    return jsonResponse(
        request,
        {
            translations: TRANSLATIONS.map(
                ({ id, name, language, direction, source, verseCount }) => ({
                    id,
                    name,
                    language,
                    direction,
                    source,
                    verseCount,
                }),
            ),
        },
        { cacheControl: CACHE_ONE_HOUR },
    );
}

export async function HEAD(request: Request) {
    return toHeadResponse(await GET(request));
}

export async function OPTIONS(request: Request) {
    return preflightResponse(request);
}
