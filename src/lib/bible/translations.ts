/**
 * The translation allowlist.
 *
 * Every filesystem lookup in `paths.ts` is keyed off an entry from this frozen
 * list, never off a raw request parameter — `getTranslation` only ever returns
 * an object that was written here by hand, so a caller cannot smuggle a path
 * segment through the translation id.
 */

export const TRANSLATION_IDS = ["GENZ", "PIDGIN"] as const;

export type TranslationId = (typeof TRANSLATION_IDS)[number];

export type Translation = {
    /** Stable public identifier. Also the directory name under `data/bibles/`. */
    readonly id: TranslationId;
    /** Lowercase URL segment for the human-facing pages (`/bibles/genz`). */
    readonly slug: string;
    readonly name: string;
    readonly language: string;
    readonly direction: "ltr";
    /** Public-domain base text every edition is paraphrased from. */
    readonly source: string;
    /** Canonical verse count, asserted against the source file by the generator. */
    readonly verseCount: number;
    /** Filename offered in `Content-Disposition` on the download endpoint. */
    readonly downloadFilename: string;
    /** One-line summary used on the download pages. */
    readonly blurb: string;
};

export const TRANSLATIONS: readonly Translation[] = Object.freeze([
    Object.freeze({
        id: "GENZ",
        slug: "genz",
        name: "Gen Z Bible",
        language: "English",
        direction: "ltr",
        source: "World English Bible",
        verseCount: 31105,
        downloadFilename: "genz-bible.json",
        blurb: "The World English Bible reworded in contemporary Gen Z English.",
    }),
    Object.freeze({
        id: "PIDGIN",
        slug: "pidgin",
        name: "Nigerian Pidgin Bible",
        language: "Nigerian Pidgin",
        direction: "ltr",
        source: "World English Bible",
        verseCount: 31105,
        downloadFilename: "pidgin-bible.json",
        blurb: "The World English Bible reworded in Nigerian Pidgin.",
    }),
]);

/** Shown on every page and in the download payload's sibling documentation. */
export const ATTRIBUTION =
    "Based on the World English Bible (WEB), a public-domain Bible translation. Gen Z and Nigerian Pidgin wording is an automated paraphrase and should receive editorial and theological review before publication.";

/** The short form of the same caveat, for tight spaces. */
export const PARAPHRASE_WARNING =
    "This is an automated paraphrase, not an independently translated critical text. It requires editorial and theological review before publication.";

/**
 * Resolve a translation id. Deliberately case-sensitive and exact: `GENZ` and
 * `PIDGIN` are documented as stable ids, so accepting `genz` here would create
 * a second spelling the mobile app could come to depend on.
 */
export function getTranslation(id: string): Translation | undefined {
    return TRANSLATIONS.find((translation) => translation.id === id);
}

export function getTranslationBySlug(slug: string): Translation | undefined {
    return TRANSLATIONS.find((translation) => translation.slug === slug);
}

export function isTranslationId(id: string): id is TranslationId {
    return TRANSLATION_IDS.some((candidate) => candidate === id);
}
