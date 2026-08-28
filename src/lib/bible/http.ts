/**
 * Shared HTTP concerns for the public Bible API: CORS, cache headers, response
 * compression, and a single stable error envelope.
 *
 * Every route builds its responses through these helpers so the mobile app sees
 * one set of shapes and one caching policy rather than per-route variations.
 */

import { brotliCompressSync, constants, gzipSync } from "node:zlib";

/** The only methods any Bible route accepts. */
export const ALLOWED_METHODS = "GET, HEAD, OPTIONS";

/**
 * One hour at the CDN with a day of stale-while-revalidate. The underlying files
 * only change on deploy, so `max-age` can match: a client that holds a chapter
 * for an hour is never wrong for longer than a deploy takes to roll out.
 */
export const CACHE_ONE_HOUR =
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

/** Errors are never cached — a 404 today may be a 200 after the next deploy. */
export const CACHE_NEVER = "no-store";

export type ErrorCode =
    | "UNKNOWN_TRANSLATION"
    | "INVALID_BOOK"
    | "INVALID_CHAPTER"
    | "INVALID_VERSE"
    | "CHAPTER_NOT_FOUND"
    | "VERSE_NOT_FOUND"
    | "INTERNAL_ERROR";

/**
 * Origins allowed to read the API from a browser, as a comma-separated list in
 * `BIBLE_API_ALLOWED_ORIGINS`.
 *
 * Unset means "any origin", which is the intended production default: the data
 * is public domain, the endpoints are unauthenticated, and no cookies or
 * credentials are involved, so there is nothing for a hostile page to gain.
 * Setting the variable narrows access to the listed origins.
 */
function allowedOrigins(): string[] {
    return (process.env.BIBLE_API_ALLOWED_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
}

/**
 * CORS headers for a request from `origin`.
 *
 * Native mobile clients send no `Origin` at all and are unaffected by CORS; the
 * headers below exist for browsers. When an allowlist is configured the matching
 * origin is echoed back (with `Vary: Origin`, so a CDN cannot serve one origin's
 * response to another) and a non-matching origin simply gets no CORS grant.
 */
export function corsHeaders(origin: string | null): Record<string, string> {
    const headers: Record<string, string> = {
        "Access-Control-Allow-Methods": ALLOWED_METHODS,
        "Access-Control-Allow-Headers": "Content-Type",
    };

    const allowlist = allowedOrigins();
    if (allowlist.length === 0) {
        headers["Access-Control-Allow-Origin"] = "*";
        return headers;
    }

    headers["Vary"] = "Origin";
    if (origin !== null && allowlist.includes(origin)) {
        headers["Access-Control-Allow-Origin"] = origin;
    }
    return headers;
}

function baseHeaders(request: Request, cacheControl: string): Headers {
    const headers = new Headers(corsHeaders(request.headers.get("origin")));
    headers.set("Cache-Control", cacheControl);
    return headers;
}

/** Adds a field to `Vary` without dropping one CORS may already have set. */
function addVary(headers: Headers, field: string): void {
    const existing = headers.get("Vary");
    const fields = existing ? existing.split(",").map((entry) => entry.trim()) : [];
    if (!fields.some((entry) => entry.toLowerCase() === field.toLowerCase())) {
        fields.push(field);
    }
    headers.set("Vary", fields.join(", "));
}

/** Below this, the header overhead outweighs anything compression would save. */
const COMPRESSION_THRESHOLD_BYTES = 1024;

/**
 * The best encoding the client accepts, or `null`.
 *
 * Honours an explicit `q=0`, which is how a client says "not this one"; anything
 * else is treated as acceptable, and Brotli is preferred where offered.
 */
function negotiateEncoding(request: Request): "br" | "gzip" | null {
    const header = request.headers.get("accept-encoding");
    if (!header) return null;

    const accepted = new Map<string, number>();
    for (const part of header.toLowerCase().split(",")) {
        const [token, ...parameters] = part.trim().split(";");
        const quality = parameters
            .map((parameter) => /^\s*q=([\d.]+)\s*$/.exec(parameter))
            .find((match) => match !== null);
        accepted.set(token.trim(), quality ? Number(quality[1]) : 1);
    }

    const usable = (token: string) => (accepted.get(token) ?? 0) > 0;
    if (usable("br")) return "br";
    if (usable("gzip")) return "gzip";
    return null;
}

/**
 * Compresses a JSON body when the client accepts it.
 *
 * Next's built-in `compress` option does not reach Route Handler responses — a
 * 17 KB chapter goes out chunked and uncompressed from `next start` — so the API
 * negotiates its own encoding. In front of a CDN this costs nothing per view:
 * responses are cacheable for an hour, and a CDN that already compressed the
 * response will pass ours through untouched rather than double-encoding it.
 *
 * Brotli runs at quality 5 rather than the default 11: on a chapter that is a
 * fraction of the CPU for a compression ratio within a few percent.
 */
function compressBody(request: Request, body: string, headers: Headers): BodyInit {
    const raw = Buffer.from(body, "utf8");
    if (raw.byteLength < COMPRESSION_THRESHOLD_BYTES) return body;

    const encoding = negotiateEncoding(request);
    if (encoding === null) return body;

    const compressed =
        encoding === "br"
            ? brotliCompressSync(raw, {
                  params: {
                      [constants.BROTLI_PARAM_QUALITY]: 5,
                      [constants.BROTLI_PARAM_SIZE_HINT]: raw.byteLength,
                  },
              })
            : gzipSync(raw, { level: 6 });

    headers.set("Content-Encoding", encoding);
    headers.set("Content-Length", String(compressed.byteLength));
    addVary(headers, "Accept-Encoding");

    // Copied into a plain `ArrayBuffer` rather than passed as the Node `Buffer`:
    // a Buffer is a view onto a shared pool, so handing it to `Response` would
    // expose whatever else happens to sit in that pool.
    const bytes = new ArrayBuffer(compressed.byteLength);
    new Uint8Array(bytes).set(compressed);
    return bytes;
}

/** A JSON response from an already-serialised body. */
export function jsonTextResponse(
    request: Request,
    body: string,
    { status = 200, cacheControl = CACHE_ONE_HOUR, headers: extra }: ResponseOptions = {},
): Response {
    const headers = baseHeaders(request, cacheControl);
    headers.set("Content-Type", "application/json; charset=utf-8");
    const payload = compressBody(request, body, headers);
    for (const [name, value] of Object.entries(extra ?? {})) headers.set(name, value);
    return new Response(payload, { status, headers });
}

export type ResponseOptions = {
    status?: number;
    cacheControl?: string;
    headers?: Record<string, string>;
};

/** A JSON response from a value. */
export function jsonResponse(
    request: Request,
    data: unknown,
    options: ResponseOptions = {},
): Response {
    return jsonTextResponse(request, JSON.stringify(data), options);
}

/**
 * The one error shape the API returns.
 *
 * `message` is written for a developer reading a failed request and never
 * contains a filesystem path, a stack, or anything else internal.
 */
export function jsonError(
    request: Request,
    status: number,
    code: ErrorCode,
    message: string,
): Response {
    return jsonResponse(
        request,
        { error: { code, message } },
        { status, cacheControl: CACHE_NEVER },
    );
}

/** 500 with no detail. Logs the cause server-side instead of returning it. */
export function internalError(request: Request, cause: unknown): Response {
    console.error("[bible-api]", cause);
    return jsonError(
        request,
        500,
        "INTERNAL_ERROR",
        "The Bible data could not be read. Please retry.",
    );
}

/** CORS preflight. */
export function preflightResponse(request: Request): Response {
    const headers = new Headers(corsHeaders(request.headers.get("origin")));
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("Allow", ALLOWED_METHODS);
    return new Response(null, { status: 204, headers });
}

/**
 * Strip the body from a response for a `HEAD` request while keeping every
 * header, including `Content-Length`.
 */
export function toHeadResponse(response: Response): Response {
    return new Response(null, { status: response.status, headers: response.headers });
}
