import Image from "next/image";
import Link from "next/link";

/**
 * The dove-and-open-book emblem, cut out of the full logo lockup — the site
 * spells "FirstWord" in DM Sans beside it rather than reusing the logo's own
 * wordmark, so the two never compete.
 *
 * The art is white with a transparent ground, so it reads on the ink plate
 * (`plate`) and nowhere else. `/images/logo-mark.png` is drawn slightly heavier
 * than the source hairlines so it survives the downscale to ~36px.
 */
export function BrandMark() {
    return (
        <Image
            className="size-9 shrink-0"
            src="/images/logo-mark.png"
            alt=""
            width={72}
            height={72}
            priority
        />
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
