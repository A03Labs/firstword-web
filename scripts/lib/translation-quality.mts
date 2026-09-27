/**
 * Mechanical quality gates for the GENZ and PIDGIN editions.
 *
 * These catch what a machine can catch reliably — lost or invented verses,
 * markup, filler tics, English left untranslated, find-and-replace scars — so
 * the model reviewer in `retranslate-bible.mts` can spend its attention on
 * meaning and voice. A chapter must pass every `error` here before it is
 * reviewed; `warnings` are passed to the reviewer as hints.
 *
 * Standalone on purpose (no imports): the translation script runs it under
 * plain Node type stripping, and the tests import it through Vitest.
 */

export type Edition = "GENZ" | "PIDGIN";
export type VerseText = { verse: number; text: string };
export type GateResult = { errors: string[]; warnings: string[] };

/**
 * Tics the rule-based GENZ render bolted onto 80% of verses. Banned at the
 * edges of a verse outright; inside a verse they are rationed per chapter.
 */
const GENZ_OPENERS = /^[“‘"']*(listen|lowkey|okay so|ok so|real talk|not gonna lie|ngl|basically|here’s the thing|picture this|so, get this)\b[,:]?/i;
const GENZ_TAGS = /(,|\s)\s*(fr|no cap|for real|straight-up|straight up|periodt|deadass|on god)[.!?”’"']*\s*$/i;
// Only words with no ordinary Bible sense: `goat`, `lit`, `bet`, `based` and
// `mid` are left out because the source uses them literally.
const GENZ_SLANG =
    /\b(no cap|fr|lowkey|highkey|deadass|periodt|slay|bussin|rizz|sus|vibes?|vibed|vibing|spill the tea|bro|bruh|fam|yeet|stan|ghosted)\b/gi;

/**
 * Words and constructions that mark a clause as Pidgin rather than English.
 * Deliberately excludes words the two share (`for`, `go`, `no`, `say`, `come`),
 * which would let an untranslated English verse pass.
 */
const PIDGIN_MARKERS =
    /\b(dey|na|wey|dem|una|don|im|pikin|wetin|sabi|abeg|oya|sef|waka|comot|wahala|palava|kpatakpata|well well|small small|no go|no be|make (?:una|we|dem|e|im|you|I|am)|say make|e (?:don|no|go|be|dey|get|come|talk|tell|say|do|make|take|give)|like say|how e|wetin|anybody wey|everybody wey|person wey)\b/i;
/** Pidgin function words that must never be capitalised mid-sentence. */
// The lookahead keeps English contractions (`Don’t`) and names (`Dan`) out.
const PIDGIN_CAPITAL_SCAR = /[a-z,;:] (Wey|Dey|Don|Go|Na|Dem|Una|Am|Im|Make|Say|No be|Wetin)(?![\w’'])/;
/** Standard-English grammar that a Pidgin verse should not still contain. */
const PIDGIN_ENGLISH = /\b(shall|shalt|hath|unto|thee|thou|thy|have been|has been|had been|you are|he is|she is|they are|it is|we are|there was|there were|is not|are not|was not|were not|will be)\b/i;

const ARCHAIC = /\b(thee|thou|thy|thine|shalt|hath|doth|unto|ye|verily|behold)\b/i;
const MARKUP = /<[^>]*>|&[a-z]+;|\*\*|__|#{1,6}\s/i;
const EMOJI = /\p{Extended_Pictographic}/u;

function words(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}

/** Share of `verses` matching `pattern`. */
export function share(verses: readonly VerseText[], pattern: RegExp): number {
    if (verses.length === 0) return 0;
    return verses.filter(({ text }) => pattern.test(text)).length / verses.length;
}

/**
 * Checks one translated chapter against its source.
 *
 * `locked` verses (user-supplied text) are compared for exact equality instead
 * of being checked for voice.
 */
export function checkChapter(
    edition: Edition,
    source: readonly VerseText[],
    output: readonly VerseText[],
    locked: ReadonlyMap<number, string> = new Map(),
): GateResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const expected = source.map(({ verse }) => verse);
    const got = output.map(({ verse }) => verse);
    const missing = expected.filter((verse) => !got.includes(verse));
    const extra = got.filter((verse) => !expected.includes(verse));
    const duplicated = got.filter((verse, index) => got.indexOf(verse) !== index);
    if (missing.length) errors.push(`missing verses: ${missing.join(", ")}`);
    if (extra.length) errors.push(`verses not in the source: ${extra.join(", ")}`);
    if (duplicated.length) errors.push(`duplicated verses: ${duplicated.join(", ")}`);
    if (errors.length) return { errors, warnings };

    const sourceByVerse = new Map(source.map(({ verse, text }) => [verse, text]));
    const free = output.filter(({ verse }) => !locked.has(verse));

    for (const { verse, text } of output) {
        const where = `v${verse}`;
        const lockedText = locked.get(verse);
        if (lockedText !== undefined) {
            if (text !== lockedText) errors.push(`${where}: locked verse was changed`);
            continue;
        }
        const original = sourceByVerse.get(verse) ?? "";
        if (text.trim() === "") errors.push(`${where}: empty`);
        if (text !== text.trim() || /\s{2,}/.test(text)) errors.push(`${where}: stray whitespace`);
        if (MARKUP.test(text)) errors.push(`${where}: contains markup`);
        if (EMOJI.test(text)) errors.push(`${where}: contains an emoji`);
        if (ARCHAIC.test(text)) errors.push(`${where}: archaic English ("${text.match(ARCHAIC)![0]}")`);

        // Length drift is the cheapest signal that content was dropped or invented.
        // Short verses ("Jesus wept.") are too noisy to judge by ratio.
        if (original.length >= 40) {
            const ratio = text.length / original.length;
            if (ratio < 0.45) errors.push(`${where}: much shorter than the source (${ratio.toFixed(2)}×) — content may be missing`);
            else if (ratio > 2.6) errors.push(`${where}: much longer than the source (${ratio.toFixed(2)}×) — content may be invented`);
            else if (ratio < 0.6 || ratio > 2) warnings.push(`${where}: length ${ratio.toFixed(2)}× the source`);
        }

        if (edition === "GENZ") {
            if (GENZ_OPENERS.test(text)) errors.push(`${where}: filler opener ("${text.match(GENZ_OPENERS)![0]}")`);
            if (GENZ_TAGS.test(text)) errors.push(`${where}: filler tag at the end ("${text.match(GENZ_TAGS)![2]}")`);
        } else {
            if (PIDGIN_CAPITAL_SCAR.test(text)) errors.push(`${where}: capitalised Pidgin word mid-sentence ("${text.match(PIDGIN_CAPITAL_SCAR)![1]}")`);
            if (PIDGIN_ENGLISH.test(text)) warnings.push(`${where}: standard-English grammar left in ("${text.match(PIDGIN_ENGLISH)![0]}")`);
        }
    }

    if (edition === "GENZ") {
        // Slang is seasoning: more than about one item per three verses reads as parody.
        const slang = free.reduce((count, { text }) => count + (text.match(GENZ_SLANG)?.length ?? 0), 0);
        const allowed = Math.max(2, Math.ceil(free.length / 3));
        if (slang > allowed) errors.push(`too much slang: ${slang} items in ${free.length} verses (limit ${allowed})`);
    } else {
        // Lists of names and numbers legitimately carry no Pidgin grammar, so only
        // verses long enough to have a clause are held to it.
        const prose = free.filter(({ text }) => words(text) >= 8);
        const coverage = share(prose, PIDGIN_MARKERS);
        if (prose.length >= 3 && coverage < 0.8) {
            errors.push(`only ${(coverage * 100).toFixed(0)}% of verses read as Pidgin (need 80%)`);
        }
        const english = share(prose, PIDGIN_ENGLISH);
        if (prose.length >= 3 && english > 0.15) {
            errors.push(`${(english * 100).toFixed(0)}% of verses still use standard-English grammar (limit 15%)`);
        }
    }

    return { errors, warnings };
}

/** Whole-edition metrics, for the status report and the data tests. */
export function editionMetrics(edition: Edition, verses: readonly VerseText[]) {
    const prose = verses.filter(({ text }) => words(text) >= 8);
    return {
        verses: verses.length,
        markup: verses.filter(({ text }) => MARKUP.test(text)).length,
        archaic: share(verses, ARCHAIC),
        ...(edition === "GENZ"
            ? {
                  fillerOpeners: share(verses, GENZ_OPENERS),
                  fillerTags: share(verses, GENZ_TAGS),
                  slangPerVerse:
                      verses.reduce((count, { text }) => count + (text.match(GENZ_SLANG)?.length ?? 0), 0) /
                      Math.max(1, verses.length),
              }
            : {
                  pidginCoverage: share(prose, PIDGIN_MARKERS),
                  englishGrammar: share(prose, PIDGIN_ENGLISH),
                  capitalScars: share(verses, PIDGIN_CAPITAL_SCAR),
              }),
    };
}
