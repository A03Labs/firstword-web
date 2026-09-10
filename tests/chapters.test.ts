import { describe, expect, it } from "vitest";

import { GET as getChapter, HEAD as headChapter } from "@/app/api/bibles/[translationId]/[book]/[chapter]/route";
import { GET as getVerse } from "@/app/api/bibles/[translationId]/[book]/[chapter]/[verse]/route";
import { context, get, json } from "./helpers";

type ChapterBody = {
    translationId: string;
    book: number;
    chapter: number;
    verses: { verse: number; text: string }[];
};

async function chapter(translationId: string, book: string, chapterNumber: string) {
    return getChapter(
        get(`/api/bibles/${translationId}/${book}/${chapterNumber}`),
        context({ translationId, book, chapter: chapterNumber }),
    );
}

async function verse(translationId: string, book: string, chapterNumber: string, verseNumber: string) {
    return getVerse(
        get(`/api/bibles/${translationId}/${book}/${chapterNumber}/${verseNumber}`),
        context({ translationId, book, chapter: chapterNumber, verse: verseNumber }),
    );
}

describe("GET /api/bibles/:translationId/:book/:chapter", () => {
    it("returns Genesis 1 with all 31 verses", async () => {
        const response = await chapter("GENZ", "1", "1");

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");

        const body = await json<ChapterBody>(response);
        expect(body.translationId).toBe("GENZ");
        expect(body.book).toBe(1);
        expect(body.chapter).toBe(1);
        expect(body.verses).toHaveLength(31);
        expect(body.verses[0].verse).toBe(1);
        expect(body.verses[0].text).toBe("At the very start, God created the heavens and the earth.");
        expect(body.verses.map((entry) => entry.verse)).toEqual(
            Array.from({ length: 31 }, (_, index) => index + 1),
        );
    });

    it("returns John 3 for both translations", async () => {
        for (const translationId of ["GENZ", "PIDGIN"]) {
            const response = await chapter(translationId, "43", "3");

            expect(response.status).toBe(200);
            const body = await json<ChapterBody>(response);
            expect(body).toMatchObject({ translationId, book: 43, chapter: 3 });
            expect(body.verses).toHaveLength(36);
            expect(body.verses[15].verse).toBe(16);
            expect(body.verses[15].text.length).toBeGreaterThan(20);
        }
    });

    it("gives the two translations different wording for the same reference", async () => {
        const genz = await json<ChapterBody>(await chapter("GENZ", "43", "3"));
        const pidgin = await json<ChapterBody>(await chapter("PIDGIN", "43", "3"));

        expect(genz.verses).toHaveLength(pidgin.verses.length);
        const differing = genz.verses.filter(
            (entry, index) => entry.text !== pidgin.verses[index].text,
        );
        expect(differing.length).toBeGreaterThan(0);
    });

    it("is cacheable and cross-origin readable", async () => {
        const response = await chapter("GENZ", "43", "3");

        expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
        expect(response.headers.get("cache-control")).toContain("stale-while-revalidate=");
        expect(response.headers.get("access-control-allow-origin")).toBe("*");
    });

    it("answers HEAD without a body", async () => {
        const response = await headChapter(
            get("/api/bibles/GENZ/43/3"),
            context({ translationId: "GENZ", book: "43", chapter: "3" }),
        );

        expect(response.status).toBe(200);
        expect(await response.text()).toBe("");
    });
});

describe("GET /api/bibles/:translationId/:book/:chapter/:verse", () => {
    it("returns a single verse", async () => {
        const response = await verse("GENZ", "43", "3", "16");

        expect(response.status).toBe(200);
        const body = await json<{
            translationId: string;
            book: number;
            chapter: number;
            verse: number;
            text: string;
        }>(response);

        expect(body).toMatchObject({ translationId: "GENZ", book: 43, chapter: 3, verse: 16 });
        expect(typeof body.text).toBe("string");
        expect(body.text.length).toBeGreaterThan(20);
    });

    it("returns the verse whose text matches the chapter payload", async () => {
        const chapterBody = await json<ChapterBody>(await chapter("PIDGIN", "19", "23"));
        const single = await json<{ text: string }>(await verse("PIDGIN", "19", "23", "1"));

        expect(single.text).toBe(chapterBody.verses[0].text);
    });

    it("404s for a verse past the end of the chapter", async () => {
        const response = await verse("GENZ", "1", "1", "999");

        expect(response.status).toBe(404);
        expect(await json(response)).toEqual({
            error: {
                code: "VERSE_NOT_FOUND",
                message: "Genesis 1:999 is not available in GENZ.",
            },
        });
        expect(response.headers.get("cache-control")).toBe("no-store");
    });
});
