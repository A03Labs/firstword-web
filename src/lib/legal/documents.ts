/**
 * The legal-document registry and the two wire formats the API serves.
 *
 * `toApiDocument` is the JSON shape; `toMarkdown` is the same content for
 * clients that already render Markdown. Both resolve site-relative links
 * (`/privacy`) against the request's origin, so a native app can open them
 * without knowing which host it is talking to.
 */

import { PRIVACY_POLICY } from "./privacy";
import { TERMS_OF_USE } from "./terms";
import { sectionAnchor, type Block, type Inline, type LegalDocument, type LegalSlug } from "./types";

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [TERMS_OF_USE, PRIVACY_POLICY];

/** Lookup by URL segment. Exact and case-sensitive, like the Bible IDs. */
export function getLegalDocument(slug: string): LegalDocument | undefined {
    return LEGAL_DOCUMENTS.find((document) => document.slug === slug);
}

/** `2026-08-27` → `August 27, 2026`. Formatted in UTC so the day never shifts. */
export function formatLastUpdated(isoDate: string): string {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

function absolute(href: string, origin: string): string {
    return href.startsWith("/") ? `${origin}${href}` : href;
}

/** A paragraph as plain text; line breaks become `\n`. */
export function paragraphText(content: Inline[]): string {
    return content.map((inline) => (inline.type === "lineBreak" ? "\n" : inline.text)).join("");
}

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

export type ApiBlock =
    | { type: "paragraph"; text: string; content: Inline[] }
    | Exclude<Block, { type: "paragraph" }>;

function toApiBlock(block: Block, origin: string): ApiBlock {
    if (block.type !== "paragraph") return block;
    const content = block.content.map((inline) =>
        inline.type === "link" ? { ...inline, href: absolute(inline.href, origin) } : inline,
    );
    return { type: "paragraph", text: paragraphText(content), content };
}

/** Summary row for `GET /api/legal`. */
export function toApiSummary(document: LegalDocument, origin: string) {
    return {
        slug: document.slug,
        title: document.title,
        description: document.description,
        lastUpdated: document.lastUpdated,
        url: absolute(document.path, origin),
        apiUrl: `${origin}/api/legal/${document.slug}`,
    };
}

/** Full document for `GET /api/legal/:slug`. */
export function toApiDocument(document: LegalDocument, origin: string) {
    const url = absolute(document.path, origin);
    return {
        ...toApiSummary(document, origin),
        lede: document.lede,
        sections: document.sections.map(({ number, title, blocks }) => ({
            number,
            anchor: sectionAnchor(number),
            url: `${url}#${sectionAnchor(number)}`,
            title,
            blocks: blocks.map((block) => toApiBlock(block, origin)),
        })),
    };
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

/** Escapes the characters that would otherwise start Markdown syntax mid-text. */
function escapeMarkdown(text: string): string {
    return text.replace(/([\\`*_[\]<>])/g, "\\$1");
}

function inlineMarkdown(inline: Inline, origin: string): string {
    switch (inline.type) {
        case "text":
            return escapeMarkdown(inline.text);
        case "strong":
            return `**${escapeMarkdown(inline.text)}**`;
        case "link":
            return `[${escapeMarkdown(inline.text)}](<${absolute(inline.href, origin)}>)`;
        case "lineBreak":
            // A trailing backslash is CommonMark's hard line break.
            return "\\\n";
    }
}

function blockMarkdown(block: Block, origin: string): string {
    switch (block.type) {
        case "paragraph":
            return block.content.map((inline) => inlineMarkdown(inline, origin)).join("");
        case "heading":
            return `### ${escapeMarkdown(block.text)}`;
        case "list":
            return block.items.map((item) => `- ${escapeMarkdown(item)}`).join("\n");
        case "quote":
            return `> ${escapeMarkdown(block.text)}`;
    }
}

export function toMarkdown(document: LegalDocument, origin: string): string {
    const parts = [
        `# ${document.title}`,
        `_Last updated: ${formatLastUpdated(document.lastUpdated)}_`,
        escapeMarkdown(document.lede),
        ...document.sections.flatMap((section) => [
            `## ${section.number}. ${escapeMarkdown(section.title)}`,
            ...section.blocks.map((block) => blockMarkdown(block, origin)),
        ]),
    ];
    return `${parts.join("\n\n")}\n`;
}

export type { LegalDocument, LegalSlug };
