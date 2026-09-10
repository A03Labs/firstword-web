import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Verse = { book: number; chapter: number; verse: number; text: string };
const cannedOpener = /^(?:Okay, so |Basically, |Here’s the thing: |Real talk: |Picture this: |So, get this: )/;

async function genzVerses() {
    const file = path.join(process.cwd(), "data", "bibles", "GENZ", "full.json");
    return JSON.parse(await readFile(file, "utf8")) as Verse[];
}

describe("GENZ source data", () => {
    it("does not rely on repetitive labels to sound conversational", async () => {
        const verses = await genzVerses();
        expect(verses).toHaveLength(31_105);
        expect(verses.filter((verse) => cannedOpener.test(verse.text))).toEqual([]);
    });

    it("blends the conversational voice into Genesis 1:31", async () => {
        const verses = await genzVerses();
        const found = verses.find(({ book, chapter, verse }) => book === 1 && chapter === 1 && verse === 31);
        expect(found?.text).toBe("God checked out everything he made, and honestly, it was all pretty awesome. Then evening came, morning followed, and just like that, day six wrapped up.");
    });

    it("uses the established dialogue-driven voice throughout Joshua 1", async () => {
        const verses = (await genzVerses()).filter(({ book, chapter }) => book === 6 && chapter === 1);

        expect(verses).toHaveLength(18);
        expect(verses[0]?.text).toContain("the Lord hit up Joshua");
        expect(verses[4]?.text).toContain("I’ve got your back");
        expect(verses[7]?.text).toContain("think about it day and night");
        expect(verses[13]?.text).toContain("you guys need to step up");
        expect(verses[17]?.text).toContain("Just stay strong and brave");
    });

    it("uses the same contextual voice throughout Matthew 17", async () => {
        const verses = (await genzVerses()).filter(({ book, chapter }) => book === 40 && chapter === 17);

        expect(verses).toHaveLength(27);
        expect(verses[0]?.text).toContain("took them up a chill mountain");
        expect(verses[3]?.text).toContain("Peter was like");
        expect(verses[8]?.text).toContain("spill the tea");
        expect(verses[17]?.text).toContain("told the evil spirit to bounce");
        expect(verses[26]?.text).toContain("Use that to pay for both of us");
    });

    it("maps the supplied Matthew 18 examples without duplicating references", async () => {
        const verses = (await genzVerses()).filter(({ book, chapter }) => book === 40 && chapter === 18);

        expect(verses).toHaveLength(35);
        expect(verses[0]?.text).toContain("Who’s the GOAT");
        expect(verses[13]?.text).toContain("it’s not the vibe");
        expect(verses[21]?.text).toContain("seventy times seven");
        expect(verses[30]?.text).toContain("coworkers saw what went down");
        expect(new Set(verses.map(({ verse }) => verse)).size).toBe(35);
    });

    it("preserves the supplied Matthew 19:1 wording", async () => {
        const verse = (await genzVerses()).find(({ book, chapter, verse }) =>
            book === 40 && chapter === 19 && verse === 1);

        expect(verse?.text).toBe(
            "So, after Jesus wrapped up his chat, he left Galilee and headed over to Judea, crossing the Jordan.",
        );
    });

    it("uses the supplied conversational voice throughout Matthew 20", async () => {
        const verses = (await genzVerses()).filter(({ book, chapter }) => book === 40 && chapter === 20);

        expect(verses).toHaveLength(34);
        expect(verses[0]?.text).toContain("a dude who owns a vineyard");
        expect(verses[12]?.text).toContain("Chill, friend");
        expect(verses[21]?.text).toContain("For sure, we can");
        expect(verses[23]?.text).toContain("lowkey annoyed");
        expect(verses[33]?.text).toContain("instantly, they could see");
        expect(new Set(verses.map(({ verse }) => verse)).size).toBe(34);
    });
});

/**
 * These guard the render rules rather than the wording, so a new rule that is
 * wrong in a way regexes are typically wrong -- ignoring sentence position,
 * ignoring word boundaries -- fails here instead of shipping.
 */
describe("GENZ render quality", () => {
    it("is rendered from a base file the render never writes to", async () => {
        const base = JSON.parse(
            await readFile(path.join(process.cwd(), "data", "bibles", "GENZ", "base.json"), "utf8"),
        ) as Verse[];

        expect(base).toHaveLength(31_105);
        expect(base.some((verse) => verse.text.includes("therefore"))).toBe(true);
    });

    it("serves plain text, with no markup left for the reader to print", async () => {
        const verses = await genzVerses();
        expect(verses.filter((verse) => /<[^>]+>/.test(verse.text))).toEqual([]);
    });

    it("uses one apostrophe character throughout", async () => {
        const verses = await genzVerses();
        expect(verses.filter((verse) => /[A-Za-z]'/.test(verse.text))).toEqual([]);
    });

    it("never opens a sentence in lowercase", async () => {
        const verses = await genzVerses();
        expect(verses.filter((verse) => /[.!?]\s+[a-z]/.test(verse.text))).toEqual([]);
    });

    it("leaves no formal connective the rules were meant to replace", async () => {
        const verses = await genzVerses();
        const leftover = verses.filter((verse) =>
            /\b(therefore|nevertheless|moreover)\b/i.test(verse.text));

        expect(leftover).toEqual([]);
    });

    it("drops a mid-clause `therefore` instead of swapping in `so`", async () => {
        const verses = await genzVerses();
        const romans = verses.find(({ book, chapter, verse }) =>
            book === 45 && chapter === 8 && verse === 1);
        const john = verses.find(({ book, chapter, verse }) =>
            book === 43 && chapter === 6 && verse === 41);

        expect(romans?.text).toMatch(/there’s now no condemnation/i);
        expect(john?.text).toMatch(/the Jews complained/i);
    });

    it("keeps rewrites inside word boundaries", async () => {
        const verses = await genzVerses();
        const mangled = verses.filter((verse) =>
            /\b(liveings?|toughly|guysow)\b/i.test(verse.text));

        expect(mangled).toEqual([]);
    });

    it("leaves an idiom alone when contracting it would break it", async () => {
        const verses = await genzVerses();
        const asked = verses.find(({ book, chapter, verse }) =>
            book === 43 && chapter === 13 && verse === 25);

        expect(asked?.text).toContain("who is it?");
        expect(verses.filter((verse) => /ho’s it\b/.test(verse.text))).toEqual([]);
    });

    it("renders no stray or collapsed whitespace", async () => {
        const verses = await genzVerses();
        const spacing = verses.filter((verse) =>
            /\s{2,}/.test(verse.text) || /\s[,.;:!?]/.test(verse.text) || verse.text.trim() === "");

        expect(spacing).toEqual([]);
    });
});

/**
 * The source text arrived with two blanket substitutions already applied to it.
 * These pin the grammatical distinction each one lost.
 */
describe("GENZ source repairs", () => {
    it("restores `beloved` where `Dear friends` was not a vocative", async () => {
        const verses = await genzVerses();
        const mark = verses.find(({ book, chapter, verse }) =>
            book === 41 && chapter === 1 && verse === 11);
        const matthew = verses.find(({ book, chapter, verse }) =>
            book === 40 && chapter === 3 && verse === 17);

        expect(mark?.text).toContain("my beloved Son");
        expect(matthew?.text).toContain("my beloved Son");
        expect(verses.filter((verse) => /\w+ Dear friends \w/.test(verse.text))).toEqual([]);
    });

    it("keeps `Dear friends` where the epistles address the reader", async () => {
        const verses = await genzVerses();
        const john = verses.find(({ book, chapter, verse }) =>
            book === 62 && chapter === 4 && verse === 7);

        expect(john?.text).toContain("Dear friends, let’s love one another");
        expect(verses.filter((verse) => verse.text.includes("Dear friends,")).length)
            .toBeGreaterThan(5);
    });

    it("tells `allow us` apart from `let’s`", async () => {
        const verses = await genzVerses();
        const sihon = verses.find(({ book, chapter, verse }) =>
            book === 5 && chapter === 2 && verse === 30);
        const babel = verses.find(({ book, chapter, verse }) =>
            book === 1 && chapter === 11 && verse === 4);

        expect(sihon?.text).toContain("wouldn’t let us pass");
        expect(babel?.text).toContain("Come, let’s build ourselves a city");
    });

    it("never capitalizes `Let’s` mid-sentence", async () => {
        const verses = await genzVerses();
        expect(verses.filter((verse) => /[a-z,;:]\s+Let’s\b/.test(verse.text))).toEqual([]);
    });

    it("repairs `God the God of Israel` without touching Romans 3:29", async () => {
        const verses = await genzVerses();
        const kings = verses.find(({ book, chapter, verse }) =>
            book === 12 && chapter === 22 && verse === 15);
        const romans = verses.find(({ book, chapter, verse }) =>
            book === 45 && chapter === 3 && verse === 29);

        expect(kings?.text).toMatch(/the God of Israel says/i);
        expect(romans?.text).toMatch(/or is God the God of Jews only\?/i);
    });
});

/**
 * The conversational rules are the aggressive ones: they move tense, possession
 * and clause shape, not just vocabulary. Each of these pins a case where the
 * obvious version of the rule produced something ungrammatical.
 */
describe("GENZ conversational rules", () => {
    it("states the future the way speech does", async () => {
        const verses = await genzVerses();
        const psalm = verses.find(({ book, chapter, verse }) =>
            book === 19 && chapter === 23 && verse === 4);

        expect(psalm?.text).toContain("I’m gonna fear no evil");
    });

    it("contracts the perfect only in front of a participle", async () => {
        const verses = await genzVerses();
        const genesis = verses.find(({ book, chapter, verse }) =>
            book === 1 && chapter === 2 && verse === 2);

        expect(genesis?.text).toContain("he’d done");
        // `I have a son` must not become `I’ve a son`.
        expect(verses.filter((verse) =>
            /(’ve|’d) (a|an|the|some|my|your|his|her|their)\b/.test(verse.text))).toEqual([]);
    });

    it("uses `the one who`, which is right whether `he who` is generic or not", async () => {
        const verses = await genzVerses();
        const generic = verses.find(({ book, chapter, verse }) =>
            book === 40 && chapter === 11 && verse === 15);
        const referring = verses.find(({ book, chapter, verse }) =>
            book === 43 && chapter === 3 && verse === 13);

        expect(generic?.text).toMatch(/the one who has ears/i);
        expect(referring?.text).toContain("the one who descended out of heaven");
        expect(verses.filter((verse) =>
            /\b(this|it’s|is|was) anyone who\b/.test(verse.text))).toEqual([]);
    });

    it("rewrites possession without doubling an existing possessive", async () => {
        const verses = await genzVerses();
        const jesse = verses.find(({ book, chapter, verse }) =>
            book === 9 && chapter === 20 && verse === 27);
        const abraham = verses.find(({ book, chapter, verse }) =>
            book === 1 && chapter === 25 && verse === 6);

        expect(jesse?.text).toContain("Jesse’s son");
        expect(abraham?.text).toContain("the sons of Abraham’s concubines");
        expect(verses.filter((verse) => verse.text.includes("’s’s"))).toEqual([]);
    });

    it("keeps `For the Chief Musician`, the one non-causal sentence-initial `For`", async () => {
        const verses = await genzVerses();
        const psalm = verses.find(({ book, chapter, verse }) =>
            book === 19 && chapter === 4 && verse === 1);

        expect(psalm?.text).toMatch(/for the Chief Musician/i);
        expect(verses.filter((verse) => /^Because the Chief/.test(verse.text))).toEqual([]);
    });

    it("does not leave `panic` with an object it cannot take", async () => {
        const verses = await genzVerses();
        const revelation = verses.find(({ book, chapter, verse }) =>
            book === 66 && chapter === 2 && verse === 10);

        expect(revelation?.text).toContain("Don’t be scared of the things");
        expect(verses.filter((verse) => /panic (of|at|about)\b/.test(verse.text))).toEqual([]);
    });

    it("moves `says` in front of the subject only when it can", async () => {
        const verses = await genzVerses();
        const ezekiel = verses.find(({ book, chapter, verse }) =>
            book === 26 && chapter === 13 && verse === 18);
        const isaiah = verses.find(({ book, chapter, verse }) =>
            book === 23 && chapter === 57 && verse === 15);

        expect(ezekiel?.text).toContain("Here’s what the Lord God says:");
        // A subject carrying a relative clause would strand its appositive.
        expect(isaiah?.text).toContain("thus says the high and lofty One");
        expect(verses.filter((verse) => /says, whose/.test(verse.text))).toEqual([]);
    });
});

describe("GENZ saturation layer", () => {
    const MARKERS =
        /\b(no cap|for real|fr|lowkey|bro|fam|dude|dudes|guys|crib|opp|opps|shook|hyped|heated|vibe|vibes|vibing|flex|clown|clueless|shady|solid|gorgeous|bounced|linked up|caught on|gonna|gotta|yeah|honestly|seriously|straight-up|huge|massive|check it out|okay so|listen|real talk|no joke|were like|was like|top dog|goat)\b/gi;

    it("carries the voice into the overwhelming majority of verses", async () => {
        const verses = await genzVerses();
        const carrying = verses.filter((verse) => MARKERS.test(verse.text)
            && (MARKERS.lastIndex = 0) === 0);

        expect(carrying.length / verses.length).toBeGreaterThan(0.95);
    });

    it("never demotes a name to make room for an opener", async () => {
        const verses = await genzVerses();
        const demoted = verses.filter((verse) =>
            /^(Okay so|Real talk|Not gonna lie|Lowkey|Listen), (jesus|god|moses|david|israel|judah|egypt|pharaoh|solomon|jerusalem|abraham|jacob|joseph|saul)\b/
                .test(verse.text));

        expect(demoted).toEqual([]);
    });

    it("demotes an ordinary word that was only capitalized for its position", async () => {
        const verses = await genzVerses();
        const proverb = verses.find(({ book, chapter, verse }) =>
            book === 20 && chapter === 3 && verse === 5);

        expect(proverb?.text).toContain("trust in God with your whole heart");
    });

    it("splits semicolon-joined clauses but leaves the genealogy lists alone", async () => {
        const verses = await genzVerses();
        const lineage = verses.find(({ book, chapter, verse }) =>
            book === 13 && chapter === 1 && verse === 5);
        const semicolons = verses.reduce(
            (total, verse) => total + (verse.text.match(/;/g) ?? []).length, 0);

        expect(lineage?.text).toContain("Gomer, Magog, Madai");
        expect(semicolons).toBeLessThan(3000);
    });

    it("leaves no opener stacked on another opener", async () => {
        const verses = await genzVerses();
        const stacked = verses.filter((verse) =>
            /^(Okay so|Real talk|Not gonna lie|Lowkey|Listen), (okay so|real talk|not gonna lie|lowkey|listen|check it out)\b/i
                .test(verse.text));

        expect(stacked).toEqual([]);
    });

    it("strips a comma-fenced `therefore` without leaving both fences", async () => {
        const verses = await genzVerses();
        const matthew = verses.find(({ book, chapter, verse }) =>
            book === 40 && chapter === 5 && verse === 19);

        expect(matthew?.text).toContain("anyone who, will break");
        expect(verses.filter((verse) => /,\s*,/.test(verse.text))).toEqual([]);
    });

    it("never ends a verse on a doubled emphasis tag", async () => {
        const verses = await genzVerses();
        const doubled = verses.filter((verse) =>
            /,\s*(no cap|for real|fr|straight-up),\s*(no cap|for real|fr|straight-up)[.!?]?$/i
                .test(verse.text));

        expect(doubled).toEqual([]);
    });
});

/**
 * The saturation layer can prepend a discourse opener to a verse, which pushes
 * the first word out of sentence-initial position and demotes its capital. The
 * assertions below therefore match the phrase rather than the verse opening --
 * what they are checking is the rewrite rule, not where the sentence starts.
 */
describe("GENZ creation-week numbering", () => {
    it("counts the days as speech does, not as ordinals", async () => {
        const days = (await genzVerses())
            .filter(({ book, chapter }) => book === 1 && chapter === 1)
            .filter(({ text }) => text.includes("wrapped up"))
            // The density layer may close the verse with an emphasis tag; the
            // numbering is what this asserts, so the tag is trimmed off first.
            .map(({ text }) => text.slice(text.lastIndexOf("day ")))
            .map((tail) => tail.replace(/,\s+[^.!?]+([.!?])$/, "$1"));

        expect(days).toEqual([
            "day one wrapped up.", "day two wrapped up.", "day three wrapped up.",
            "day four wrapped up.", "day five wrapped up.", "day six wrapped up.",
        ]);
    });
});
