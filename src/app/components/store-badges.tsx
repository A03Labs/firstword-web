import type { ReactNode } from "react";

import { btnInk, btnPaper, btnStore, btnStoreCaption, btnStoreName } from "./styles";

/**
 * Both links are store *searches*, matching how the Play link was originally
 * written. Swap in the canonical product URLs once each listing is live.
 */
export const PLAY_STORE_URL = "https://play.google.com/store/search?q=FirstWord&c=apps";
export const APP_STORE_URL = "https://apps.apple.com/search?term=FirstWord";

type Tone = "paper" | "ink";

/** The Google Play triangle in a single colour, its facets separated by
 *  opacity so the mark stays recognisable within the monochrome palette. */
function GooglePlayGlyph() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            className="shrink-0"
        >
            <path d="M3.1 2.9a1.5 1.5 0 0 1 .5-1.1L13 12l-9.4 10.2a1.5 1.5 0 0 1-.5-1.1z" />
            <path d="M13.5 6.2 17.1 8.3 13 12 3.6 1.5a1.4 1.4 0 0 1 .3.1z" opacity=".75" />
            <path d="M17.1 15.7 13 12l4.1-3.7 3.5 2c1 .6 1 2.3 0 2.9z" opacity=".55" />
            <path d="M3.87 22.28 13 12l4.1 3.7-3.6 2.05-9.63 4.6z" opacity=".9" />
        </svg>
    );
}

/** The Apple mark, which is monochrome by convention already. */
function AppleGlyph() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            className="shrink-0"
        >
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-1.831-.13-3.35 1.078-4.312 1.078zm.568-3.74c.78-.94 1.297-2.226 1.156-3.156-1.13.045-2.484.742-3.29 1.676-.717.83-1.336 2.156-1.17 3.42 1.257.098 2.523-.637 3.304-1.94z" />
        </svg>
    );
}

function StoreBadge({
    href,
    tone,
    glyph,
    caption,
    name,
}: {
    href: string;
    tone: Tone;
    glyph: ReactNode;
    caption: string;
    name: string;
}) {
    return (
        <a
            className={`${tone === "paper" ? btnPaper : btnInk} ${btnStore}`}
            href={href}
            target="_blank"
            rel="noreferrer"
        >
            {glyph}
            <span>
                <span className={btnStoreCaption}>{caption}</span>
                <span className={btnStoreName}>{name}</span>
            </span>
        </a>
    );
}

/**
 * The pair of store links. Full-width and stacked on small screens so each is a
 * comfortable tap target, side by side from `sm` up.
 */
export function StoreBadges({
    tone = "paper",
    className = "",
}: {
    tone?: Tone;
    className?: string;
}) {
    return (
        <div className={`flex flex-col items-stretch gap-3 sm:flex-row sm:items-center ${className}`}>
            <StoreBadge
                href={PLAY_STORE_URL}
                tone={tone}
                glyph={<GooglePlayGlyph />}
                caption="Get it on"
                name="Google Play"
            />
            <StoreBadge
                href={APP_STORE_URL}
                tone={tone}
                glyph={<AppleGlyph />}
                caption="Download on the"
                name="App Store"
            />
        </div>
    );
}
