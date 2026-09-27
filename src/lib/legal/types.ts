/**
 * The shape of a legal document (Terms of Use, Privacy Policy) and the small
 * builders the documents are written with.
 *
 * The copy lives as data rather than JSX so that the web pages and the public
 * `/api/legal` endpoints render from one source and cannot drift apart. The
 * block vocabulary is deliberately tiny — exactly what the documents use — so a
 * mobile client can render every block type without a general-purpose HTML or
 * rich-text engine.
 */

/** A run of text inside a paragraph. */
export type Inline =
    | { type: "text"; text: string }
    | { type: "strong"; text: string }
    | { type: "link"; text: string; href: string }
    | { type: "lineBreak" };

export type Block =
    | { type: "paragraph"; content: Inline[] }
    | { type: "heading"; text: string }
    | { type: "list"; items: string[] }
    | { type: "quote"; text: string };

export type LegalSection = {
    /** 1-based position in the document; also the anchor (`section-01`). */
    number: number;
    title: string;
    blocks: Block[];
};

export type LegalSlug = "terms" | "privacy";

export type LegalDocument = {
    slug: LegalSlug;
    title: string;
    /** One-sentence summary, used for page metadata. */
    description: string;
    /** The small line above the page title. */
    eyebrow: string;
    /** The introductory sentence under the page title. */
    lede: string;
    /** ISO date (`YYYY-MM-DD`) the document last changed. */
    lastUpdated: string;
    /** Site path of the human-readable page. */
    path: `/${LegalSlug}`;
    sections: LegalSection[];
};

/** Anchor id of a section on its page, e.g. `section-07`. */
export function sectionAnchor(number: number): string {
    return `section-${String(number).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Builders. Each returns the canonical shape above; they exist only to keep
// the document files readable.
// ---------------------------------------------------------------------------

export function section(number: number, title: string, blocks: Block[]): LegalSection {
    return { number, title, blocks };
}

/** A paragraph from plain strings and inline builders, in reading order. */
export function paragraph(...parts: (string | Inline)[]): Block {
    return {
        type: "paragraph",
        content: parts.map((part) => (typeof part === "string" ? { type: "text", text: part } : part)),
    };
}

export function heading(text: string): Block {
    return { type: "heading", text };
}

export function list(items: string[]): Block {
    return { type: "list", items };
}

export function quote(text: string): Block {
    return { type: "quote", text };
}

export function strong(text: string): Inline {
    return { type: "strong", text };
}

/** `href` is a site path (`/privacy`) or an absolute URL, including `mailto:`. */
export function link(text: string, href: string): Inline {
    return { type: "link", text, href };
}

export const lineBreak: Inline = { type: "lineBreak" };
