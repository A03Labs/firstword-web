import { brotliDecompressSync, gunzipSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import { GET as getChapter } from "@/app/api/bibles/[translationId]/[book]/[chapter]/route";
import { context, get } from "./helpers";

/** Psalm 119, the longest chapter — comfortably over the compression threshold. */
function longChapter(acceptEncoding?: string) {
    return getChapter(
        get("/api/bibles/GENZ/19/119", {
            headers: acceptEncoding ? { "accept-encoding": acceptEncoding } : undefined,
        }),
        context({ translationId: "GENZ", book: "19", chapter: "119" }),
    );
}

async function bodyBytes(response: Response): Promise<Buffer> {
    return Buffer.from(await response.arrayBuffer());
}

describe("response compression", () => {
    it("does not compress when the client does not ask", async () => {
        const response = await longChapter();

        expect(response.headers.get("content-encoding")).toBeNull();
        expect(response.headers.get("vary")).toBeNull();
        expect(JSON.parse(await response.text()).verses).toHaveLength(176);
    });

    it("prefers Brotli, and the payload round-trips", async () => {
        const response = await longChapter("gzip, deflate, br");

        expect(response.headers.get("content-encoding")).toBe("br");
        expect(response.headers.get("vary")).toBe("Accept-Encoding");
        expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");

        const compressed = await bodyBytes(response);
        const decoded = JSON.parse(brotliDecompressSync(compressed).toString("utf8"));

        expect(decoded).toMatchObject({ translationId: "GENZ", book: 19, chapter: 119 });
        expect(decoded.verses).toHaveLength(176);

        // The declared length must match what was actually sent.
        expect(Number(response.headers.get("content-length"))).toBe(compressed.byteLength);
        expect(compressed.byteLength).toBeLessThan(
            Buffer.byteLength(JSON.stringify(decoded), "utf8") / 2,
        );
    });

    it("falls back to gzip when Brotli is not offered", async () => {
        const response = await longChapter("gzip, deflate");

        expect(response.headers.get("content-encoding")).toBe("gzip");

        const decoded = JSON.parse(gunzipSync(await bodyBytes(response)).toString("utf8"));
        expect(decoded.verses).toHaveLength(176);
    });

    it("honours an explicit q=0 refusal", async () => {
        const brRefused = await longChapter("br;q=0, gzip");
        expect(brRefused.headers.get("content-encoding")).toBe("gzip");

        const allRefused = await longChapter("br;q=0, gzip;q=0");
        expect(allRefused.headers.get("content-encoding")).toBeNull();
    });

    it("leaves a short body uncompressed", async () => {
        // Psalm 117 is the shortest chapter in the canon at ~260 bytes, well
        // under the 1 KB threshold where compression would only add overhead.
        const response = await getChapter(
            get("/api/bibles/GENZ/19/117", { headers: { "accept-encoding": "br, gzip" } }),
            context({ translationId: "GENZ", book: "19", chapter: "117" }),
        );

        const raw = await response.text();
        expect(Buffer.byteLength(raw, "utf8")).toBeLessThan(1024);
        expect(response.headers.get("content-encoding")).toBeNull();
        expect(JSON.parse(raw)).toMatchObject({ book: 19, chapter: 117 });
    });

    it("keeps Vary: Origin when an allowlist is configured alongside compression", async () => {
        const previous = process.env.BIBLE_API_ALLOWED_ORIGINS;
        process.env.BIBLE_API_ALLOWED_ORIGINS = "https://firstword.online";
        try {
            const response = await getChapter(
                get("/api/bibles/GENZ/19/119", {
                    headers: {
                        "accept-encoding": "br",
                        origin: "https://firstword.online",
                    },
                }),
                context({ translationId: "GENZ", book: "19", chapter: "119" }),
            );

            const vary = response.headers.get("vary") ?? "";
            expect(vary).toContain("Origin");
            expect(vary).toContain("Accept-Encoding");
        } finally {
            if (previous === undefined) delete process.env.BIBLE_API_ALLOWED_ORIGINS;
            else process.env.BIBLE_API_ALLOWED_ORIGINS = previous;
        }
    });
});
