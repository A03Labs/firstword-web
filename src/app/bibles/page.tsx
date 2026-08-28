import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
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
} from "../components/styles";
import { ATTRIBUTION, TRANSLATIONS } from "@/lib/bible/translations";

export const metadata: Metadata = {
    title: "Bible Translations",
    description:
        "Download the Gen Z and Nigerian Pidgin editions of the World English Bible as JSON, or read them online.",
};

export default function BiblesIndexPage() {
    return (
        <>
            <SiteHeader>
                <div className="pb-14 pt-8 sm:pb-20 sm:pt-12">
                    <p className={eyebrowOnInk}>Open data</p>
                    <h1 className={`${displayLg} mt-5 max-w-[16ch]`}>Bible translations.</h1>
                    <p className={`${ledeOnInk} mt-7 max-w-[58ch]`}>
                        Two paraphrase editions of the public-domain World English Bible, published
                        as flat JSON and readable in the browser. Free to download, no account
                        needed.
                    </p>
                </div>
            </SiteHeader>

            <main className={`${shell} py-12 sm:py-16`}>
                <div className="grid gap-6 sm:grid-cols-2">
                    {TRANSLATIONS.map((translation) => (
                        <section
                            className={`${panel} ${panelPad} flex flex-col`}
                            key={translation.id}
                        >
                            <p className={label}>{translation.language}</p>
                            <h2 className={`${displayMd} mt-3`}>{translation.name}</h2>
                            <p className="mt-4 text-base leading-7 text-muted">
                                {translation.blurb}
                            </p>
                            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className={label}>Verses</dt>
                                    <dd className="mt-1 tabular-nums">
                                        {translation.verseCount.toLocaleString("en-US")}
                                    </dd>
                                </div>
                                <div>
                                    <dt className={label}>ID</dt>
                                    <dd className="mt-1 font-mono">{translation.id}</dd>
                                </div>
                            </dl>
                            <div className="mt-auto flex flex-wrap gap-3 pt-8">
                                <Link
                                    className={`${btnInk} uppercase tracking-[0.12em]`}
                                    href={`/bibles/${translation.slug}`}
                                >
                                    Details &amp; download
                                </Link>
                                <Link
                                    className="inline-flex min-h-[3.25rem] items-center text-sm font-semibold underline decoration-1 underline-offset-4"
                                    href={`/read?translation=${translation.id}`}
                                >
                                    Read online
                                </Link>
                            </div>
                        </section>
                    ))}
                </div>

                <p className="mt-10 max-w-[70ch] text-sm leading-6 text-muted">{ATTRIBUTION}</p>
            </main>

            <SiteFooter />
        </>
    );
}
