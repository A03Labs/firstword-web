import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Delete Account | FirstWord",
    description: "Request deletion of your FirstWord account and associated data.",
};

const deletionEmail = "hello@firstword.online";
const deletionSubject = "FirstWord Account Deletion Request";
const deletionHref = `mailto:${deletionEmail}?subject=${encodeURIComponent(deletionSubject)}`;

const dataList = [
    "Notes, prayers, reflections, and journal entries",
    "Reading history and reading-plan progress",
    "Highlights, bookmarks, and streak history",
    "Account and profile information",
];

export default function DeleteAccountPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <header className="bg-black text-white">
                <div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-center justify-between py-6 sm:w-[min(1120px,calc(100%-3rem))]">
                    <Link
                        className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em]"
                        href="/"
                    >
                        <span className="grid size-9 place-items-center rounded-full bg-white text-sm font-semibold text-black">
                            F
                        </span>
                        FirstWord
                    </Link>
                    <a
                        className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:text-white"
                        href="/privacy"
                    >
                        Privacy Policy
                    </a>
                </div>
            </header>

            <div className="mx-auto grid w-[min(1120px,calc(100%-2rem))] gap-12 py-16 sm:w-[min(1120px,calc(100%-3rem))] sm:py-24 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
                <section>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Account support
                    </p>
                    <h1 className="mt-6 max-w-lg text-5xl font-normal leading-[0.95] tracking-[-0.06em] sm:text-7xl">
                        Delete your account.
                    </h1>
                    <p className="mt-7 max-w-md text-lg leading-8 text-muted">
                        We can help you remove your FirstWord account and the personal data
                        associated with it.
                    </p>
                </section>

                <div className="bg-surface p-6 sm:p-10">
                    <div className="flex items-start gap-4 bg-surface-muted p-5">
                        <span
                            className="mt-1 size-3 shrink-0 rounded-full bg-danger"
                            aria-hidden="true"
                        />
                        <p className="text-sm leading-6">
                            Account deletion is permanent. It cannot be undone once completed.
                        </p>
                    </div>

                    <h2 className="mt-10 text-2xl font-normal tracking-[-0.035em] sm:text-3xl">
                        How to request deletion
                    </h2>
                    <ol className="mt-6 grid gap-5 text-base leading-7 text-muted">
                        <li className="flex gap-4">
                            <span className="text-xs font-semibold tracking-[0.14em] text-foreground">
                                01
                            </span>
                            <span>Tap the button below to open an email addressed to FirstWord.</span>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-xs font-semibold tracking-[0.14em] text-foreground">
                                02
                            </span>
                            <span>Send the request from the email address connected to your account.</span>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-xs font-semibold tracking-[0.14em] text-foreground">
                                03
                            </span>
                            <span>
                                We may ask you to verify ownership before processing the request.
                            </span>
                        </li>
                    </ol>

                    <a
                        className="mt-9 inline-flex min-h-14 w-full items-center justify-center rounded-[5px] bg-black px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:w-auto"
                        href={deletionHref}
                    >
                        Request account deletion
                    </a>

                    <p className="mt-4 text-xs leading-5 text-muted">
                        This opens your email app with the subject “{deletionSubject}”.
                    </p>

                    <div className="mt-12 bg-surface-muted p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                            What will be deleted
                        </h2>
                        <ul className="mt-4 grid gap-2 pl-5 text-sm leading-6 text-muted">
                            {dataList.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <p className="mt-8 text-sm leading-6 text-muted">
                        Some information may be retained temporarily in encrypted backups or
                        where required for legal, security, or fraud-prevention purposes. Read
                        the full details in our{" "}
                        <a className="font-semibold text-foreground underline underline-offset-4" href="/privacy">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>

            <footer className="bg-black px-6 py-8 text-center text-xs text-white/70">
                Questions? Contact {" "}
                <a className="font-semibold text-white" href={`mailto:${deletionEmail}`}>
                    {deletionEmail}
                </a>
            </footer>
        </main>
    );
}
