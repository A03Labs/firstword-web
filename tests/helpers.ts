/**
 * Test helpers.
 *
 * The route handlers are plain `(Request, { params })` functions built on the Web
 * Fetch API, so they can be called directly — no Next.js server, no HTTP listener.
 * `params` is a promise in Next 16, which is what `context` reproduces here.
 */

export const BASE_URL = "https://firstword.online";

export function get(path: string, init?: RequestInit): Request {
    return new Request(`${BASE_URL}${path}`, { method: "GET", ...init });
}

/** The `{ params }` context Next passes as a route handler's second argument. */
export function context<T extends Record<string, string>>(params: T) {
    return { params: Promise.resolve(params) };
}

export async function json<T = unknown>(response: Response): Promise<T> {
    return (await response.json()) as T;
}
