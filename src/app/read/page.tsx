import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { displayLg, eyebrowOnInk, ledeOnInk, panel, shell } from "../components/styles";
import { ATTRIBUTION } from "@/lib/bible/translations";
import { BibleReader } from "./reader";

export const metadata: Metadata = {
    title: "Read",
    description:
        "Read the Gen Z and Nigerian Pidgin editions of the World English Bible online, chapter by chapter.",
};

export default function ReadPage() {
    return (
        <>
            <SiteHeader>
                <div className="pb-12 pt-8 sm:pb-16 sm:pt-12">
                    <p className={eyebrowOnInk}>Online reader</p>
                    <h1 className={`${displayLg} mt-5 max-w-[16ch]`}>Read a chapter.</h1>
                    <p className={`${ledeOnInk} mt-7 max-w-[58ch]`}>
                        Pick a translation, a book, and a chapter. Every reference is in the URL, so
                        a chapter can be bookmarked or sent to someone.
                    </p>
                </div>
            </SiteHeader>

            <main className={`${shell} py-12 sm:py-16`}>
                {/* The reader reads the query string, so it renders on the client;
                    the fallback keeps the page from collapsing during hydration. */}
                <Suspense
                    fallback={
                        <div className={`${panel} p-5 text-sm text-muted sm:p-7`}>
                            Loading the reader…
                        </div>
                    }
                >
                    <BibleReader />
                </Suspense>

                <p className="mt-10 max-w-[70ch] text-sm leading-6 text-muted">{ATTRIBUTION}</p>
            </main>

            <SiteFooter />
        </>
    );
}
