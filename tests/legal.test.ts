import { describe, expect, it } from "vitest";

import { GET as getIndex, OPTIONS as optionsIndex } from "@/app/api/legal/route";
import { GET as getDocument, HEAD as headDocument } from "@/app/api/legal/[document]/route";
import { CONTACT_EMAIL } from "@/app/components/site-footer";
import { formatLastUpdated, LEGAL_DOCUMENTS, toMarkdown } from "@/lib/legal/documents";
import { BASE_URL, context, get, json } from "./helpers";

type Summary = {
    slug: string;
    title: string;
    description: string;
    lastUpdated: string;
    url: string;
    apiUrl: string;
};

type ApiInline =
    | { type: "text" | "strong"; text: string }
    | { type: "link"; text: string; href: string }
    | { type: "lineBreak" };

type ApiDocument = Summary & {
    lede: string;
    sections: {
        number: number;
        anchor: string;
        url: string;
        title: string;
        blocks: (
            | { type: "paragraph"; text: string; content: ApiInline[] }
            | { type: "heading" | "quote"; text: string }
            | { type: "list"; items: string[] }
        )[];
    }[];
};

function fetchDocument(slug: string, query = "", init?: RequestInit) {
    return getDocument(get(`/api/legal/${slug}${query}`, init), context({ document: slug }));
}

describe("GET /api/legal", () => {
    it("lists both documents with absolute URLs", async () => {
        const response = await getIndex(get("/api/legal"));
        expect(response.status).toBe(200);

        const { documents } = await json<{ documents: Summary[] }>(response);
        expect(documents.map(({ slug }) => slug)).toEqual(["terms", "privacy"]);
        expect(documents[0]).toMatchObject({
            title: "Terms of Use",
            lastUpdated: "2026-08-27",
            url: `${BASE_URL}/terms`,
            apiUrl: `${BASE_URL}/api/legal/terms`,
        });
        expect(documents[1]).toMatchObject({
            title: "Privacy Policy",
            lastUpdated: "2026-08-18",
            url: `${BASE_URL}/privacy`,
        });
    });

    it("answers a CORS preflight", async () => {
        expect((await optionsIndex(get("/api/legal"))).status).toBe(204);
    });
});

describe("GET /api/legal/:document", () => {
    it.each([
        ["terms", 31],
        ["privacy", 24],
    ])("returns every section of %s in order", async (slug, count) => {
        const response = await fetchDocument(slug);
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
        expect(response.headers.get("cache-control")).toContain("s-maxage=3600");

        const body = await json<ApiDocument>(response);
        expect(body.sections).toHaveLength(count);
        expect(body.sections.map(({ number }) => number)).toEqual(
            Array.from({ length: count }, (_, index) => index + 1),
        );
        expect(body.sections[0].anchor).toBe("section-01");
        expect(body.sections[0].url).toBe(`${BASE_URL}/${slug}#section-01`);
    });

    it("gives each paragraph a plain-text rendering alongside its rich content", async () => {
        const body = await json<ApiDocument>(await fetchDocument("terms"));
        const contact = body.sections.find(({ title }) => title === "Contact Us")!;
        const details = contact.blocks.find(
            (block) => block.type === "paragraph" && block.text.startsWith("Website:"),
        );

        expect(details).toEqual({
            type: "paragraph",
            text: `Website: firstword.online\nEmail: ${CONTACT_EMAIL}\nDeveloper: Alabo Excel`,
            content: [
                { type: "text", text: "Website: " },
                { type: "link", text: "firstword.online", href: "https://firstword.online" },
                { type: "lineBreak" },
                { type: "text", text: "Email: " },
                { type: "link", text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
                { type: "lineBreak" },
                { type: "text", text: "Developer: " },
                { type: "strong", text: "Alabo Excel" },
            ],
        });
    });

    it("resolves site-relative links against the request origin", async () => {
        const body = await json<ApiDocument>(await fetchDocument("terms"));
        const hrefs = body.sections.flatMap(({ blocks }) =>
            blocks.flatMap((block) =>
                block.type === "paragraph"
                    ? block.content.flatMap((inline) => (inline.type === "link" ? [inline.href] : []))
                    : [],
            ),
        );

        expect(hrefs).toContain(`${BASE_URL}/privacy`);
        expect(hrefs).toContain(`${BASE_URL}/delete-account`);
        expect(hrefs.every((href) => !href.startsWith("/"))).toBe(true);
    });

    it("exposes the last-updated date as a header, including on HEAD", async () => {
        const response = await headDocument(
            new Request(`${BASE_URL}/api/legal/privacy`, { method: "HEAD" }),
            context({ document: "privacy" }),
        );

        expect(response.status).toBe(200);
        expect(response.headers.get("x-document-last-updated")).toBe("2026-08-18");
        expect(response.headers.get("access-control-expose-headers")).toContain(
            "X-Document-Last-Updated",
        );
        expect(await response.text()).toBe("");
    });

    it("serves Markdown on request", async () => {
        const response = await fetchDocument("privacy", "?format=markdown");
        expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");

        const markdown = await response.text();
        expect(markdown.startsWith("# Privacy Policy\n\n_Last updated: August 18, 2026_")).toBe(true);
        expect(markdown).toContain("## 24. Summary");
        expect(markdown).toContain("### 1.1 Account Information");
        expect(markdown).toContain("- Email address\n- Name or display name");
        expect(markdown).toContain(`[${CONTACT_EMAIL}](<mailto:${CONTACT_EMAIL}>)`);
        expect(markdown).toContain("> FirstWord is designed to help you spend more time");
    });

    it("compresses large bodies when the client accepts it", async () => {
        const response = await fetchDocument("terms", "", { headers: { "accept-encoding": "br" } });
        expect(response.headers.get("content-encoding")).toBe("br");
    });

    it("rejects an unknown document with a 404 that is never cached", async () => {
        const response = await fetchDocument("cookies");
        expect(response.status).toBe(404);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect((await json<{ error: { code: string } }>(response)).error.code).toBe(
            "UNKNOWN_DOCUMENT",
        );
    });

    it("is case-sensitive about the document slug", async () => {
        expect((await fetchDocument("Terms")).status).toBe(404);
    });

    it("rejects an unsupported format", async () => {
        const response = await fetchDocument("terms", "?format=html");
        expect(response.status).toBe(400);
        expect((await json<{ error: { code: string } }>(response)).error.code).toBe("INVALID_FORMAT");
    });
});

describe("legal document data", () => {
    it.each(LEGAL_DOCUMENTS.map((document) => [document.slug, document] as const))(
        "%s has a valid date, contiguous sections and no empty blocks",
        (_, document) => {
            expect(document.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(formatLastUpdated(document.lastUpdated)).not.toBe("Invalid Date");
            document.sections.forEach((section, index) => {
                expect(section.number).toBe(index + 1);
                expect(section.blocks.length).toBeGreaterThan(0);
            });
            expect(toMarkdown(document, BASE_URL)).not.toMatch(/\n{3,}/);
        },
    );

    it("formats dates in UTC so the day never shifts", () => {
        expect(formatLastUpdated("2026-08-27")).toBe("August 27, 2026");
    });
});
