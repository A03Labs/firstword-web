import { PlayStoreBadge } from "./components/google-play";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import {
    displayLg,
    displayMd,
    displayXl,
    eyebrow,
    eyebrowOnInk,
    label,
    labelOnInk,
    lede,
    ledeOnInk,
    panel,
    panelPad,
    shell,
} from "./components/styles";

const PLAY_STORE_URL = "https://play.google.com/store/search?q=FirstWord&c=apps";

const features = [
    {
        number: "01",
        title: "Read without the noise",
        text: "A focused Bible reader that gives the words room to stay with you.",
    },
    {
        number: "02",
        title: "Keep what you notice",
        text: "Save notes, prayers, highlights, and reflections as you move through Scripture.",
    },
    {
        number: "03",
        title: "Set the phone aside",
        text: "Focus Mode protects a fixed span of time for reading, prayer, and attention.",
    },
];

/**
 * The product, shown rather than described. Height comes from the passage
 * rather than a fixed aspect-ratio — the copy is static, so the page is stable
 * without leaving a void where a taller frame would run out of text.
 */
function ReadingPage() {
    return (
        <figure className="m-0 w-full max-w-[22rem]">
            <div className="rounded-[1.75rem] border border-rule-on-ink bg-black/25 p-3">
                <div className="flex flex-col rounded-[1.15rem] bg-surface px-5 py-5 text-foreground">
                    <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-3">
                        <span className={label}>Matthew 5</span>
                        <span className={`${label} whitespace-nowrap`}>12 min</span>
                    </div>

                    <p className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-foreground">
                        The sermon on the mount
                    </p>

                    {/* Verse numbers carry the reference without colour, the way a
                        printed page sets them: smaller, raised, quieter. */}
                    <p className="mt-3 text-[1.3rem] leading-[1.5] tracking-[-0.02em]">
                        <sup className="mr-0.5 align-super text-[0.6rem] font-semibold text-muted">
                            14
                        </sup>
                        You are the light of the world. A city set on a hill cannot be hidden.{" "}
                        <sup className="mr-0.5 align-super text-[0.6rem] font-semibold text-muted">
                            15
                        </sup>
                        Nor do people light a lamp and put it under a basket, but on a stand.{" "}
                        <sup className="mr-0.5 align-super text-[0.6rem] font-semibold text-muted">
                            16
                        </sup>
                        <span className="text-muted">
                            In the same way, let your light shine before others.
                        </span>
                    </p>

                    <div className="mt-7 flex items-center justify-between gap-3 border-t border-rule pt-4">
                        <span className={label}>Note saved</span>
                        <span className="text-xs font-semibold tabular-nums">v. 14</span>
                    </div>
                </div>
            </div>
            <figcaption className={`${labelOnInk} mt-4 block text-center`}>
                A page, not a feed
            </figcaption>
        </figure>
    );
}

export default function Home() {
    return (
        <>
            <SiteHeader hide={["delete-account"]}>
                <div className="grid items-center gap-12 pb-16 pt-8 sm:pb-24 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
                    <div>
                        <p className={eyebrowOnInk}>A Bible reading office</p>
                        <h1 className={`${displayXl} mt-5 max-w-[18ch]`}>
                            Make room for the Word.
                        </h1>
                        <p className={`${ledeOnInk} mt-7 max-w-[46ch]`}>
                            FirstWord is a Bible, devotional, prayer, and focus app for a quieter
                            kind of attention.
                        </p>
                        <div
                            className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6"
                            id="download"
                        >
                            <PlayStoreBadge href={PLAY_STORE_URL} tone="paper" />
                            <span className={labelOnInk}>Free to begin</span>
                        </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <ReadingPage />
                    </div>
                </div>
            </SiteHeader>

            <main>
                <section className={`${shell} py-16 sm:py-24`}>
                    <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
                        <div>
                            <p className={eyebrow}>Why FirstWord</p>
                            <h2 className={`${displayLg} mt-5 max-w-[16ch]`}>
                                Attention is a place you can return to.
                            </h2>
                        </div>
                        {/* One sheet, divided by hairlines — not three cards on a card. */}
                        <div className={`${panel} grid divide-y divide-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0`}>
                            {features.map((feature) => (
                                <article
                                    className="flex flex-col p-6 transition-colors duration-150 hover:bg-surface-muted motion-reduce:transition-none sm:min-h-[14rem]"
                                    key={feature.number}
                                >
                                    <p className="text-xs font-semibold tabular-nums tracking-[0.2em] text-foreground">
                                        {feature.number}
                                    </p>
                                    {/* Flowed from the top so all three numbers and all three
                                        titles sit on shared baselines regardless of copy length. */}
                                    <h3 className="mt-5 text-lg font-normal leading-snug tracking-[-0.02em]">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2.5 text-sm leading-6 text-muted">
                                        {feature.text}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-y border-rule bg-surface-muted">
                    <div className={`${shell} py-16 sm:py-24`}>
                        {/* Centred so the rule sits in the optical middle of the band rather
                            than stranding half the width as dead space. */}
                        <blockquote className="mx-auto max-w-[40ch] border-l-[3px] border-foreground pl-6 sm:pl-8">
                            <p className={displayMd}>
                                Thy word is a lamp unto my feet, and a light unto my path.
                            </p>
                            <footer className={`${label} mt-5 block not-italic`}>
                                Psalm 119:105
                            </footer>
                        </blockquote>
                    </div>
                </section>

                <section className={`${shell} py-16 sm:py-24`}>
                    <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
                        <div>
                            <p className={eyebrow}>Focus mode</p>
                            <h2 className={`${displayLg} mt-5 max-w-[20ch]`}>
                                Put the phone down. Keep the promise.
                            </h2>
                            <p className={`${lede} mt-7 max-w-[48ch]`}>
                                Choose a reading or devotional session, set the time, and let
                                FirstWord make the space around it quieter.
                            </p>
                            <div className="mt-9">
                                <PlayStoreBadge href={PLAY_STORE_URL} tone="ink" />
                            </div>
                        </div>

                        <div className={`${panel} ${panelPad}`}>
                            <div className="flex items-center justify-between">
                                <p className={label}>Session active</p>
                                <span
                                    className="size-2.5 rounded-full bg-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                            {/* tabular-nums keeps the countdown from reflowing each second. */}
                            <p className="mt-8 text-[clamp(3.5rem,11vw,5.5rem)] font-normal leading-none tracking-[-0.045em] tabular-nums">
                                24:00
                            </p>
                            <div
                                className="mt-7 h-1.5 bg-surface-muted"
                                role="progressbar"
                                aria-label="Session progress"
                                aria-valuenow={67}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div className="h-full w-2/3 bg-foreground" />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className={label}>Psalm 27</span>
                                <span className={label}>Reading</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </>
    );
}
