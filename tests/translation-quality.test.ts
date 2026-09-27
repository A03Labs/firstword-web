import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { checkChapter, editionMetrics, type Edition } from "../scripts/lib/translation-quality.mts";

type Verse = { book: number; chapter: number; verse: number; text: string };

const dataDir = path.join(process.cwd(), "data", "bibles");
const read = (file: string) => JSON.parse(readFileSync(path.join(dataDir, file), "utf8")) as Verse[];
const numbered = (...texts: string[]) => texts.map((text, index) => ({ verse: index + 1, text }));

const SOURCE = numbered(
    "In the beginning, God created the heavens and the earth.",
    "The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters.",
    "God said, “Let there be light,” and there was light.",
    "God saw the light, and saw that it was good. God divided the light from the darkness.",
);

describe("mechanical gates", () => {
    it("rejects missing, invented and duplicated verses", () => {
        const [first, second, third] = SOURCE;
        const { errors } = checkChapter("GENZ", SOURCE, [first!, second!, third!, third!, { verse: 9, text: "Extra." }]);
        expect(errors.join(" ")).toMatch(/missing verses: 4/);
        expect(errors.join(" ")).toMatch(/not in the source: 9/);
        expect(errors.join(" ")).toMatch(/duplicated verses: 3/);
    });

    it("rejects the filler tics the rule-based GENZ render added", () => {
        const output = SOURCE.map(({ verse, text }) => ({ verse, text: verse === 2 ? `Listen, ${text} no cap.` : text }));
        const { errors } = checkChapter("GENZ", SOURCE, output);
        expect(errors.some((error) => error.includes("filler opener"))).toBe(true);
        expect(errors.some((error) => error.includes("filler tag"))).toBe(true);
    });

    it("rations slang per chapter", () => {
        const output = SOURCE.map(({ verse }) => ({ verse, text: `God was vibing, bro, and it was lowkey good, fam, no doubt about any of it.` }));
        expect(checkChapter("GENZ", SOURCE, output).errors.join(" ")).toMatch(/too much slang/);
    });

    it("does not count Bible words that look like slang", () => {
        const output = numbered(
            "Then they took a goat from the flock and lit the lamp before the Lord.",
            "The priest will bet nothing on it; it’s based on the law given in the middle of the camp.",
            "God said, “Let there be light,” and just like that, light showed up.",
            "God saw that the light was good, and he split the light from the dark.",
        );
        expect(checkChapter("GENZ", SOURCE, output).errors).toEqual([]);
    });

    it("rejects markup, emoji, archaic English and runaway length changes", () => {
        const output = numbered(
            "<b>At the start</b>, God made the heavens and the earth.",
            "The earth was empty 🙏 and dark, and God’s Spirit hovered over the water.",
            "God said unto them, “Let there be light,” and light showed up.",
            "Good.",
        );
        const errors = checkChapter("GENZ", SOURCE, output).errors.join(" ");
        expect(errors).toMatch(/v1: contains markup/);
        expect(errors).toMatch(/v2: contains an emoji/);
        expect(errors).toMatch(/v3: archaic English/);
        expect(errors).toMatch(/v4: much shorter than the source/);
    });

    it("insists that locked verses come back unchanged", () => {
        const locked = new Map([[1, "At the very start, God created the heavens and the earth."]]);
        const output = SOURCE.map(({ verse, text }) => ({ verse, text: verse === 1 ? "In the beginning God made everything." : text }));
        expect(checkChapter("GENZ", SOURCE, output, locked).errors).toContain("v1: locked verse was changed");
    });

    it("rejects English left untranslated in a Pidgin chapter", () => {
        expect(checkChapter("PIDGIN", SOURCE, SOURCE).errors.join(" ")).toMatch(/read as Pidgin/);
    });

    it("rejects find-and-replace capitals in Pidgin, but not English contractions", () => {
        const output = numbered(
            "For the beginning, God create heaven and earth, na so e be.",
            "The earth no get shape, e empty, and darkness cover the deep water. God Spirit dey hover on top the water.",
            "God talk say, “Make light dey,” and light come dey. Don’t forget am.",
            "God see say the light good, and God separate the light from the darkness Wey dey there.",
        );
        const errors = checkChapter("PIDGIN", SOURCE, output).errors;
        expect(errors).toEqual(['v4: capitalised Pidgin word mid-sentence ("Wey")']);
    });

    it("passes natural Pidgin", () => {
        const output = numbered(
            "For the beginning, God create heaven and earth, na so e start.",
            "The earth no get shape, e empty, and darkness cover the deep water. God Spirit dey hover on top the water.",
            "God talk say, “Make light dey,” and light come dey.",
            "God see say the light good well well, and e separate the light from the darkness wey dey before.",
        );
        expect(checkChapter("PIDGIN", SOURCE, output)).toEqual({ errors: [], warnings: [] });
    });
});

describe("GENZ editor-written verses", () => {
    it("are all still in full.json exactly as written", () => {
        const full = new Map(read("GENZ/full.json").map((v) => [`${v.book}:${v.chapter}:${v.verse}`, v.text]));
        const locked = read("GENZ/locked.json");
        expect(locked.length).toBe(118);
        for (const verse of locked) expect(full.get(`${verse.book}:${verse.chapter}:${verse.verse}`)).toBe(verse.text);
    });
});

/**
 * Edition-wide bars for text produced by `scripts/retranslate-bible.mts`.
 * Skipped until its output is applied (it writes `meta.json`), because the
 * current rule-based text fails them — which is the point.
 */
for (const edition of ["GENZ", "PIDGIN"] as const satisfies readonly Edition[]) {
    const applied = existsSync(path.join(dataDir, edition, "meta.json"));
    describe.skipIf(!applied)(`${edition} retranslated text`, () => {
        const metrics = () => editionMetrics(edition, read(`${edition}/full.json`)) as Record<string, number>;

        it("has every verse, with no markup or archaic English", () => {
            const m = metrics();
            expect(m.verses).toBe(31_105);
            expect(m.markup).toBe(0);
            expect(m.archaic).toBeLessThan(0.001);
        });

        if (edition === "GENZ") {
            it("does not lean on filler tics or heavy slang", () => {
                const m = metrics();
                expect(m.fillerOpeners).toBeLessThan(0.01);
                expect(m.fillerTags).toBeLessThan(0.005);
                expect(m.slangPerVerse).toBeLessThan(0.34);
            });
        } else {
            it("reads as Pidgin throughout, without find-and-replace scars", () => {
                const m = metrics();
                expect(m.pidginCoverage).toBeGreaterThan(0.8);
                expect(m.englishGrammar).toBeLessThan(0.15);
                expect(m.capitalScars).toBeLessThan(0.002);
            });
        }
    });
}
