# Re-translating the Gen Z and Pidgin editions

The GENZ and PIDGIN editions are regenerated from the World English Bible (WEB) by
[`scripts/retranslate-bible.mts`](../scripts/retranslate-bible.mts), one chapter at a
time, with Claude. Every chapter is checked by code, reviewed by a second model pass,
and revised until it passes, before any of it reaches `full.json`.

It replaces the old rule-based `refresh-genz-voice.mts`, which added slang openers and
endings to the WEB text by regex and could not produce real Pidgin.

## What it does

```
pending → translate → mechanical gates → review → accepted
              ↑              │ fail          │ score < 9
              └── revise ◄───┴───────────────┘        (up to 3 attempts, then needs-human)
```

- **Source:** `data/bibles/GENZ/base.json` (the WEB text; the psalm-title HTML is removed
  before sending). Both editions are translated from it. The current Pidgin text is not
  used as input.
- **Style guides:** [`scripts/translation-guides/genz.md`](../scripts/translation-guides/genz.md)
  and [`pidgin.md`](../scripts/translation-guides/pidgin.md). These are the model's
  instructions and also the editorial standard. Edit them to change the voice.
- **Locked verses:** `data/bibles/GENZ/locked.json` holds the 118 GENZ verses written by
  the FirstWord editor: Joshua 1, Matthew 17, 18 and 20, Matthew 19:1, and Genesis 1:1, 3
  and 31. They are never regenerated, and they are sent as voice examples for the verses
  around them.
- **Mechanical gates** ([`scripts/lib/translation-quality.mts`](../scripts/lib/translation-quality.mts))
  reject a chapter that has:
  - a missing, extra or duplicated verse
  - a verse much shorter or longer than its source
  - markup, emoji or archaic English
  - in GENZ: filler openers or endings ("Listen,", "no cap", "fr"), or more than about one
    slang expression per three verses
  - in Pidgin: under 80% of verses reading as Pidgin, standard-English grammar in more
    than 15% of verses, or a Pidgin word capitalised mid-sentence ("Anybody Wey")
- **Review:** a separate request scores faithfulness, voice, naturalness and overall from
  1 to 10, and lists problems verse by verse with a fix for each. A chapter is accepted at
  **9 or higher overall and for faithfulness, with no major issues**. Otherwise it goes
  back to the translator with the reviewer's notes.
- **Resumable:** progress is saved to `data/bibles/<ID>/work/state.json` after every step.
  Stop the script at any time and run it again; nothing is paid for twice.

## Running it

1. Set an API key: `export ANTHROPIC_API_KEY=sk-ant-…`, or sign in with `ant auth login`.
2. Look at one chapter first (a synchronous request that costs a few cents):

   ```bash
   npm run retranslate -- preview PIDGIN 19 23     # Psalm 23
   npm run retranslate -- preview GENZ 43 3        # John 3
   ```

   If the voice isn't right, edit the style guide and preview again.
3. Try a small pilot before the whole Bible:

   ```bash
   npm run retranslate -- run PIDGIN --books 19,43,46
   npm run retranslate -- status PIDGIN
   ```

4. Run the whole edition. Batches usually finish within an hour; allow a few hours in
   total for the review and revise rounds:

   ```bash
   npm run retranslate -- run GENZ
   npm run retranslate -- run PIDGIN
   ```

5. Apply, rebuild and test:

   ```bash
   npm run retranslate -- apply GENZ
   npm run retranslate -- apply PIDGIN
   npm run build:bible-data && npm test
   ```

   `apply` refuses to run while any chapter is unfinished. Pass `--allow-incomplete` to
   merge the finished chapters and keep the current text for the rest. Chapters parked
   as `needs-human` use their best reviewed draft (which passed every automated gate) and
   are listed in `data/bibles/<ID>/review-report.md`. `apply` also writes `meta.json`,
   which switches on the edition-wide quality tests in `tests/translation-quality.test.ts`.

Other commands: `submit` and `collect` run a single step of `run`. `estimate` prints a
cost estimate without calling the API. `--limit N` caps the chapters per batch.

## Cost

It uses `claude-opus-5` through the Message Batches API, which is half price. Set
`RETRANSLATE_MODEL` to use a different model. `estimate` puts each edition at about $60
before thinking tokens. Expect roughly **$80–120 per edition**, or $150–250 for both,
depending on how many chapters need revising. `status` shows the actual token use and
dollar spend so far.

## What "10/10" needs beyond this script

The script can get every chapter past strict automated gates and a demanding model review.
That is not the same as a publishable Bible. Before either edition is presented as
finished:

- **A native Nigerian Pidgin speaker** should read the review report chapters, then a
  sample from every book. Treat any systematic correction they make, such as a word
  choice or a spelling, as a change to `pidgin.md` and re-run the affected chapters.
- **A theological reviewer** should check the verses readers judge an edition by: Genesis
  1–3, Exodus 20, Psalm 23 and 51, Isaiah 53, the Gospels' birth and Passion narratives,
  John 1 and 3, Romans 3–8, 1 Corinthians 13 and 15, Ephesians 2, and Revelation 21–22.
- **Editorial choices to confirm:**
  - how Pidgin renders "the LORD" (the guide uses "Oga God" or "the Lord", and "Papa" for
    God as Father)
  - how much slang GENZ should use at all

The model reviewer grades work produced by the same model family, so its scores are a
floor check, not independent sign-off. The paraphrase notice on the site should stay
until the human reviews are done.
