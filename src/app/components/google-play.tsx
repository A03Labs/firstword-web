import { btnStore, btnStoreCaption, btnStoreName, btnInk, btnPaper } from "./styles";

/**
 * The Google Play triangle in a single colour, so the badge carries the
 * familiar store mark without breaking the monochrome palette.
 */
export function GooglePlayGlyph() {
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

export function PlayStoreBadge({
    href,
    tone = "paper",
}: {
    href: string;
    tone?: "paper" | "ink";
}) {
    return (
        <a
            className={`${tone === "paper" ? btnPaper : btnInk} ${btnStore}`}
            href={href}
            target="_blank"
            rel="noreferrer"
        >
            <GooglePlayGlyph />
            <span>
                <span className={btnStoreCaption}>Get it on</span>
                <span className={btnStoreName}>Google Play</span>
            </span>
        </a>
    );
}
