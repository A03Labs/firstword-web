# FirstWord Bible API — React Native / Expo integration

How the FirstWord mobile app reads the Gen Z and Nigerian Pidgin Bible translations.

This document is self-contained: you can copy it into the mobile app repo as
`docs/bible-api.md`. The server side lives in the `firstword-web` repo; its full reference
is [`docs/bible-api.md`](./bible-api.md) there.

**No authentication. No API key. No account.** Every endpoint below is a public `GET`.

---

## 1. Attribution — required

The app **must** display this wherever a translation is read, downloaded, or selected:

> Based on the World English Bible (WEB), a public-domain Bible translation. Gen Z and
> Nigerian Pidgin wording is an automated paraphrase and should receive editorial and
> theological review before publication.

Do not describe either edition as an independently translated critical text. Ship a short
form of the caveat ("automated paraphrase — pending editorial and theological review") in
the translation picker, so a user choosing `GENZ` or `PIDGIN` knows what they are picking.

---

## 2. Base URL

```ts
// config/bible.ts
export const BIBLE_API_BASE_URL =
    process.env.EXPO_PUBLIC_BIBLE_API_BASE_URL ?? "https://firstword.online/api";
```

| Environment      | Value                             |
| ---------------- | --------------------------------- |
| Production       | `https://firstword.online/api`    |
| Simulator        | `http://localhost:3000/api`       |
| Physical device  | `http://<your-lan-ip>:3000/api`   |

`EXPO_PUBLIC_`-prefixed variables are inlined into the bundle at build time, so this is a
build-time switch, not a runtime one. Set it in `.env`, `eas.json`, or your build profile.

### Talking to a local server from a device

Both platforms block plaintext HTTP by default, so a `http://192.168.x.x:3000` base URL
fails silently in a release-configured build. In `app.json` / `app.config.ts`, for
**development builds only**:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSAppTransportSecurity": { "NSAllowsLocalNetworking": true }
      }
    },
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

Never ship these in a production build — production traffic is HTTPS.

---

## 3. Types

```ts
// lib/bible/types.ts

/** Stable, case-sensitive. `genz` is not accepted — send `GENZ`. */
export type TranslationId = "GENZ" | "PIDGIN";

export type Translation = {
    id: TranslationId;
    name: string;
    language: string;
    direction: "ltr";
    source: string;
    verseCount: number;
};

export type Verse = {
    verse: number;
    text: string;
};

export type Chapter = {
    translationId: TranslationId;
    book: number;
    chapter: number;
    verses: Verse[];
};

export type SingleVerse = {
    translationId: TranslationId;
    book: number;
    chapter: number;
    verse: number;
    text: string;
};

/** Branch on these, never on the message text — messages may be reworded. */
export type BibleErrorCode =
    | "UNKNOWN_TRANSLATION"
    | "INVALID_BOOK"
    | "INVALID_CHAPTER"
    | "INVALID_VERSE"
    | "CHAPTER_NOT_FOUND"
    | "VERSE_NOT_FOUND"
    | "INTERNAL_ERROR";
```

---

## 4. The client

```ts
// lib/bible/client.ts
import { BIBLE_API_BASE_URL } from "../../config/bible";
import type {
    BibleErrorCode,
    Chapter,
    SingleVerse,
    Translation,
    TranslationId,
} from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * A failure the API reported, as opposed to a transport failure.
 *
 * `code` is the stable machine-readable reason; `status` is the HTTP status.
 * A network failure throws a plain `Error` instead, which is the distinction the
 * UI needs: an API error means "this reference is wrong", a transport error means
 * "try again when you have signal".
 */
export class BibleApiError extends Error {
    // Declared as fields rather than constructor parameter properties: those are
    // a TypeScript-only feature that Babel and Metro handle but strip-only
    // transpilers (esbuild's, SWC's, Node's) reject, which matters if this module
    // is ever shared with a script or a web build.
    readonly code: BibleErrorCode;
    readonly status: number;

    constructor(code: BibleErrorCode, status: number, message: string) {
        super(message);
        this.code = code;
        this.status = status;
        this.name = "BibleApiError";
        // Needed if the app's TS target is ES5, where extending built-ins
        // otherwise breaks `instanceof`.
        Object.setPrototypeOf(this, BibleApiError.prototype);
    }

    /** The reference is valid in shape but the text does not exist. */
    get isMissing(): boolean {
        return this.status === 404;
    }
}

type RequestOptions = {
    signal?: AbortSignal;
    timeoutMs?: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    // Forward an outer cancellation (screen unmounted, reference changed).
    // The `aborted` check is not redundant: a listener added after the event has
    // already fired never runs, so without it an already-cancelled request would
    // still go out.
    const forwardAbort = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    else options.signal?.addEventListener("abort", forwardAbort);

    try {
        const response = await fetch(`${BIBLE_API_BASE_URL}${path}`, {
            method: "GET",
            // Do NOT set Accept-Encoding here. See "Compression" below.
            headers: { Accept: "application/json" },
            signal: controller.signal,
        });

        if (!response.ok) {
            const body = (await response.json().catch(() => null)) as {
                error?: { code?: BibleErrorCode; message?: string };
            } | null;

            throw new BibleApiError(
                body?.error?.code ?? "INTERNAL_ERROR",
                response.status,
                body?.error?.message ?? `Bible API returned ${response.status}`,
            );
        }

        return (await response.json()) as T;
    } finally {
        clearTimeout(timeout);
        options.signal?.removeEventListener("abort", forwardAbort);
    }
}

/** The translations on offer. Cache this — it changes only on deploy. */
export async function fetchCatalog(options?: RequestOptions): Promise<Translation[]> {
    const body = await request<{ translations: Translation[] }>("/bibles", options);
    return body.translations;
}

export function fetchChapter(
    translationId: TranslationId,
    book: number,
    chapter: number,
    options?: RequestOptions,
): Promise<Chapter> {
    return request<Chapter>(`/bibles/${translationId}/${book}/${chapter}`, options);
}

export function fetchVerse(
    translationId: TranslationId,
    book: number,
    chapter: number,
    verse: number,
    options?: RequestOptions,
): Promise<SingleVerse> {
    return request<SingleVerse>(`/bibles/${translationId}/${book}/${chapter}/${verse}`, options);
}

/** The URL of the complete translation file, for the offline download. */
export function downloadUrl(translationId: TranslationId): string {
    return `${BIBLE_API_BASE_URL}/bibles/${translationId}/download`;
}
```

---

## 5. Reading a chapter

```ts
// hooks/useChapter.ts
import { useEffect, useState } from "react";

import { BibleApiError, fetchChapter } from "../lib/bible/client";
import type { Chapter, TranslationId } from "../lib/bible/types";

type State =
    | { status: "loading" }
    | { status: "ready"; chapter: Chapter }
    | { status: "missing"; message: string }
    | { status: "offline"; message: string };

export function useChapter(translationId: TranslationId, book: number, chapter: number) {
    const [state, setState] = useState<State>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setState({ status: "loading" });

        fetchChapter(translationId, book, chapter, { signal: controller.signal })
            .then((result) => setState({ status: "ready", chapter: result }))
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;

                // A 4xx means the reference is wrong and retrying will not help.
                // Anything else is a transport problem worth a retry button.
                if (error instanceof BibleApiError && error.isMissing) {
                    setState({ status: "missing", message: error.message });
                    return;
                }
                setState({
                    status: "offline",
                    message: "Could not reach FirstWord. Check your connection.",
                });
            });

        return () => controller.abort();
    }, [translationId, book, chapter, attempt]);

    return { state, reload: () => setAttempt((value) => value + 1) };
}
```

Aborting on unmount matters here: a user paging quickly through chapters fires a request
per tap, and without the abort a slow earlier response can land after a newer one and
render the wrong chapter.

---

## 6. Book and chapter numbers

`book` is `1`–`66` in canonical Protestant order — Genesis `1`, Matthew `40`, John `43`,
Revelation `66`. Both translations cover all 66 books, 1,190 chapters, and 31,105 verses.

Ship the book names and chapter counts **in the app**, not over the network, so the picker
renders instantly and works offline. To fetch the structure once (e.g. to generate that
table at build time):

```
GET /bibles/GENZ
```

```json
{
  "id": "GENZ",
  "name": "Gen Z Bible",
  "verseCount": 31105,
  "downloadUrl": "/api/bibles/GENZ/download",
  "books": [
    { "book": 1, "name": "Genesis", "testament": "old",
      "chapters": [{ "chapter": 1, "verseCount": 31 }] }
  ]
}
```

Both translations share identical structure, so one table serves both.

---

## 7. Errors

| Status | `code`                | What the UI should do                                         |
| ------ | --------------------- | ------------------------------------------------------------- |
| 400    | `INVALID_BOOK`        | A bug in the app — the reference never left a valid picker.    |
| 400    | `INVALID_CHAPTER`     | Same.                                                          |
| 400    | `INVALID_VERSE`       | Same.                                                          |
| 404    | `UNKNOWN_TRANSLATION` | Fall back to `GENZ`; the stored preference is stale.           |
| 404    | `CHAPTER_NOT_FOUND`   | "That chapter isn't in this book." Offer the book's chapter 1. |
| 404    | `VERSE_NOT_FOUND`     | Show the chapter instead of the verse.                         |
| 500    | `INTERNAL_ERROR`      | Retry once, then show the offline state.                       |

Every failure has the same body:

```json
{ "error": { "code": "CHAPTER_NOT_FOUND", "message": "Chapter 51 does not exist in book 1." } }
```

**Branch on `code`, never on `message`.** Messages are written for developers reading a
failed request and may be reworded; the codes are part of the contract. The messages are
also not localised — write your own user-facing copy, as the table above suggests.

A 400 in production means the app constructed a reference no picker should have allowed —
log it rather than showing it to the user.

---

## 8. Caching

Every successful response carries:

```
Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400
```

Errors carry `no-store`, so a 404 is never cached and a chapter fixed by a deploy appears
immediately.

The platform HTTP cache honours this for free — a re-read of the same chapter within the
hour costs no request. Do not add a caching layer of your own for online reading; a chapter
is a few kilobytes and the CDN plus the platform cache already handle it. Real offline
support is a different problem, covered next.

### Compression

The API negotiates Brotli or gzip automatically. **Do not set an `Accept-Encoding` header
yourself** — the client module above deliberately omits it. On Android, React Native's
OkHttp adds `Accept-Encoding: gzip` and decompresses transparently, but only while it owns
the header; setting it manually makes OkHttp hand you a still-compressed body. Leaving it
alone gives you a ~70% smaller transfer with no work.

---

## 9. Offline reading

For real offline support, download the translation once rather than caching chapters as
the user happens to read them.

```
GET /bibles/GENZ/download     → genz-bible.json     (~5.4 MB)
GET /bibles/PIDGIN/download   → pidgin-bible.json   (~5.3 MB)
```

Each is the complete flat array:

```json
[{ "book": 1, "chapter": 1, "verse": 1, "text": "In the beginning, …" }]
```

**Do not keep that array in memory or re-parse it on launch.** Parsing 5 MB of JSON costs
a visible pause on a mid-range device. Download once, index into SQLite, then delete the
file:

```ts
// lib/bible/offline.ts
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

import { downloadUrl } from "./client";
import type { TranslationId } from "./types";

type SourceVerse = { book: number; chapter: number; verse: number; text: string };

export async function installTranslation(translationId: TranslationId) {
    const target = `${FileSystem.cacheDirectory}${translationId}.json`;

    // Streams to disk — never holds the file in memory.
    const { uri } = await FileSystem.downloadAsync(downloadUrl(translationId), target);

    const raw = await FileSystem.readAsStringAsync(uri);
    const verses = JSON.parse(raw) as SourceVerse[];

    const db = await SQLite.openDatabaseAsync("bible.db");
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS verses (
            translation TEXT NOT NULL,
            book INTEGER NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            text TEXT NOT NULL,
            PRIMARY KEY (translation, book, chapter, verse)
        );
    `);

    // One transaction for all 31,105 rows; row-at-a-time commits take minutes.
    await db.withTransactionAsync(async () => {
        const insert = await db.prepareAsync(
            "INSERT OR REPLACE INTO verses VALUES ($t, $b, $c, $v, $x)",
        );
        try {
            for (const entry of verses) {
                await insert.executeAsync({
                    $t: translationId,
                    $b: entry.book,
                    $c: entry.chapter,
                    $v: entry.verse,
                    $x: entry.text,
                });
            }
        } finally {
            await insert.finalizeAsync();
        }
    });

    await FileSystem.deleteAsync(uri, { idempotent: true });
}

export async function readChapterOffline(
    translationId: TranslationId,
    book: number,
    chapter: number,
) {
    const db = await SQLite.openDatabaseAsync("bible.db");
    return db.getAllAsync<{ verse: number; text: string }>(
        "SELECT verse, text FROM verses WHERE translation = ? AND book = ? AND chapter = ? ORDER BY verse",
        [translationId, book, chapter],
    );
}
```

Notes:

- The primary key makes re-running `installTranslation` an idempotent refresh, so an
  interrupted install can simply be retried.
- Do the install on an explicit user action ("Make available offline"), on Wi-Fi, with
  progress — `FileSystem.createDownloadResumable` gives you a progress callback.
- Record which translations are installed and when, so you can offer a refresh after the
  text is revised. There is no version field on the endpoint yet; if you need one, ask for
  it rather than hashing 5 MB on device.
- Never call `/download` per chapter. It is a one-time install, not a read path.

---

## 10. Verifying against the API

```bash
BASE=https://firstword.online

curl -s "$BASE/api/bibles"
curl -s "$BASE/api/bibles/GENZ/43/3"        # John 3
curl -s "$BASE/api/bibles/PIDGIN/43/3/16"   # John 3:16, Pidgin
curl -sI "$BASE/api/bibles/GENZ/download"   # headers only
curl -s "$BASE/api/bibles/GENZ/1/51"        # 404 CHAPTER_NOT_FOUND
curl -s "$BASE/api/bibles/GENZ/67/1"        # 400 INVALID_BOOK
```

---

## 11. Integration checklist

- [ ] `EXPO_PUBLIC_BIBLE_API_BASE_URL` set per build profile; production is HTTPS.
- [ ] Translation IDs sent as `GENZ` / `PIDGIN`, uppercase.
- [ ] Book numbers `1`–`66`, from a shipped table rather than a network call.
- [ ] Requests aborted on unmount and on reference change.
- [ ] Error handling branches on `error.code`, with app-authored user copy.
- [ ] Distinct UI for loading, missing reference, and no connection — the last with retry.
- [ ] No hand-set `Accept-Encoding` header.
- [ ] Offline install is user-initiated and indexed into SQLite, not held in memory.
- [ ] WEB attribution and the paraphrase caveat visible in the reader and the picker.
- [ ] Cleartext-HTTP exceptions confined to development builds.
