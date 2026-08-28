import { describe, expect, it } from "vitest";

import { GET as getDownload, HEAD as headDownload, OPTIONS as optionsDownload } from "@/app/api/bibles/[translationId]/download/route";
import { TRANSLATIONS } from "@/lib/bible/translations";
import { context, get, json } from "./helpers";

type SourceVerse = { book: number; chapter: number; verse: number; text: string };

function download(translationId: string) {
    return getDownload(
        get(`/api/bibles/${translationId}/download`),
        context({ translationId }),
    );
}

describe("GET /api/bibles/:translationId/download", () => {
    it.each(TRANSLATIONS.map((translation) => [translation.id, translation.downloadFilename]))(
        "serves the complete %s file as an attachment named %s",
        async (translationId, filename) => {
            const response = await download(translationId);

            expect(response.status).toBe(200);
            expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
            expect(response.headers.get("content-disposition")).toBe(
                `attachment; filename="${filename}"`,
            );
            expect(Number(response.headers.get("content-length"))).toBeGreaterThan(1_000_000);

            const body = await json<SourceVerse[]>(response);
            expect(Array.isArray(body)).toBe(true);
            expect(body).toHaveLength(31105);

            // The original flat shape: four keys, no wrapper object.
            expect(Object.keys(body[0]).sort()).toEqual(["book", "chapter", "text", "verse"]);
            expect(body[0]).toMatchObject({ book: 1, chapter: 1, verse: 1 });
            expect(body.at(-1)).toMatchObject({ book: 66, chapter: 22, verse: 21 });
        },
    );

    it("is cacheable for an hour", async () => {
        const cacheControl = (await download("GENZ")).headers.get("cache-control");

        expect(cacheControl).toContain("s-maxage=3600");
        expect(cacheControl).toContain("stale-while-revalidate=");
    });

    it("answers HEAD with the download headers and no body", async () => {
        const response = await headDownload(
            get("/api/bibles/PIDGIN/download"),
            context({ translationId: "PIDGIN" }),
        );

        expect(response.status).toBe(200);
        expect(response.headers.get("content-disposition")).toBe(
            'attachment; filename="pidgin-bible.json"',
        );
        expect(Number(response.headers.get("content-length"))).toBeGreaterThan(1_000_000);
        expect(await response.text()).toBe("");
    });

    it("answers an OPTIONS preflight", async () => {
        const response = await optionsDownload(get("/api/bibles/GENZ/download"));

        expect(response.status).toBe(204);
        expect(response.headers.get("access-control-allow-methods")).toBe("GET, HEAD, OPTIONS");
    });

    it("404s for an unknown translation without a Content-Disposition", async () => {
        const response = await download("KJV");

        expect(response.status).toBe(404);
        expect(response.headers.get("content-disposition")).toBeNull();
        expect(await json(response)).toMatchObject({
            error: { code: "UNKNOWN_TRANSLATION" },
        });
    });
});
