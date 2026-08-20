import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";

import "./globals.css";

const dmSans = DM_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-dm-sans",
});

const description =
    "FirstWord is a Bible, devotional, prayer, and focus app designed to help you put Scripture first. Read the Bible, reflect, pray, build consistent habits, and stay focused by limiting distractions.";

export const metadata: Metadata = {
    metadataBase: new URL("https://firstword.online"),
    title: {
        default: "FirstWord: Bible & Devotional",
        template: "%s · FirstWord",
    },
    description,
    applicationName: "FirstWord",
    openGraph: {
        type: "website",
        siteName: "FirstWord",
        title: "FirstWord: Bible & Devotional",
        description,
        url: "/",
    },
    twitter: {
        card: "summary_large_image",
        title: "FirstWord: Bible & Devotional",
        description,
    },
};

export const viewport: Viewport = {
    // Matches --ink-panel, so the browser chrome continues the masthead.
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#121212" },
        { media: "(prefers-color-scheme: dark)", color: "#191919" },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        // data-scroll-behavior: Next 16 no longer overrides `scroll-behavior:
        // smooth` on route changes, which would make navigation crawl. This opts
        // back in, keeping smooth scroll for in-page anchors only.
        <html
            lang="en"
            className={`${dmSans.variable} scroll-smooth motion-reduce:scroll-auto`}
            data-scroll-behavior="smooth"
        >
            <body className="bg-background font-sans text-foreground antialiased selection:bg-foreground selection:text-background">
                {children}
            </body>
        </html>
    );
}
