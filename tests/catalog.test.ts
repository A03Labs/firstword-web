import { describe, expect, it } from "vitest";

import { GET as getCatalog, HEAD as headCatalog, OPTIONS as optionsCatalog } from "@/app/api/bibles/route";
import { GET as getTranslationRoute } from "@/app/api/bibles/[translationId]/route";
import { ALLOWED_METHODS } from "@/lib/bible/http";
import { context, get, json } from "./helpers";

type Catalog = {
    translations: {
        id: string;
        name: string;
        language: string;
        direction: string;
        source: string;
        verseCount: number;
    }[];
};

describe("GET /api/bibles", () => {
    it("returns both translations in the documented shape", async () => {
        const response = await getCatalog(get("/api/bibles"));

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");

        const body = await json<Catalog>(response);
        expect(body).toEqual({
            translations: [
                {
                    id: "GENZ",
                    name: "Gen Z Bible",
                    language: "English",
                    direction: "ltr",
                    source: "World English Bible",
                    verseCount: 31105,
                },
                {
                    id: "PIDGIN",
                    name: "Nigerian Pidgin Bible",
                    language: "Nigerian Pidgin",
                    direction: "ltr",
                    source: "World English Bible",
                    verseCount: 31105,
                },
            ],
        });
    });

    it("is cacheable for an hour with stale-while-revalidate", async () => {
        const cacheControl = (await getCatalog(get("/api/bibles"))).headers.get("cache-control");

        expect(cacheControl).toContain("s-maxage=3600");
        expect(cacheControl).toContain("stale-while-revalidate=");
        expect(cacheControl).not.toContain("no-store");
    });

    it("allows cross-origin reads", async () => {
        const response = await getCatalog(
            get("/api/bibles", { headers: { origin: "https://app.firstword.online" } }),
        );

        expect(response.headers.get("access-control-allow-origin")).toBe("*");
    });

    it("answers HEAD with headers and no body", async () => {
        const response = await headCatalog(get("/api/bibles"));

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
        expect(await response.text()).toBe("");
    });

    it("answers an OPTIONS preflight with the allowed methods", async () => {
        const response = await optionsCatalog(
            get("/api/bibles", { headers: { origin: "https://app.firstword.online" } }),
        );

        expect(response.status).toBe(204);
        expect(response.headers.get("access-control-allow-methods")).toBe(ALLOWED_METHODS);
        expect(response.headers.get("access-control-allow-methods")).toBe("GET, HEAD, OPTIONS");
        expect(response.headers.get("access-control-max-age")).toBe("86400");
    });
});

describe("GET /api/bibles/:translationId", () => {
    it("reports the per-chapter structure", async () => {
        const response = await getTranslationRoute(
            get("/api/bibles/GENZ"),
            context({ translationId: "GENZ" }),
        );

        expect(response.status).toBe(200);
        const body = await json<{
            id: string;
            verseCount: number;
            downloadUrl: string;
            books: { book: number; name: string; chapters: { chapter: number; verseCount: number }[] }[];
        }>(response);

        expect(body.id).toBe("GENZ");
        expect(body.verseCount).toBe(31105);
        expect(body.downloadUrl).toBe("/api/bibles/GENZ/download");
        expect(body.books).toHaveLength(66);
        expect(body.books[0]).toMatchObject({ book: 1, name: "Genesis" });
        expect(body.books[0].chapters[0]).toEqual({ chapter: 1, verseCount: 31 });
        expect(body.books[42]).toMatchObject({ book: 43, name: "John" });

        const total = body.books.reduce(
            (sum, book) => sum + book.chapters.reduce((inner, entry) => inner + entry.verseCount, 0),
            0,
        );
        expect(total).toBe(31105);
    });

    it("404s for a translation it does not host", async () => {
        const response = await getTranslationRoute(
            get("/api/bibles/KJV"),
            context({ translationId: "KJV" }),
        );

        expect(response.status).toBe(404);
        expect(await json(response)).toEqual({
            error: {
                code: "UNKNOWN_TRANSLATION",
                message: "Unknown translation. Available translations: GENZ, PIDGIN.",
            },
        });
    });
});
