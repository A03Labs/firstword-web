import Link from "next/link";

import { Brand } from "./brand";
import { btnQuiet, plate, plateLink, shell } from "./styles";

type NavKey = "privacy" | "delete-account";

type SiteHeaderProps = {
    /** Rendered under the bar, inside the same ink plate (page title, lede). */
    children?: React.ReactNode;
    /** Links to leave out — the current page, or support links that belong only in the colophon. */
    hide?: readonly NavKey[];
};

const links = [
    { key: "privacy", href: "/privacy", label: "Privacy" },
    { key: "delete-account", href: "/delete-account", label: "Delete account" },
] as const;

export function SiteHeader({ children, hide = [] }: SiteHeaderProps) {
    return (
        <header className={plate}>
            <div className={shell}>
                <div className="flex min-w-0 items-center justify-between gap-4 py-5 sm:gap-6">
                    <Brand />
                    <nav className="flex items-center gap-4 sm:gap-[clamp(1rem,3vw,1.75rem)]" aria-label="Site">
                        {/* Measured: with the text links in, the bar has 0px of slack at
                            360-375px and 3px at 390px, so below `sm` they are hidden and
                            only the button survives. Both appear in the colophon on every
                            page. */}
                        {/* {links
                            .filter((link) => !hide.includes(link.key))
                            .map((link) => (
                                <Link
                                    className={`hidden sm:inline-block ${plateLink}`}
                                    href={link.href}
                                    key={link.key}
                                >
                                    {link.label}
                                </Link>
                            ))} */}
                        <Link className={btnQuiet} href="/#download">
                            Get Started
                        </Link>
                    </nav>
                </div>
                {children}
            </div>
        </header>
    );
}
