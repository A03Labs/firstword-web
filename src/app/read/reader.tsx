"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { label, panel } from "../components/styles";
import { BOOKS, formatReference, getBook } from "@/lib/bible/books";
import {
    getTranslation,
    isTranslationId,
    PARAPHRASE_WARNING,
    TRANSLATIONS,
    type TranslationId,
} from "@/lib/bible/translations";

type Verse = { verse: number; text: string };

type Reference = { translationId: TranslationId; book: number; chapter: number };

/** The outcome of a chapter request. */
type Settled =
    | { status: "ready"; verses: Verse[] }
    | { status: "error"; message: string; retriable: boolean };

type LoadState = { status: "loading" } | Settled;

const DEFAULT_REFERENCE: Reference = { translationId: "GENZ", book: 1, chapter: 1 };

/* --- Reference plumbing -------------------------------------------------- */

function parseInteger(raw: string | null): number | undefined {
    if (raw === null || !/^[1-9][0-9]{0,6}$/.test(raw)) return undefined;
    return Number(raw);
}

/**
 * Reads a reference out of the query string, falling back a field at a time so a
 * hand-edited or truncated URL still lands somewhere readable rather than on an
 * error screen.
 */
function readReference(params: URLSearchParams): Reference {
    const rawTranslation = params.get("translation") ?? "";
    const translationId = isTranslationId(rawTranslation)
        ? rawTranslation
        : DEFAULT_REFERENCE.translationId;

    const book = parseInteger(params.get("book"));
    const safeBook = book !== undefined && getBook(book) ? book : DEFAULT_REFERENCE.book;

    const chapter = parseInteger(params.get("chapter"));
    const chapterCount = getBook(safeBook)?.chapters ?? 1;
    const safeChapter =
        chapter !== undefined && chapter <= chapterCount ? chapter : DEFAULT_REFERENCE.chapter;

    return { translationId, book: safeBook, chapter: safeChapter };
}

function referenceQuery({ translationId, book, chapter }: Reference): string {
    return `translation=${translationId}&book=${book}&chapter=${chapter}`;
}

/** The chapter before this one, crossing into the previous book. `null` at Genesis 1. */
function previousChapter(reference: Reference): Reference | null {
    if (reference.chapter > 1) return { ...reference, chapter: reference.chapter - 1 };
    const previousBook = getBook(reference.book - 1);
    if (!previousBook) return null;
    return { ...reference, book: previousBook.number, chapter: previousBook.chapters };
}

/** The chapter after this one, crossing into the next book. `null` at Revelation 22. */
function nextChapter(reference: Reference): Reference | null {
    const book = getBook(reference.book);
    if (book && reference.chapter < book.chapters) {
        return { ...reference, chapter: reference.chapter + 1 };
    }
    const following = getBook(reference.book + 1);
    if (!following) return null;
    return { ...reference, book: following.number, chapter: 1 };
}

/* --- Verse actions ------------------------------------------------------- */

/** `John 3:16 — text (Gen Z Bible)`, the form used for both copy and share. */
function verseCitation(reference: Reference, verse: Verse): string {
    const name = getTranslation(reference.translationId)?.name ?? reference.translationId;
    return `${formatReference(reference.book, reference.chapter, verse.verse)} — ${verse.text} (${name})`;
}

function verseUrl(reference: Reference, verse: Verse): string {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/read?${referenceQuery(reference)}#v${verse.verse}`;
}

/* --- Controls ----------------------------------------------------------- */

const selectClass =
    "min-h-11 w-full appearance-none rounded border border-rule bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const navButtonClass =
    "inline-flex min-h-11 items-center gap-2 rounded border border-rule bg-surface px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

const verseActionClass =
    "rounded px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none";

export function BibleReader() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // The query string is the single source of truth for the reference, so the
    // back button, a shared link, and the pickers all agree.
    const reference = readReference(new URLSearchParams(searchParams.toString()));
    const { translationId, book, chapter } = reference;

    const [notice, setNotice] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // The result is stored against the request that produced it, and anything
    // that does not match the current request reads as "loading". That keeps the
    // effect from having to set a loading state synchronously on every reference
    // change, and makes a stale response impossible to render.
    const requestKey = `${translationId}/${book}/${chapter}#${reloadToken}`;
    const [loaded, setLoaded] = useState<{ key: string; result: Settled } | null>(null);
    const state: LoadState = loaded?.key === requestKey ? loaded.result : { status: "loading" };

    const translation = getTranslation(translationId);
    const bookEntry = getBook(book);

    useEffect(() => {
        const controller = new AbortController();
        const key = `${translationId}/${book}/${chapter}#${reloadToken}`;
        const settle = (result: Settled) => setLoaded({ key, result });

        fetch(`/api/bibles/${translationId}/${book}/${chapter}`, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
        })
            .then(async (response) => {
                if (response.status === 404) {
                    settle({
                        status: "error",
                        message: `${formatReference(book, chapter)} is not available in this translation.`,
                        retriable: false,
                    });
                    return;
                }
                if (!response.ok) {
                    settle({
                        status: "error",
                        message: `The Bible service returned an error (HTTP ${response.status}).`,
                        retriable: true,
                    });
                    return;
                }
                const payload = (await response.json()) as { verses?: Verse[] };
                if (!Array.isArray(payload.verses) || payload.verses.length === 0) {
                    settle({
                        status: "error",
                        message: "That chapter came back empty. Please try another chapter.",
                        retriable: true,
                    });
                    return;
                }
                settle({ status: "ready", verses: payload.verses });
            })
            .catch((error: unknown) => {
                // An aborted request is a superseded navigation, not a failure.
                if (controller.signal.aborted) return;
                console.error(error);
                settle({
                    status: "error",
                    message: "Could not reach the Bible service. Check your connection.",
                    retriable: true,
                });
            });

        return () => controller.abort();
    }, [translationId, book, chapter, reloadToken]);

    useEffect(() => {
        return () => {
            if (noticeTimer.current) clearTimeout(noticeTimer.current);
        };
    }, []);

    function flash(message: string) {
        setNotice(message);
        if (noticeTimer.current) clearTimeout(noticeTimer.current);
        noticeTimer.current = setTimeout(() => setNotice(null), 2600);
    }

    function goTo(next: Reference) {
        router.replace(`/read?${referenceQuery(next)}`, { scroll: false });
    }

    async function copy(verse: Verse) {
        const text = verseCitation(reference, verse);
        try {
            await navigator.clipboard.writeText(text);
            flash("Verse copied.");
        } catch {
            flash("Copying is blocked in this browser. Select the text instead.");
        }
    }

    async function share(verse: Verse) {
        const text = verseCitation(reference, verse);
        const url = verseUrl(reference, verse);
        if (typeof navigator.share === "function") {
            try {
                await navigator.share({
                    title: formatReference(book, chapter, verse.verse),
                    text,
                    url,
                });
                return;
            } catch {
                // Dismissing the share sheet lands here; fall through to copying.
            }
        }
        try {
            await navigator.clipboard.writeText(`${text}\n${url}`);
            flash("Share link copied.");
        } catch {
            flash("Sharing is unavailable in this browser.");
        }
    }

    const previous = previousChapter(reference);
    const next = nextChapter(reference);
    const chapterCount = bookEntry?.chapters ?? 1;

    return (
        <div className="grid gap-8">
            {/* --- Pickers --- */}
            <div className={`${panel} p-4 sm:p-5`}>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.7fr)]">
                    <label className="grid gap-2">
                        <span className={label}>Translation</span>
                        <select
                            className={selectClass}
                            value={translationId}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (isTranslationId(value)) goTo({ ...reference, translationId: value });
                            }}
                        >
                            {TRANSLATIONS.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="grid gap-2">
                        <span className={label}>Book</span>
                        <select
                            className={selectClass}
                            value={book}
                            onChange={(event) =>
                                // Chapter resets to 1: the current chapter may not exist in
                                // the newly selected book.
                                goTo({ ...reference, book: Number(event.target.value), chapter: 1 })
                            }
                        >
                            <optgroup label="Old Testament">
                                {BOOKS.filter((entry) => entry.testament === "old").map((entry) => (
                                    <option key={entry.number} value={entry.number}>
                                        {entry.name}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="New Testament">
                                {BOOKS.filter((entry) => entry.testament === "new").map((entry) => (
                                    <option key={entry.number} value={entry.number}>
                                        {entry.name}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </label>

                    <label className="grid gap-2">
                        <span className={label}>Chapter</span>
                        <select
                            className={selectClass}
                            value={chapter}
                            onChange={(event) =>
                                goTo({ ...reference, chapter: Number(event.target.value) })
                            }
                        >
                            {Array.from({ length: chapterCount }, (_, index) => index + 1).map(
                                (option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>
                </div>
            </div>

            {/* --- Chapter --- */}
            <div className={panel}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule p-4 sm:p-5">
                    <div className="min-w-0">
                        <h2 className="text-[clamp(1.35rem,3vw,1.9rem)] font-normal leading-tight tracking-[-0.03em]">
                            {formatReference(book, chapter)}
                        </h2>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">
                            {translation?.name}
                        </p>
                    </div>
                    <nav className="flex gap-2" aria-label="Chapter">
                        <button
                            className={navButtonClass}
                            type="button"
                            disabled={previous === null}
                            onClick={() => previous && goTo(previous)}
                        >
                            <span aria-hidden="true">&larr;</span> Prev
                        </button>
                        <button
                            className={navButtonClass}
                            type="button"
                            disabled={next === null}
                            onClick={() => next && goTo(next)}
                        >
                            Next <span aria-hidden="true">&rarr;</span>
                        </button>
                    </nav>
                </div>

                {/* aria-live so a screen reader hears the chapter swap, the spinner
                    text, and the error without the focus moving. */}
                <div className="p-5 sm:p-7" aria-busy={state.status === "loading"} aria-live="polite">
                    {state.status === "loading" ? (
                        <p className="text-sm text-muted">Loading {formatReference(book, chapter)}…</p>
                    ) : null}

                    {state.status === "error" ? (
                        <div className="max-w-[60ch]">
                            <p className="text-base leading-7">{state.message}</p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                {state.retriable ? (
                                    <button
                                        className={navButtonClass}
                                        type="button"
                                        onClick={() => setReloadToken((token) => token + 1)}
                                    >
                                        Try again
                                    </button>
                                ) : null}
                                <button
                                    className={navButtonClass}
                                    type="button"
                                    onClick={() => goTo(DEFAULT_REFERENCE)}
                                >
                                    Go to Genesis 1
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {state.status === "ready" ? (
                        <ol className="grid gap-5">
                            {state.verses.map((verse) => (
                                <li
                                    className="group scroll-mt-24 target:bg-surface-muted"
                                    id={`v${verse.verse}`}
                                    key={verse.verse}
                                >
                                    <div className="flex gap-3 sm:gap-4">
                                        <span className="w-6 shrink-0 pt-1 text-xs font-semibold tabular-nums tracking-[0.1em] text-muted">
                                            {verse.verse}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[1.05rem] leading-[1.75]">
                                                {verse.text}
                                            </p>
                                            {/* Always in the DOM — hover-only actions would be
                                                unreachable by touch and by keyboard. */}
                                            <div className="mt-2 flex gap-1">
                                                <button
                                                    className={verseActionClass}
                                                    type="button"
                                                    onClick={() => void copy(verse)}
                                                >
                                                    Copy
                                                </button>
                                                <button
                                                    className={verseActionClass}
                                                    type="button"
                                                    onClick={() => void share(verse)}
                                                >
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule p-4 sm:p-5">
                    <p className="text-xs leading-5 text-muted">{PARAPHRASE_WARNING}</p>
                    <Link
                        className="text-xs font-semibold uppercase tracking-[0.12em] underline decoration-1 underline-offset-4"
                        href={`/bibles/${translation?.slug ?? ""}`}
                    >
                        Download JSON
                    </Link>
                </div>
            </div>

            {/* Status messages for copy/share. `role="status"` announces them
                without stealing focus from the verse that was acted on. */}
            <p className="min-h-5 text-xs text-muted" role="status">
                {notice}
            </p>
        </div>
    );
}
