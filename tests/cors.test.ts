import { afterEach, describe, expect, it } from "vitest";

import { corsHeaders, preflightResponse } from "@/lib/bible/http";

const ORIGINAL = process.env.BIBLE_API_ALLOWED_ORIGINS;

afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.BIBLE_API_ALLOWED_ORIGINS;
    else process.env.BIBLE_API_ALLOWED_ORIGINS = ORIGINAL;
});

function request(origin?: string): Request {
    return new Request("https://firstword.online/api/bibles", {
        headers: origin ? { origin } : undefined,
    });
}

describe("CORS", () => {
    it("allows any origin when no allowlist is configured", () => {
        delete process.env.BIBLE_API_ALLOWED_ORIGINS;

        const headers = corsHeaders("https://example.com");
        expect(headers["Access-Control-Allow-Origin"]).toBe("*");
        expect(headers["Vary"]).toBeUndefined();
    });

    it("echoes an allowlisted origin and varies on Origin", () => {
        process.env.BIBLE_API_ALLOWED_ORIGINS =
            "https://firstword.online, https://app.firstword.online";

        const headers = corsHeaders("https://app.firstword.online");
        expect(headers["Access-Control-Allow-Origin"]).toBe("https://app.firstword.online");
        expect(headers["Vary"]).toBe("Origin");
    });

    it("withholds the grant from an origin outside the allowlist", () => {
        process.env.BIBLE_API_ALLOWED_ORIGINS = "https://firstword.online";

        const headers = corsHeaders("https://evil.example");
        expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
        expect(headers["Vary"]).toBe("Origin");
    });

    it("still advertises the method surface to a non-allowlisted origin", () => {
        process.env.BIBLE_API_ALLOWED_ORIGINS = "https://firstword.online";

        const headers = corsHeaders(null);
        expect(headers["Access-Control-Allow-Methods"]).toBe("GET, HEAD, OPTIONS");
    });

    it("answers a preflight with 204 and no body", async () => {
        const response = preflightResponse(request("https://app.firstword.online"));

        expect(response.status).toBe(204);
        expect(response.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
        expect(response.headers.get("access-control-max-age")).toBe("86400");
        expect(await response.text()).toBe("");
    });
});
