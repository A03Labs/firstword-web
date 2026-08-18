import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "FirstWord: Bible & Devotional",
    description: "FirstWord is a Bible, devotional, prayer, and focus app designed to help you put Scripture first. Read the Bible, reflect, pray, build consistent habits, and stay focused by limiting distractions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}