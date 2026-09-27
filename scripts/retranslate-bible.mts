/**
 * Re-translates the GENZ and PIDGIN editions from the World English Bible,
 * chapter by chapter, with Claude — then checks, reviews and revises every
 * chapter before any of it reaches `full.json`.
 *
 *     npm run retranslate -- estimate GENZ          # token and cost estimate, no API calls
 *     npm run retranslate -- preview PIDGIN 19 23   # one chapter, synchronously, printed
 *     npm run retranslate -- run GENZ               # the whole pipeline, until done
 *     npm run retranslate -- status GENZ
 *     npm run retranslate -- apply GENZ             # write full.json from accepted chapters
 *
 * `run` is `submit` + `collect` in a loop; both are also available on their own.
 * Options: `--books 19,43` limits work to those books, `--limit 20` caps
 * chapters per batch, `--rounds 4` caps the loop, `--allow-incomplete` lets
 * `apply` merge finished chapters into the existing text.
 *
 * Each chapter moves through:
 *
 *   pending → translating → (mechanical gates) → draft → reviewing → accepted
 *                  ↑                   │ fail                  │ score < bar
 *                  └──── revise ◄──────┴───────────────────────┘
 *
 * A chapter that is still failing after `MAX_ATTEMPTS` is parked as
 * `needs-human` with its best draft, and listed in the review report `apply`
 * writes — those are the chapters a native-speaker editor must look at first.
 *
 * Work is stored in `data/bibles/<ID>/work/state.json` after every step, so the
 * script can be stopped and resumed at any point without paying twice. Requests
 * go through the Message Batches API (half price) with the style guide as a
 * cached system prompt.
 */

import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Anthropic from "@anthropic-ai/sdk";

import { BOOKS } from "../src/lib/bible/books.ts";
import { checkChapter, editionMetrics, type Edition, type GateResult, type VerseText } from "./lib/translation-quality.mts";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MODEL = process.env.RETRANSLATE_MODEL ?? "claude-opus-5";
const TRANSLATE_EFFORT = "high" as const;
const REVIEW_EFFORT = "medium" as const;
const MAX_TOKENS = 32_000;
const MAX_ATTEMPTS = 3;
/** A chapter is accepted when the reviewer scores it at least this, overall and for faithfulness. */
const ACCEPT_SCORE = 9;
const POLL_MS = 60_000;

/** Batch prices, USD per million tokens (half the standard rate). */
const BATCH_PRICES: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
    "claude-opus-5": { input: 2.5, output: 12.5, cacheRead: 0.25, cacheWrite: 3.125 },
};

const EDITIONS: Record<Edition, { name: string; guide: string }> = {
    GENZ: { name: "the FirstWord Gen Z Bible (a Gen Z English paraphrase)", guide: "genz.md" },
    PIDGIN: { name: "the FirstWord Nigerian Pidgin Bible", guide: "pidgin.md" },
};

const ROOT = process.cwd();
const SOURCE_PATH = path.join(ROOT, "data", "bibles", "GENZ", "base.json");
const GUIDES_DIR = path.join(ROOT, "scripts", "translation-guides");
const editionDir = (edition: Edition) => path.join(ROOT, "data", "bibles", edition);
const statePath = (edition: Edition) => path.join(editionDir(edition), "work", "state.json");

// ---------------------------------------------------------------------------
// Source text
// ---------------------------------------------------------------------------

type Verse = { book: number; chapter: number; verse: number; text: string };
type ChapterKey = `${number}:${number}`;

/**
 * The WEB source as `base.json` holds it, minus the psalm-title markup and the
 * mixed apostrophes, which the model would otherwise copy.
 */
function cleanSource(text: string): string {
    return text
        .replace(/<[^>]+>/g, " ")
        .replace(/(\w)'(\w)/g, "$1’$2")
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

function loadSource(): Map<ChapterKey, VerseText[]> {
    const verses = JSON.parse(readFileSync(SOURCE_PATH, "utf8")) as Verse[];
    const chapters = new Map<ChapterKey, VerseText[]>();
    for (const { book, chapter, verse, text } of verses) {
        const key: ChapterKey = `${book}:${chapter}`;
        if (!chapters.has(key)) chapters.set(key, []);
        chapters.get(key)!.push({ verse, text: cleanSource(text) });
    }
    return chapters;
}

/** User-written GENZ verses that are never regenerated. */
function loadLocked(edition: Edition): Map<ChapterKey, Map<number, string>> {
    const file = path.join(editionDir(edition), "locked.json");
    const locked = new Map<ChapterKey, Map<number, string>>();
    if (!existsSync(file)) return locked;
    for (const { book, chapter, verse, text } of JSON.parse(readFileSync(file, "utf8")) as Verse[]) {
        const key: ChapterKey = `${book}:${chapter}`;
        if (!locked.has(key)) locked.set(key, new Map());
        locked.get(key)!.set(verse, text);
    }
    return locked;
}

function bookName(book: number): string {
    return BOOKS[book - 1]!.name;
}

/** Register hints for chapters where tone matters most; the guide covers the rest. */
function registerHint(book: number, chapter: number): string | undefined {
    const passion: Record<number, number[]> = { 40: [26, 27], 41: [14, 15], 42: [22, 23], 43: [18, 19] };
    if (passion[book]?.includes(chapter)) {
        return "This chapter is part of the Passion (arrest, trial, crucifixion or burial of Jesus). Sober register; no slang.";
    }
    const lists: Record<number, number[]> = { 1: [5, 10, 11, 36], 13: [1, 2, 3, 4, 5, 6, 7, 8, 9], 15: [2], 16: [7], 4: [1, 26, 33, 34] };
    if (lists[book]?.includes(chapter)) {
        return "This chapter is mostly a genealogy, census or list. Keep it plain and readable; no flourishes.";
    }
    if (book === 25) return "Lamentations: grief and lament throughout. Weighty register; no slang.";
    if (book === 18 && chapter >= 3 && chapter <= 31) return "Job’s dialogues: anguished, poetic argument. Serious register.";
    return undefined;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type Review = {
    faithfulness: number;
    voice: number;
    naturalness: number;
    overall: number;
    summary: string;
    issues: { verse: number; severity: "minor" | "major"; problem: string; fix: string }[];
};

type ChapterState = {
    status: "pending" | "translating" | "draft" | "reviewing" | "revise" | "accepted" | "needs-human";
    attempts: number;
    draft?: VerseText[];
    gate?: GateResult;
    review?: Review;
    /** Problems to fix on the next attempt: gate errors or reviewer issues. */
    feedback?: string[];
    /** Highest-scoring reviewed draft so far, kept for `needs-human`. */
    best?: { draft: VerseText[]; review: Review };
};

type BatchRecord = { id: string; kind: "translate" | "review"; keys: ChapterKey[]; createdAt: string; collected: boolean };

type Usage = { input: number; output: number; cacheRead: number; cacheWrite: number };

type State = {
    edition: Edition;
    model: string;
    chapters: Record<ChapterKey, ChapterState>;
    batches: BatchRecord[];
    usage: Usage;
};

async function loadState(edition: Edition, source: Map<ChapterKey, VerseText[]>): Promise<State> {
    const file = statePath(edition);
    const state: State = existsSync(file)
        ? (JSON.parse(await readFile(file, "utf8")) as State)
        : { edition, model: MODEL, chapters: {}, batches: [], usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } };

    const locked = loadLocked(edition);
    for (const [key, verses] of source) {
        if (state.chapters[key]) continue;
        const lockedVerses = locked.get(key);
        // A chapter the editor wrote in full needs no model at all.
        const fullyLocked = lockedVerses !== undefined && verses.every(({ verse }) => lockedVerses.has(verse));
        state.chapters[key] = fullyLocked
            ? { status: "accepted", attempts: 0, draft: verses.map(({ verse }) => ({ verse, text: lockedVerses.get(verse)! })) }
            : { status: "pending", attempts: 0 };
    }
    return state;
}

/** Atomic, so an interrupted write can never corrupt paid-for work. */
async function saveState(state: State): Promise<void> {
    const file = statePath(state.edition);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(`${file}.tmp`, `${JSON.stringify(state, null, 1)}\n`);
    await rename(`${file}.tmp`, file);
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

const TRANSLATION_SCHEMA = {
    type: "object",
    properties: {
        verses: {
            type: "array",
            items: {
                type: "object",
                properties: { verse: { type: "integer" }, text: { type: "string" } },
                required: ["verse", "text"],
                additionalProperties: false,
            },
        },
    },
    required: ["verses"],
    additionalProperties: false,
};

const REVIEW_SCHEMA = {
    type: "object",
    properties: {
        faithfulness: { type: "integer" },
        voice: { type: "integer" },
        naturalness: { type: "integer" },
        overall: { type: "integer" },
        summary: { type: "string" },
        issues: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    verse: { type: "integer" },
                    severity: { type: "string", enum: ["minor", "major"] },
                    problem: { type: "string" },
                    fix: { type: "string" },
                },
                required: ["verse", "severity", "problem", "fix"],
                additionalProperties: false,
            },
        },
    },
    required: ["faithfulness", "voice", "naturalness", "overall", "summary", "issues"],
    additionalProperties: false,
};

/**
 * The system prompt: identical bytes for every request of an edition — both
 * translation and review — so it is written to the cache once and read after.
 */
function systemPrompt(edition: Edition): Anthropic.TextBlockParam[] {
    const guide = readFileSync(path.join(GUIDES_DIR, EDITIONS[edition].guide), "utf8");
    return [
        {
            type: "text",
            text: `You work on ${EDITIONS[edition].name}, translating from the World English Bible (a public-domain translation). Follow this guide exactly.\n\n${guide}`,
            cache_control: { type: "ephemeral" },
        },
    ];
}

function numbered(verses: readonly VerseText[]): string {
    return verses.map(({ verse, text }) => `${verse} ${text}`).join("\n");
}

function translatePrompt(
    edition: Edition,
    key: ChapterKey,
    source: VerseText[],
    locked: Map<number, string> | undefined,
    chapter: ChapterState,
): string {
    const [book, chapterNumber] = key.split(":").map(Number) as [number, number];
    const parts = [
        `Translate ${bookName(book)} ${chapterNumber} into ${edition === "GENZ" ? "the Gen Z voice" : "Nigerian Pidgin"}.`,
        `Return every verse, numbered exactly as the source: ${source[0]!.verse}–${source.at(-1)!.verse} (${source.length} verses).`,
    ];
    const hint = registerHint(book, chapterNumber);
    if (hint) parts.push(hint);
    if (locked?.size) {
        parts.push(
            "These verses were written by the editor. Return them exactly as given, and match their voice in the verses around them:",
            numbered([...locked].map(([verse, text]) => ({ verse, text }))),
        );
    }
    if (chapter.draft && chapter.feedback?.length) {
        parts.push(
            "Your previous draft of this chapter was sent back. Fix every problem listed, keep what was already good, and return the full chapter again.",
            `<previous_draft>\n${numbered(chapter.draft)}\n</previous_draft>`,
            `<problems>\n${chapter.feedback.map((line) => `- ${line}`).join("\n")}\n</problems>`,
        );
    }
    parts.push(`<source>\n${numbered(source)}\n</source>`);
    return parts.join("\n\n");
}

function reviewPrompt(edition: Edition, key: ChapterKey, source: VerseText[], chapter: ChapterState): string {
    const [book, chapterNumber] = key.split(":").map(Number) as [number, number];
    const language = edition === "GENZ" ? "the Gen Z voice described in the guide" : "natural Nigerian Pidgin as described in the guide";
    const hints = chapter.gate?.warnings.length ? `\n\nAutomated checks flagged (verify, don’t assume):\n${chapter.gate.warnings.map((line) => `- ${line}`).join("\n")}` : "";
    return `You are now the reviewing editor, not the translator. Be exacting: this text will be published as Scripture.

Compare the draft of ${bookName(book)} ${chapterNumber} with the World English Bible source, verse by verse, against the guide. Score each from 1 to 10:

- faithfulness: nothing added, dropped, softened or changed in meaning; names and numbers intact
- voice: ${language}, in the register the passage calls for
- naturalness: a ${edition === "GENZ" ? "young native English speaker" : "native Pidgin speaker"} would say it this way; no awkward or stilted phrasing
- overall: 10 = publish unchanged; 9 = publishable, trivial polish at most; 8 or below = must be revised

List every problem as an issue on its verse. "major" means meaning changed or lost, content invented, wrong register for the passage, ${edition === "GENZ" ? "filler slang or flippancy" : "ungrammatical Pidgin or English left untranslated"}. Give a concrete fix for each.${hints}

<source>
${numbered(source)}
</source>

<draft>
${numbered(chapter.draft!)}
</draft>`;
}

function customId(kind: "translate" | "review", key: ChapterKey, attempt: number): string {
    return `${kind}-${key.replace(":", "-")}-${attempt}`;
}

function keyFromCustomId(id: string): ChapterKey {
    const [, book, chapter] = id.split("-");
    return `${Number(book)}:${Number(chapter)}`;
}

function requestParams(edition: Edition, prompt: string, schema: object, effort: "high" | "medium"): Anthropic.MessageCreateParamsNonStreaming {
    return {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt(edition),
        thinking: { type: "adaptive" },
        output_config: { effort, format: { type: "json_schema", schema: schema as Record<string, unknown> } },
        messages: [{ role: "user", content: prompt }],
    };
}

function textOf(message: Anthropic.Message): string {
    return message.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
}

function addUsage(state: State, usage: Anthropic.Usage): void {
    state.usage.input += usage.input_tokens;
    state.usage.output += usage.output_tokens;
    state.usage.cacheRead += usage.cache_read_input_tokens ?? 0;
    state.usage.cacheWrite += usage.cache_creation_input_tokens ?? 0;
}

// ---------------------------------------------------------------------------
// Pipeline steps
// ---------------------------------------------------------------------------

type Options = { books?: Set<number>; limit?: number; rounds: number; allowIncomplete: boolean };

function inScope(key: ChapterKey, options: Options): boolean {
    return !options.books || options.books.has(Number(key.split(":")[0]));
}

async function submit(client: Anthropic, state: State, source: Map<ChapterKey, VerseText[]>, options: Options): Promise<void> {
    const locked = loadLocked(state.edition);
    const entries = Object.entries(state.chapters) as [ChapterKey, ChapterState][];
    const cap = (keys: ChapterKey[]) => (options.limit ? keys.slice(0, options.limit) : keys);

    const toTranslate = cap(entries.filter(([key, chapter]) => inScope(key, options) && (chapter.status === "pending" || chapter.status === "revise")).map(([key]) => key));
    const toReview = cap(entries.filter(([key, chapter]) => inScope(key, options) && chapter.status === "draft").map(([key]) => key));

    for (const [kind, keys] of [["translate", toTranslate], ["review", toReview]] as const) {
        if (keys.length === 0) continue;
        const requests = keys.map((key) => {
            const chapter = state.chapters[key];
            const verses = source.get(key)!;
            return kind === "translate"
                ? {
                      custom_id: customId(kind, key, chapter.attempts + 1),
                      params: requestParams(state.edition, translatePrompt(state.edition, key, verses, locked.get(key), chapter), TRANSLATION_SCHEMA, TRANSLATE_EFFORT),
                  }
                : {
                      custom_id: customId(kind, key, chapter.attempts),
                      params: requestParams(state.edition, reviewPrompt(state.edition, key, verses, chapter), REVIEW_SCHEMA, REVIEW_EFFORT),
                  };
        });
        const batch = await client.messages.batches.create({ requests });
        for (const key of keys) state.chapters[key].status = kind === "translate" ? "translating" : "reviewing";
        state.batches.push({ id: batch.id, kind, keys, createdAt: new Date().toISOString(), collected: false });
        await saveState(state);
        console.log(`Submitted ${kind} batch ${batch.id}: ${keys.length} chapters`);
    }
}

function acceptTranslation(state: State, key: ChapterKey, source: VerseText[], verses: VerseText[]): void {
    const chapter = state.chapters[key];
    chapter.attempts += 1;
    const locked = loadLocked(state.edition).get(key);
    // Locked verses are restored rather than trusted to the model.
    const draft = [...verses]
        .sort((a, b) => a.verse - b.verse)
        .map(({ verse, text }) => ({ verse, text: locked?.get(verse) ?? text.trim() }));
    const gate = checkChapter(state.edition, source, draft, locked);
    chapter.draft = draft;
    chapter.gate = gate;
    if (gate.errors.length === 0) {
        chapter.status = "draft";
        chapter.feedback = undefined;
    } else {
        chapter.feedback = gate.errors;
        chapter.status = chapter.attempts >= MAX_ATTEMPTS ? "needs-human" : "revise";
    }
}

function acceptReview(state: State, key: ChapterKey, review: Review): void {
    const chapter = state.chapters[key];
    chapter.review = review;
    if (!chapter.best || review.overall > chapter.best.review.overall) chapter.best = { draft: chapter.draft!, review };

    const major = review.issues.some((issue) => issue.severity === "major");
    if (review.overall >= ACCEPT_SCORE && review.faithfulness >= ACCEPT_SCORE && !major) {
        chapter.status = "accepted";
        chapter.feedback = undefined;
        return;
    }
    chapter.feedback = [
        `Reviewer scores — faithfulness ${review.faithfulness}, voice ${review.voice}, naturalness ${review.naturalness}, overall ${review.overall}: ${review.summary}`,
        ...review.issues.map((issue) => `v${issue.verse} (${issue.severity}): ${issue.problem} Fix: ${issue.fix}`),
    ];
    chapter.status = chapter.attempts >= MAX_ATTEMPTS ? "needs-human" : "revise";
}

/** Puts a chapter back where it was before a request that produced nothing usable. */
function requeue(state: State, key: ChapterKey, kind: BatchRecord["kind"], reason: string): void {
    const chapter = state.chapters[key];
    console.warn(`  ${key} ${kind}: ${reason} — requeued`);
    if (kind === "review") chapter.status = "draft";
    else chapter.status = chapter.draft ? "revise" : "pending";
}

/** Collects every finished batch. Returns true while any batch is still running. */
async function collect(client: Anthropic, state: State, source: Map<ChapterKey, VerseText[]>): Promise<boolean> {
    let running = false;
    for (const record of state.batches.filter((batch) => !batch.collected)) {
        const batch = await client.messages.batches.retrieve(record.id);
        if (batch.processing_status !== "ended") {
            running = true;
            const counts = batch.request_counts;
            console.log(`Batch ${record.id} (${record.kind}): ${counts.processing} processing, ${counts.succeeded} done`);
            continue;
        }

        const seen = new Set<ChapterKey>();
        for await (const item of await client.messages.batches.results(record.id)) {
            const key = keyFromCustomId(item.custom_id);
            seen.add(key);
            if (item.result.type !== "succeeded") {
                requeue(state, key, record.kind, item.result.type);
                continue;
            }
            const message = item.result.message;
            addUsage(state, message.usage);
            if (message.stop_reason !== "end_turn") {
                requeue(state, key, record.kind, `stopped with ${message.stop_reason}`);
                continue;
            }
            let parsed: unknown;
            try {
                parsed = JSON.parse(textOf(message));
            } catch {
                requeue(state, key, record.kind, "response was not valid JSON");
                continue;
            }
            if (record.kind === "translate") acceptTranslation(state, key, source.get(key)!, (parsed as { verses: VerseText[] }).verses);
            else acceptReview(state, key, parsed as Review);
        }
        // A request missing from the results (should not happen) is retried, not lost.
        for (const key of record.keys) if (!seen.has(key)) requeue(state, key, record.kind, "no result returned");

        record.collected = true;
        await saveState(state);
        console.log(`Collected ${record.kind} batch ${record.id}`);
    }
    return running;
}

async function run(client: Anthropic, state: State, source: Map<ChapterKey, VerseText[]>, options: Options): Promise<void> {
    // Each round is one translate batch and/or one review batch; a chapter needs
    // at least two rounds (translate, review) and up to 2 × MAX_ATTEMPTS.
    for (let round = 1; round <= options.rounds; round += 1) {
        while (await collect(client, state, source)) await new Promise((resolve) => setTimeout(resolve, POLL_MS));
        const open = Object.entries(state.chapters).filter(([key, chapter]) => inScope(key as ChapterKey, options) && ["pending", "revise", "draft"].includes(chapter.status));
        if (open.length === 0) break;
        console.log(`\nRound ${round}: ${open.length} chapters to work on`);
        await submit(client, state, source, options);
    }
    while (await collect(client, state, source)) await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    printStatus(state);
}

// ---------------------------------------------------------------------------
// Reporting and output
// ---------------------------------------------------------------------------

function cost(usage: Usage): string {
    const prices = BATCH_PRICES[MODEL];
    if (!prices) return "(no price table for this model)";
    const dollars =
        (usage.input * prices.input + usage.output * prices.output + usage.cacheRead * prices.cacheRead + usage.cacheWrite * prices.cacheWrite) / 1e6;
    return `$${dollars.toFixed(2)}`;
}

function printStatus(state: State): void {
    const chapters = Object.values(state.chapters);
    const counts = new Map<string, number>();
    for (const chapter of chapters) counts.set(chapter.status, (counts.get(chapter.status) ?? 0) + 1);
    const reviewed = chapters.filter((chapter) => chapter.review);
    const mean = (pick: (review: Review) => number) =>
        reviewed.length ? (reviewed.reduce((sum, chapter) => sum + pick(chapter.review!), 0) / reviewed.length).toFixed(2) : "–";

    console.log(`\n${state.edition} — ${chapters.length} chapters, model ${state.model}`);
    for (const [status, count] of [...counts].sort()) console.log(`  ${status.padEnd(12)} ${count}`);
    console.log(`  reviewer means: overall ${mean((r) => r.overall)}, faithfulness ${mean((r) => r.faithfulness)}, voice ${mean((r) => r.voice)}, naturalness ${mean((r) => r.naturalness)}`);
    const drafts = chapters.flatMap((chapter) => chapter.draft ?? []);
    if (drafts.length) console.log("  draft metrics:", editionMetrics(state.edition, drafts));
    console.log(`  tokens: ${state.usage.input} in, ${state.usage.output} out, ${state.usage.cacheRead} cache read, ${state.usage.cacheWrite} cache write — ${cost(state.usage)}`);
}

async function apply(state: State, source: Map<ChapterKey, VerseText[]>, options: Options): Promise<void> {
    const outputPath = path.join(editionDir(state.edition), "full.json");
    const current = new Map(
        (JSON.parse(await readFile(outputPath, "utf8")) as Verse[]).map((verse) => [`${verse.book}:${verse.chapter}:${verse.verse}`, verse.text]),
    );

    // An accepted chapter uses its final draft; one parked for a human uses its
    // best reviewed draft (it passed every automated gate, and is still far
    // better than the rule-based text), and is listed in the review report.
    const usable = (chapter: ChapterState): VerseText[] | undefined =>
        chapter.status === "accepted" ? chapter.draft : chapter.status === "needs-human" ? chapter.best?.draft : undefined;
    const unfinished = (Object.entries(state.chapters) as [ChapterKey, ChapterState][]).filter(([, chapter]) => !usable(chapter));
    if (unfinished.length > 0 && !options.allowIncomplete) {
        throw new Error(
            `${unfinished.length} chapters are not accepted yet (e.g. ${unfinished.slice(0, 5).map(([key]) => key).join(", ")}). ` +
                "Finish them, or pass --allow-incomplete to keep their current text.",
        );
    }

    const output: Verse[] = [];
    for (const [key, verses] of source) {
        const [book, chapter] = key.split(":").map(Number) as [number, number];
        const chosen = usable(state.chapters[key]);
        const draft = chosen ? new Map(chosen.map(({ verse, text }) => [verse, text])) : undefined;
        for (const { verse } of verses) {
            output.push({ book, chapter, verse, text: draft?.get(verse) ?? current.get(`${key}:${verse}`)! });
        }
    }
    await writeFile(outputPath, JSON.stringify(output));

    const flagged = (Object.entries(state.chapters) as [ChapterKey, ChapterState][])
        .filter(([, chapter]) => chapter.status === "needs-human")
        .map(([key, chapter]) => {
            const [book, number] = key.split(":").map(Number) as [number, number];
            const review = chapter.best?.review ?? chapter.review;
            const lines = [`## ${bookName(book)} ${number}`, "", review ? `Best score ${review.overall}/10 — ${review.summary}` : "Failed the automated checks.", ""];
            for (const line of chapter.feedback ?? []) lines.push(`- ${line}`);
            return `${lines.join("\n")}\n`;
        });
    const report = [
        `# ${state.edition} review report`,
        "",
        `Generated by \`scripts/retranslate-bible.mts\` with ${state.model}. ${flagged.length} chapters need a human editor.`,
        "",
        ...flagged,
    ].join("\n");
    await writeFile(path.join(editionDir(state.edition), "review-report.md"), `${report}\n`);
    await writeFile(
        path.join(editionDir(state.edition), "meta.json"),
        `${JSON.stringify({ generator: "retranslate-bible", model: state.model, appliedAt: new Date().toISOString(), complete: unfinished.length === 0 }, null, 2)}\n`,
    );
    console.log(`Wrote ${outputPath} (${unfinished.length} chapters kept from the previous text). Run \`npm run build:bible-data\` next.`);
}

/** Rough numbers only (≈3.6 characters per token); makes no API calls. */
function estimate(edition: Edition, source: Map<ChapterKey, VerseText[]>): void {
    const system = systemPrompt(edition)[0]!.text.length / 3.6;
    const chapters = source.size;
    const text = [...source.values()].reduce((sum, verses) => sum + numbered(verses).length, 0) / 3.6;
    const prices = BATCH_PRICES[MODEL];
    // One translation and one review per chapter; revisions add roughly 40%.
    const input = (text * 2.2) * 1.4;
    const output = (text * 1.3 + text * 0.8 + chapters * 400) * 1.4;
    const cacheRead = system * chapters * 2 * 1.4;
    console.log(`${edition}: ${chapters} chapters, ~${Math.round(text / 1000)}k source tokens, ~${Math.round(system)} token system prompt`);
    if (prices) {
        const dollars = (input * prices.input + output * prices.output + cacheRead * prices.cacheRead) / 1e6;
        console.log(`Estimated batch cost with ${MODEL}: ~$${Math.round(dollars)} (thinking tokens can add 30–100% on top)`);
    }
}

async function preview(client: Anthropic, edition: Edition, source: Map<ChapterKey, VerseText[]>, book: number, chapter: number): Promise<void> {
    const key: ChapterKey = `${book}:${chapter}`;
    const verses = source.get(key);
    if (!verses) throw new Error(`No such chapter: ${key}`);
    const locked = loadLocked(edition).get(key);
    const params = requestParams(edition, translatePrompt(edition, key, verses, locked, { status: "pending", attempts: 0 }), TRANSLATION_SCHEMA, TRANSLATE_EFFORT);
    // Synchronous, so server-side refusal fallbacks are available (they are not on Batches).
    const message = await client.beta.messages
        .stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
        .finalMessage();
    if (message.stop_reason !== "end_turn") throw new Error(`Stopped with ${message.stop_reason}`);
    const text = message.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
    const draft = (JSON.parse(text) as { verses: VerseText[] }).verses;
    for (const { verse, text: line } of draft) console.log(`${verse} ${line}`);
    const gate = checkChapter(edition, verses, draft, locked);
    console.log("\nGate:", gate.errors.length ? gate.errors : "passed", gate.warnings.length ? gate.warnings : "");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseOptions(args: string[]): Options {
    const value = (flag: string) => {
        const index = args.indexOf(flag);
        return index >= 0 ? args[index + 1] : undefined;
    };
    return {
        books: value("--books") ? new Set(value("--books")!.split(",").map(Number)) : undefined,
        limit: value("--limit") ? Number(value("--limit")) : undefined,
        rounds: value("--rounds") ? Number(value("--rounds")) : 2 * MAX_ATTEMPTS,
        allowIncomplete: args.includes("--allow-incomplete"),
    };
}

async function main(): Promise<void> {
    const [command, editionArg, ...rest] = process.argv.slice(2);
    if (editionArg !== "GENZ" && editionArg !== "PIDGIN") {
        throw new Error("Usage: retranslate <estimate|preview|run|submit|collect|status|apply> <GENZ|PIDGIN> [options]");
    }
    const edition: Edition = editionArg;
    const source = loadSource();
    const options = parseOptions(rest);

    if (command === "estimate") return estimate(edition, source);

    const state = await loadState(edition, source);
    if (command === "status") return printStatus(state);
    if (command === "apply") return apply(state, source, options);

    const client = new Anthropic();
    if (command === "preview") return preview(client, edition, source, Number(rest[0]), Number(rest[1]));
    if (command === "submit") return submit(client, state, source, options);
    if (command === "collect") {
        await collect(client, state, source);
        return printStatus(state);
    }
    if (command === "run") return run(client, state, source, options);
    throw new Error(`Unknown command: ${command}`);
}

// Importable for tests; runs only as a script.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();

export { apply, collect, loadSource, loadState, run, submit, type Options, type State };
