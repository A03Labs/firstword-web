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
        text: "Focus Mode helps protect a fixed span of time for reading, prayer, and attention.",
    },
];

function PlayStoreMark() {
    return (
        <span aria-hidden="true" className="text-lg leading-none">
            ▶
        </span>
    );
}

function BrandMark() {
    return (
        <span className="grid size-9 place-items-center rounded-full bg-white text-sm font-semibold text-black">
            F
        </span>
    );
}

export default function Home() {
    return (
        <main className="min-h-screen overflow-hidden bg-background text-foreground">
            <section className="bg-black text-white">
                <nav className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-center justify-between py-6 sm:w-[min(1120px,calc(100%-3rem))]">
                    <a
                        className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em]"
                        href="#top"
                        aria-label="FirstWord home"
                    >
                        <BrandMark />
                        FirstWord
                    </a>
                    <div className="flex items-center gap-5">
                        <a
                            className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:text-white sm:inline"
                            href="/privacy"
                        >
                            Privacy
                        </a>
                        <a
                            className="inline-flex min-h-10 items-center rounded-[5px] bg-white px-4 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            href="#download"
                        >
                            Get the app
                        </a>
                    </div>
                </nav>

                <div
                    id="top"
                    className="mx-auto grid w-[min(1120px,calc(100%-2rem))] items-center gap-14 pb-20 pt-14 sm:w-[min(1120px,calc(100%-3rem))] sm:pb-28 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-24"
                >
                    <div className="max-w-2xl">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                            A Bible reading office
                        </p>
                        <h1 className="max-w-xl text-[clamp(3.6rem,9vw,7.5rem)] font-normal leading-[0.9] tracking-[-0.07em]">
                            Make room for the Word.
                        </h1>
                        <p className="mt-8 max-w-lg text-lg leading-8 text-white/70 sm:text-xl">
                            FirstWord is a Bible, devotional, prayer, and focus app for a
                            quieter kind of attention.
                        </p>
                        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <a
                                id="download"
                                className="inline-flex min-h-14 items-center gap-3 rounded-[5px] bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                href={PLAY_STORE_URL}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <PlayStoreMark />
                                <span>
                                    <span className="block text-[0.62rem] font-medium uppercase tracking-[0.14em] opacity-60">
                                        Get it on
                                    </span>
                                    <span className="block text-base leading-5">Google Play</span>
                                </span>
                            </a>
                            <span className="text-xs uppercase tracking-[0.14em] text-white/50">
                                Free to begin
                            </span>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-[330px] lg:mr-0">
                        <div className="absolute -left-10 top-14 hidden size-20 rounded-full bg-white/10 sm:block" />
                        <div className="relative rounded-[28px] bg-[#17181a] p-3 shadow-2xl shadow-black/40">
                            <div className="rounded-[20px] bg-white px-5 pb-8 pt-4 text-black">
                                <div className="mx-auto mb-8 h-1 w-14 rounded-full bg-black/15" />
                                <div className="mb-8 flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-black/50">
                                    <span>Matthew 5</span>
                                    <span>Focus</span>
                                </div>
                                <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/50">
                                    The sermon on the mount
                                </p>
                                <p className="text-[1.55rem] leading-[1.35] tracking-[-0.035em]">
                                    You are the light of the world. A city set on a hill cannot be hidden.
                                </p>
                                <div className="mt-8 flex items-center justify-between bg-[#e4e7e6] px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                                    <span>Reading time</span>
                                    <span>12 min</span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                            A page, not a feed
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20 sm:w-[min(1120px,calc(100%-3rem))] sm:py-28">
                <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Why FirstWord
                        </p>
                        <h2 className="mt-5 max-w-md text-4xl font-normal leading-[1] tracking-[-0.055em] sm:text-5xl">
                            Attention is a place you can return to.
                        </h2>
                    </div>
                    <div className="grid gap-0 bg-white sm:grid-cols-3">
                        {features.map((feature) => (
                            <article
                                className="bg-white p-6 transition hover:bg-surface-muted sm:min-h-64 sm:p-7"
                                key={feature.number}
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                                    {feature.number}
                                </p>
                                <h3 className="mt-14 text-xl font-normal leading-tight tracking-[-0.03em]">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-muted">{feature.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-surface-muted">
                <div className="mx-auto grid w-[min(1120px,calc(100%-2rem))] items-center gap-12 py-20 sm:w-[min(1120px,calc(100%-3rem))] sm:py-28 lg:grid-cols-[1fr_0.8fr] lg:gap-24">
                    <div className="max-w-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Focus mode
                        </p>
                        <h2 className="mt-5 text-4xl font-normal leading-[1] tracking-[-0.055em] sm:text-6xl">
                            Put the phone down. Keep the promise.
                        </h2>
                        <p className="mt-7 max-w-lg text-lg leading-8 text-muted">
                            Choose a reading or devotional session, set the time, and let
                            FirstWord make the space around it quieter.
                        </p>
                        <a
                            className="mt-8 inline-flex items-center gap-3 rounded-[5px] bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                            href={PLAY_STORE_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <PlayStoreMark />
                            Download FirstWord
                        </a>
                    </div>
                    <div className="bg-white p-6 sm:p-8">
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                                Session active
                            </p>
                            <span className="size-3 rounded-full bg-black" aria-label="Session active" />
                        </div>
                        <p className="mt-10 text-7xl font-normal tracking-[-0.08em] sm:text-8xl">24:00</p>
                        <div className="mt-8 h-2 bg-surface-muted">
                            <div className="h-2 w-2/3 bg-black" />
                        </div>
                        <div className="mt-5 flex justify-between text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                            <span>Psalm 27</span>
                            <span>Reading</span>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-black text-white">
                <div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] flex-col gap-6 py-10 sm:w-[min(1120px,calc(100%-3rem))] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
                        <BrandMark />
                        FirstWord
                    </div>
                    <div className="flex gap-6 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                        <a className="transition hover:text-white" href="/privacy">
                            Privacy Policy
                        </a>
                        <a className="transition hover:text-white" href="mailto:hello@firstword.online">
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
