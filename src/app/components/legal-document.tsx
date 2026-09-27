import type { Metadata } from "next";
import Link from "next/link";

import { formatLastUpdated } from "@/lib/legal/documents";
import { sectionAnchor, type Block, type Inline, type LegalDocument } from "@/lib/legal/types";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { displayLg, eyebrowOnInk, ledeOnInk, shell } from "./styles";

/**
 * Prose styling for the document body, applied once on the container as
 * arbitrary descendant variants rather than repeated on every block.
 * Note these descendant rules outrank a plain utility on the child itself, so
 * anything that needs to differ (the pull-quote) uses a non-<p> element.
 */
const prose = [
    "[&_p]:mb-4 [&_p]:text-base [&_p]:leading-[1.75] [&_p:last-child]:mb-0",
    "[&_ul]:mt-2 [&_ul]:mb-5 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:pl-5",
    "[&_li]:text-base [&_li]:leading-[1.75] marker:text-muted",
    "[&_h3]:mt-8 [&_h3]:mb-2.5 [&_h3]:text-[0.8rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[0.14em] [&_h3]:text-muted",
    "[&_strong]:font-bold",
    "[&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-1",
].join(" ");

export function legalMetadata(document: LegalDocument): Metadata {
    return { title: document.title, description: document.description };
}

function InlineContent({ inline }: { inline: Inline }) {
    switch (inline.type) {
        case "text":
            return inline.text;
        case "strong":
            return <strong>{inline.text}</strong>;
        case "link":
            return inline.href.startsWith("/") ? (
                <Link href={inline.href}>{inline.text}</Link>
            ) : (
                <a href={inline.href}>{inline.text}</a>
            );
        case "lineBreak":
            return <br />;
    }
}

function BlockContent({ block }: { block: Block }) {
    switch (block.type) {
        case "paragraph":
            return (
                <p>
                    {block.content.map((inline, index) => (
                        <InlineContent inline={inline} key={index} />
                    ))}
                </p>
            );
        case "heading":
            return <h3>{block.text}</h3>;
        case "list":
            return (
                <ul>
                    {block.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            );
        case "quote":
            return (
                <blockquote className="my-6 border-l-[3px] border-foreground pl-5 text-[1.2rem] leading-[1.55]">
                    {block.text}
                </blockquote>
            );
    }
}

/**
 * The Terms of Use and Privacy Policy pages. The copy comes from
 * `src/lib/legal`, the same data `GET /api/legal/:document` serves.
 */
export function LegalDocumentPage({ document }: { document: LegalDocument }) {
    return (
        <div className="min-h-screen">
            <SiteHeader hide={[document.slug]}>
                <div className="pb-16 pt-4 sm:pb-20">
                    <p className={eyebrowOnInk}>{document.eyebrow}</p>
                    <h1 className={`${displayLg} mt-5 max-w-[16ch]`} id="top">
                        {document.title}
                    </h1>
                    <p className={`${ledeOnInk} mt-7 max-w-[58ch]`}>{document.lede}</p>
                    <span className="mt-9 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-on-ink-muted">
                        Last updated: {formatLastUpdated(document.lastUpdated)}
                    </span>
                </div>
            </SiteHeader>

            <div
                className={`${shell} grid items-start gap-10 py-12 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-[clamp(3rem,6vw,6rem)] lg:py-18`}
            >
                {/* 20-30 sections is too many to scan by scrolling — this is the way in. */}
                <nav
                    className="border border-rule bg-surface-muted p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:border-0 lg:border-l lg:bg-transparent lg:p-0 lg:pl-5"
                    aria-label={`${document.title[0]}${document.title.slice(1).toLowerCase()} contents`}
                >
                    <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted">
                        On this page
                    </p>
                    <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-5 gap-y-2 p-0 lg:grid-cols-1">
                        {document.sections.map(({ number, title }) => (
                            <li key={number}>
                                <a
                                    className="grid grid-cols-[1.6rem_minmax(0,1fr)] text-[0.8rem] leading-[1.4] text-muted no-underline transition-colors duration-150 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none"
                                    href={`#${sectionAnchor(number)}`}
                                >
                                    <span className="font-semibold tabular-nums text-foreground">
                                        {number}
                                    </span>
                                    <span>{title}</span>
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <main
                    className={`min-w-0 max-w-[68ch] divide-y divide-rule border border-rule bg-surface p-6 sm:p-10 lg:p-14 ${prose}`}
                >
                    {document.sections.map(({ number, title, blocks }) => (
                        <section
                            className="scroll-mt-6 py-12 first:pt-0 last:pb-0"
                            id={sectionAnchor(number)}
                            key={number}
                        >
                            <span className="mb-3 block text-[0.7rem] font-semibold uppercase tabular-nums tracking-[0.2em] text-muted">
                                Section {number}
                            </span>
                            <h2 className="mb-5 text-[clamp(1.5rem,3.2vw,2.15rem)] font-normal leading-[1.1] tracking-[-0.035em] text-balance">
                                {title}
                            </h2>
                            {blocks.map((block, index) => (
                                <BlockContent block={block} key={index} />
                            ))}
                        </section>
                    ))}
                </main>
            </div>

            <SiteFooter />
        </div>
    );
}
