import Link from "next/link";

export function BrandMark() {
    return (
        <span
            className="grid size-8 shrink-0 place-items-center rounded-full bg-on-ink text-[0.9rem] font-semibold tracking-normal text-ink-panel"
            aria-hidden="true"
        >
            F
        </span>
    );
}

export function Brand({ href = "/" }: { href?: string }) {
    return (
        <Link
            className="inline-flex items-center gap-2.5 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink"
            href={href}
        >
            <BrandMark />
            FirstWord
        </Link>
    );
}
