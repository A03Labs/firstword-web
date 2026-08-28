import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { GET as getChapter } from "@/app/api/bibles/[translationId]/[book]/[chapter]/route";
import { GET as getDownload } from "@/app/api/bibles/[translationId]/download/route";
import { GET as getTranslationRoute } from "@/app/api/bibles/[translationId]/route";
import { chapterFilePath, DATA_ROOT } from "@/lib/bible/paths";
import { getTranslation, TRANSLATIONS } from "@/lib/bible/translations";
import { context, get, json } from "./helpers";

type ErrorBody = { error: { code: string; message: string } };

/**
 * Segments a caller could use to try to escape the data directory, in raw,
 * percent-encoded, double-encoded, backslash, and null-byte forms. Next decodes
 * path segments before handing them to a handler, so both the encoded and the
 * decoded spellings are worth asserting.
 */
const TRAVERSAL_SEGMENTS = [
    "..",
    "../..",
    "../../../etc/passwd",
    "..%2f..%2fetc%2fpasswd",
    "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    "%252e%252e%252fetc%252fpasswd",
    "..\\..\\windows\\system32",
    "/etc/passwd",
    "....//....//etc/passwd",
    "1/../../../full",
    "\0",
    "1\0.json",
    "full",
    "index",
    "chapters",
    ".",
];

describe("path traversal", () => {
    it.each(TRAVERSAL_SEGMENTS)("rejects %o as a translation id", async (segment) => {
        const response = await getDownload(
            get(`/api/bibles/${encodeURIComponent(segment)}/download`),
            context({ translationId: segment }),
        );

        expect(response.status).toBe(404);
        expect((await json<ErrorBody>(response)).error.code).toBe("UNKNOWN_TRANSLATION");
        expect(response.headers.get("content-disposition")).toBeNull();
    });

    it.each(TRAVERSAL_SEGMENTS)("rejects %o as a book number", async (segment) => {
        const response = await getChapter(
            get(`/api/bibles/GENZ/${encodeURIComponent(segment)}/1`),
            context({ translationId: "GENZ", book: segment, chapter: "1" }),
        );

        expect(response.status).toBe(400);
        expect((await json<ErrorBody>(response)).error.code).toBe("INVALID_BOOK");
    });

    it.each(TRAVERSAL_SEGMENTS)("rejects %o as a chapter number", async (segment) => {
        const response = await getChapter(
            get(`/api/bibles/GENZ/1/${encodeURIComponent(segment)}`),
            context({ translationId: "GENZ", book: "1", chapter: segment }),
        );

        expect(response.status).toBe(400);
        expect((await json<ErrorBody>(response)).error.code).toBe("INVALID_CHAPTER");
    });

    it("never reads outside the data root, whatever the parameters", () => {
        // Every path the API can build is derived from allowlisted ids and
        // validated integers, so the builder itself can be asserted directly.
        for (const translation of TRANSLATIONS) {
            const built = chapterFilePath(translation, 43, 3);
            expect(built.startsWith(DATA_ROOT + path.sep)).toBe(true);
            expect(built).not.toContain("..");
        }
    });

    it("refuses to build a chapter path from non-integer input", () => {
        const genz = getTranslation("GENZ")!;

        expect(() => chapterFilePath(genz, Number.NaN, 1)).toThrow();
        expect(() => chapterFilePath(genz, 1.5, 1)).toThrow();
        expect(() => chapterFilePath(genz, 1, Number.POSITIVE_INFINITY)).toThrow();
    });

    it("does not name internal paths in an error body", async () => {
        const responses = await Promise.all([
            getDownload(
                get("/api/bibles/x/download"),
                context({ translationId: "../../etc/passwd" }),
            ),
            getTranslationRoute(get("/api/bibles/x"), context({ translationId: "../.." })),
        ]);

        for (const response of responses) {
            const raw = await response.text();
            expect(raw).not.toContain(DATA_ROOT);
            expect(raw).not.toContain("data/bibles");
            expect(raw).not.toContain("etc/passwd");
        }
    });
});

describe("method surface", () => {
    it("exports only GET, HEAD, and OPTIONS", async () => {
        const routeFiles = [
            "src/app/api/bibles/route.ts",
            "src/app/api/bibles/[translationId]/route.ts",
            "src/app/api/bibles/[translationId]/download/route.ts",
            "src/app/api/bibles/[translationId]/[book]/[chapter]/route.ts",
            "src/app/api/bibles/[translationId]/[book]/[chapter]/[verse]/route.ts",
        ];

        for (const file of routeFiles) {
            const source = await readFile(path.join(process.cwd(), file), "utf8");
            const exported = [...source.matchAll(/export async function ([A-Z]+)\(/g)].map(
                (match) => match[1],
            );

            expect(exported.sort()).toEqual(["GET", "HEAD", "OPTIONS"]);
            // Anything else must reach Next's automatic 405.
            for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
                expect(source).not.toContain(`export async function ${method}(`);
            }
        }
    });
});
