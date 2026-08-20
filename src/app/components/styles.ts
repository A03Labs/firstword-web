/**
 * Tailwind class strings shared across routes.
 *
 * These are plain utility strings, not a CSS layer — they exist so that the
 * page shell, the type scale, and the buttons stay identical across the three
 * routes instead of being retyped and drifting.
 */

/** Page gutter + max measure, used by every full-width band. */
export const shell = "mx-auto w-[min(1120px,calc(100%-3rem))] sm:w-[min(1120px,calc(100%-3.5rem))]";

/* --- Type ---------------------------------------------------------------- */

/** Display type. Tracking tightens only once the size is actually large, so
 *  small screens keep their word spacing instead of inheriting -0.055em. */
export const displayXl =
    "text-[clamp(2.75rem,9.5vw,6.75rem)] font-normal leading-[1.02] tracking-[-0.03em] text-balance sm:tracking-[-0.055em]";
export const displayLg =
    "text-[clamp(2.25rem,6.5vw,4rem)] font-normal leading-[1.04] tracking-[-0.03em] text-balance sm:tracking-[-0.045em]";
export const displayMd =
    "text-[clamp(1.6rem,3.6vw,2.35rem)] font-normal leading-[1.1] tracking-[-0.03em] text-balance";

export const lede = "text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.65] text-muted";
export const ledeOnInk = "text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.65] text-on-ink-muted";

/** Small caps-ish meta label. */
export const label = "text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted";
export const labelOnInk = "text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-on-ink-muted";

/** Section kicker. Monochrome, so it earns its emphasis from weight and
 *  letterspacing rather than from a colour. */
export const eyebrow = "text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground";
export const eyebrowOnInk = "text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-on-ink";

/* --- Controls ------------------------------------------------------------ */

const btnBase =
    "inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded border border-transparent px-6 text-sm font-semibold no-underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[3px] motion-reduce:transition-none";

/** Solid ink on a paper background. */
export const btnInk = `${btnBase} bg-foreground text-background hover:bg-muted focus-visible:outline-foreground`;

/** Solid paper on the ink plate. */
export const btnPaper = `${btnBase} bg-on-ink text-ink-panel hover:bg-on-ink-muted focus-visible:outline-on-ink`;

/** Outlined, for the secondary action in the masthead. */
export const btnQuiet =
    "inline-flex min-h-10 items-center rounded border border-rule-on-ink px-4 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-on-ink no-underline transition-colors duration-150 hover:bg-on-ink hover:text-ink-panel focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-on-ink motion-reduce:transition-none";

/** Two-line store badge. Fixed format so a long store name cannot reflow it. */
export const btnStore = "justify-start min-h-[3.5rem] text-left";
export const btnStoreCaption =
    "block text-[0.6rem] font-medium uppercase leading-tight tracking-[0.14em] opacity-65";
export const btnStoreName = "block text-base leading-snug";

/* --- Surfaces ------------------------------------------------------------ */

/** A sheet of paper. Panels are never nested — regions inside one are divided
 *  by hairlines (`divide-y divide-rule`) instead. */
export const panel = "border border-rule bg-surface";
export const panelPad = "p-5 sm:p-7 lg:p-8";

/** Masthead / colophon plate. */
export const plate = "bg-ink-panel text-on-ink";

/** Underline-on-hover nav link for the ink plate. */
export const plateLink =
    "relative inline-block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-on-ink-muted no-underline transition-colors duration-150 hover:text-on-ink focus-visible:text-on-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none";
