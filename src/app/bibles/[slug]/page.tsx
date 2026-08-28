import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import {
    btnInk,
    displayLg,
    displayMd,
    eyebrowOnInk,
    label,
    ledeOnInk,
    panel,
    panelPad,
    shell,
} from "../../components/styles";
import {
    ATTRIBUTION,
    getTranslationBySlug,
    TRANSLATIONS,
} from "@/lib/bible/translations";

type Params = { params: Promise<{ slug: string }> };

/** Two known slugs, so both pages are prerendered as static HTML. */
export function generateStaticParams() {
    return TRANSLATIONS.map((translation) => ({ slug: translation.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const translation = getTranslationBySlug((await params).slug);
    if (!translation) return {};
    return {
        title: translation.name,
        description: `${translation.blurb} Download all ${translation.verseCount.toLocaleString("en-US")} verses as JSON, or read it online.`,
    };
}

/** Rendered as a definition list so the facts read the same to a screen reader. */
function facts(translation: NonNullable<ReturnType<typeof getTranslationBySlug>>) {
    return [
        ["Translation", translation.name],
        ["Language", translation.language],
        ["Text direction", translation.direction],
        ["Source text", `${translation.source} (public domain)`],
        ["Verses", translation.verseCount.toLocaleString("en-US")],
        ["Translation ID", translation.id],
        ["Format", "Flat JSON array of {book, chapter, verse, text}"],
    ] as const;
}

export default async function TranslationPage({ params }: Params) {
    const translation = getTranslationBySlug((await params).slug);
    if (!translation) notFound();

    const downloadHref = `/api/bibles/${translation.id}/download`;
    const readHref = `/read?translation=${translation.id}`;

    return (
        <>
            <SiteHeader>
                <div className="pb-14 pt-8 sm:pb-20 sm:pt-12">
                    <p className={eyebrowOnInk}>{translation.language}</p>
                    <h1 className={`${displayLg} mt-5 max-w-[16ch]`}>{translation.name}</h1>
                    <p className={`${ledeOnInk} mt-7 max-w-[58ch]`}>{translation.blurb}</p>
                </div>
            </SiteHeader>

            <main className={`${shell} py-12 sm:py-16`}>
                <div className={`${panel} max-w-[68ch] divide-y divide-rule`}>
                    {/* Monochrome, so the caveat earns its weight from a heavy rule and a
                        filled band rather than from a colour. */}
                    <div className="border-l-4 border-l-foreground bg-surface-muted p-5 sm:p-6">
                        <p className="text-sm leading-6">
                            <strong className="font-bold uppercase tracking-[0.08em]">
                                Automated paraphrase.
                            </strong>{" "}
                            The wording is generated, not independently translated. It needs
                            editorial and theological review before it is published or preached
                            from, and it is not a critical text.
                        </p>
                    </div>

                    <section className={panelPad}>
                        <h2 className={displayMd}>Download the full translation</h2>
                        <p className="mt-4 text-base leading-7">
                            All {translation.verseCount.toLocaleString("en-US")} verses in one file,
                            in the same flat JSON shape the API serves.
                        </p>

                        <a
                            className={`${btnInk} mt-6 w-full uppercase tracking-[0.12em] sm:w-auto`}
                            href={downloadHref}
                            download={translation.downloadFilename}
                        >
                            Download JSON
                        </a>

                        <p className="mt-4 text-xs leading-5 text-muted">
                            Saves as{" "}
                            <span className="font-mono">{translation.downloadFilename}</span>. You
                            can also browse it{" "}
                            <Link className="underline decoration-1 underline-offset-4" href={readHref}>
                                online in the reader
                            </Link>
                            .
                        </p>
                    </section>

                    <section className={panelPad}>
                        <h2 className={label}>Details</h2>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,14ch)_minmax(0,1fr)] sm:gap-x-6">
                            {facts(translation).map(([term, value]) => (
                                <div className="contents" key={term}>
                                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                                        {term}
                                    </dt>
                                    <dd className="mb-2 text-sm leading-6 sm:mb-0">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className={panelPad}>
                        <h2 className={label}>API</h2>
                        <p className="mt-4 text-sm leading-6">
                            The same text is available over an unauthenticated JSON API.
                        </p>
                        <ul className="mt-4 grid gap-2 font-mono text-xs leading-6">
                            <li>GET /api/bibles</li>
                            <li>GET /api/bibles/{translation.id}</li>
                            <li>GET /api/bibles/{translation.id}/43/3</li>
                            <li>GET /api/bibles/{translation.id}/43/3/16</li>
                            <li>GET /api/bibles/{translation.id}/download</li>
                        </ul>
                    </section>

                    <section className={panelPad}>
                        <h2 className={label}>Attribution</h2>
                        <p className="mt-4 text-sm leading-6">{ATTRIBUTION}</p>
                    </section>
                </div>

                <p className="mt-10 text-sm">
                    <Link className="underline decoration-1 underline-offset-4" href="/bibles">
                        All translations
                    </Link>
                </p>
            </main>

            <SiteFooter />
        </>
    );
}
