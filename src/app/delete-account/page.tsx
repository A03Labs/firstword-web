import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT_EMAIL, SiteFooter } from "../components/site-footer";
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

export const metadata: Metadata = {
    title: "Delete Account",
    description: "Delete your FirstWord account and associated data from inside the app.",
};

const deletionSubject = "FirstWord Account Deletion Request";
const deletionHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(deletionSubject)}`;

/** The in-app route, rendered as a path so it can be scanned without reading
 *  the numbered steps underneath it. */
const appPath = ["Settings", "Account", "Delete account"];

const steps = [
    "Open FirstWord and go to Settings.",
    "Tap Account.",
    "Tap Delete account — it sits directly beneath Sign out, and both are in red.",
    "Confirm the prompt. Your account and its data are queued for deletion straight away.",
];

const dataList = [
    "Notes, prayers, reflections, and journal entries",
    "Reading history and reading-plan progress",
    "Highlights, bookmarks, and streak history",
    "Account and profile information",
];

export default function DeleteAccountPage() {
    return (
        <>
            <SiteHeader hide={["delete-account"]}>
                <div className="pb-14 pt-8 sm:pb-20 sm:pt-12">
                    <p className={eyebrowOnInk}>Account support</p>
                    <h1 className={`${displayLg} mt-5 max-w-[14ch]`}>Delete your account.</h1>
                    <p className={`${ledeOnInk} mt-7 max-w-[58ch]`}>
                        You can remove your FirstWord account and the personal data associated with
                        it from inside the app, in a few taps, without contacting us.
                    </p>
                </div>
            </SiteHeader>

            <main className={`${shell} py-12 sm:py-16`}>
                {/* One sheet. Regions are separated by hairlines rather than nested boxes. */}
                <div className={`${panel} max-w-[62ch] divide-y divide-rule`}>
                    {/* Monochrome, so the warning earns its weight from a heavy rule and a
                        filled band instead of a red. */}
                    <div className="border-l-4 border-l-foreground bg-surface-muted p-5 sm:p-6">
                        <p className="text-sm leading-6">
                            <strong className="font-bold uppercase tracking-[0.08em]">
                                Permanent.
                            </strong>{" "}
                            Deletion cannot be undone once it has been completed.
                        </p>
                    </div>

                    <section className={panelPad}>
                        <h2 className={displayMd}>Delete from the app</h2>

                        {/* The path itself. Chevrons are decorative — the ordered list below
                            carries the same route for anyone not reading the row. */}
                        <p
                            className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.12em]"
                            aria-hidden="true"
                        >
                            {appPath.map((crumb, index) => (
                                <span className="flex items-center gap-x-2" key={crumb}>
                                    {index > 0 ? <span className="text-muted">&rarr;</span> : null}
                                    <span
                                        className={
                                            index === appPath.length - 1
                                                ? "text-foreground"
                                                : "text-muted"
                                        }
                                    >
                                        {crumb}
                                    </span>
                                </span>
                            ))}
                        </p>

                        <ol className="mt-6 grid gap-4">
                            {steps.map((step, index) => (
                                <li className="flex gap-4 text-base leading-7" key={step}>
                                    {/* Fixed width so every step's text starts on the same
                                        vertical, whatever the numeral. */}
                                    <span
                                        className="w-6 shrink-0 pt-1 text-xs font-semibold tabular-nums tracking-[0.14em] text-muted"
                                        aria-hidden="true"
                                    >
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* <section className={panelPad}>
                        <h2 className={label}>If you cannot reach the app</h2>
                        <p className="mt-4 text-sm leading-6">
                            Lost the device, or already removed FirstWord? Email us instead. Send
                            the request from the address connected to your account — we may ask you
                            to verify ownership before processing it.
                        </p>

                        <a
                            className={`${btnInk} mt-6 w-full uppercase tracking-[0.12em] sm:w-auto`}
                            href={deletionHref}
                        >
                            Request deletion by email
                        </a>

                        <p className="mt-4 text-xs leading-5 text-muted">
                            Opens your email app with the subject &ldquo;{deletionSubject}&rdquo;.
                        </p>
                    </section> */}

                    <section className={panelPad}>
                        <h2 className={label}>What will be deleted</h2>
                        <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 marker:text-muted">
                            {dataList.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    {/* <section className={panelPad}>
                        <p className="text-sm leading-6 text-muted">
                            Some information may be retained temporarily in encrypted backups, or
                            where required for legal, security, or fraud-prevention purposes. The
                            full details are in our{" "}
                            <Link
                                className="font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                                href="/privacy"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </section> */}
                </div>
            </main>

            <SiteFooter />
        </>
    );
}
