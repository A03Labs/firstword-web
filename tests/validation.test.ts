import { describe, expect, it } from "vitest";

import { GET as getChapter } from "@/app/api/bibles/[translationId]/[book]/[chapter]/route";
import { GET as getVerse } from "@/app/api/bibles/[translationId]/[book]/[chapter]/[verse]/route";
import { context, get, json } from "./helpers";

type ErrorBody = { error: { code: string; message: string } };

function chapter(translationId: string, book: string, chapterNumber: string) {
    return getChapter(
        get(`/api/bibles/${translationId}/${book}/${chapterNumber}`),
        context({ translationId, book, chapter: chapterNumber }),
    );
}

function verse(translationId: string, book: string, chapterNumber: string, verseNumber: string) {
    return getVerse(
        get(`/api/bibles/${translationId}/${book}/${chapterNumber}/${verseNumber}`),
        context({ translationId, book, chapter: chapterNumber, verse: verseNumber }),
    );
}

describe("translation validation", () => {
    it.each(["KJV", "genz", "Genz", "", "GENZ "])("404s on translation %o", async (id) => {
        const response = await chapter(id, "1", "1");

        expect(response.status).toBe(404);
        expect((await json<ErrorBody>(response)).error.code).toBe("UNKNOWN_TRANSLATION");
    });
});

describe("book validation", () => {
    it.each(["0", "67", "99", "abc", "1.5", "-1", "+1", "01", " 1", "1 ", "0x2b", "1e2", "NaN", "Infinity"])(
        "400s on book %o",
        async (book) => {
            const response = await chapter("GENZ", book, "1");

            expect(response.status).toBe(400);
            const body = await json<ErrorBody>(response);
            expect(body.error.code).toBe("INVALID_BOOK");
            expect(body.error.message).toBe("Book must be an integer from 1 to 66.");
            expect(response.headers.get("cache-control")).toBe("no-store");
        },
    );

    it("accepts the first and last book", async () => {
        expect((await chapter("GENZ", "1", "1")).status).toBe(200);
        expect((await chapter("GENZ", "66", "22")).status).toBe(200);
    });
});

describe("chapter validation", () => {
    it.each(["0", "abc", "-3", "3.0", "01", ""])("400s on chapter %o", async (value) => {
        const response = await chapter("GENZ", "1", value);

        expect(response.status).toBe(400);
        const body = await json<ErrorBody>(response);
        expect(body.error.code).toBe("INVALID_CHAPTER");
        expect(body.error.message).toBe("Chapter must be a positive integer.");
    });

    it("404s on a chapter that is well-formed but past the end of the book", async () => {
        // Genesis has 50 chapters.
        const response = await chapter("GENZ", "1", "51");

        expect(response.status).toBe(404);
        const body = await json<ErrorBody>(response);
        expect(body.error.code).toBe("CHAPTER_NOT_FOUND");
        expect(body.error.message).toBe("Chapter 51 does not exist in book 1.");
        expect(response.headers.get("cache-control")).toBe("no-store");
    });
});

describe("verse validation", () => {
    it.each(["0", "abc", "-1", "16.0", "016"])("400s on verse %o", async (value) => {
        const response = await verse("GENZ", "43", "3", value);

        expect(response.status).toBe(400);
        const body = await json<ErrorBody>(response);
        expect(body.error.code).toBe("INVALID_VERSE");
        expect(body.error.message).toBe("Verse must be a positive integer.");
    });

    it("validates the book before the verse, so one bad segment gives one clear error", async () => {
        const response = await verse("GENZ", "0", "3", "0");

        expect(response.status).toBe(400);
        expect((await json<ErrorBody>(response)).error.code).toBe("INVALID_BOOK");
    });
});

describe("error envelope", () => {
    it("uses one shape for every failure and leaks nothing internal", async () => {
        const responses = await Promise.all([
            chapter("KJV", "1", "1"),
            chapter("GENZ", "0", "1"),
            chapter("GENZ", "1", "0"),
            chapter("GENZ", "1", "51"),
            verse("GENZ", "1", "1", "999"),
        ]);

        for (const response of responses) {
            const body = await json<ErrorBody>(response);
            expect(Object.keys(body)).toEqual(["error"]);
            expect(Object.keys(body.error).sort()).toEqual(["code", "message"]);
            expect(typeof body.error.code).toBe("string");
            expect(body.error.message).not.toMatch(/[/\\](Users|home|var|data)[/\\]/);
            expect(body.error.message).not.toContain("full.json");
            expect(body.error.message).not.toContain(process.cwd());
        }
    });
});
