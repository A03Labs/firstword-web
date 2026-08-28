# Bible API

A public, unauthenticated JSON API for the two FirstWord paraphrase editions of the
World English Bible, plus the human-facing download pages and online reader.

> Based on the World English Bible (WEB), a public-domain Bible translation. Gen Z and
> Nigerian Pidgin wording is an automated paraphrase and should receive editorial and
> theological review before publication.

Neither edition is an independently translated critical text.

## Translations

| ID       | Name                  | Language        | Source              | Verses | Download page    |
| -------- | --------------------- | --------------- | ------------------- | ------ | ---------------- |
| `GENZ`   | Gen Z Bible           | English         | World English Bible | 31,105 | `/bibles/genz`   |
| `PIDGIN` | Nigerian Pidgin Bible | Nigerian Pidgin | World English Bible | 31,105 | `/bibles/pidgin` |

The two IDs are stable and case-sensitive. `genz` is **not** accepted as an alias — a
second accepted spelling would become a second cache key and a second thing to keep
working forever.

## Where the source files live

```
data/bibles/GENZ/full.json      # committed source: flat array of 31,105 verses
data/bibles/PIDGIN/full.json    # committed source
```

Each file is the flat format the API's download endpoint serves back byte-for-byte:

```json
[{ "book": 1, "chapter": 1, "verse": 1, "text": "In the beginning, …" }]
```

`book` is 1–66 in canonical Protestant order (Genesis = 1, John = 43, Revelation = 66).

To replace a translation's text, overwrite its `full.json` and regenerate. The
generator refuses to write anything if the new file is not 31,105 unique references
spread over the canonical 66 books and 1,190 chapters, so a truncated or misordered
drop-in fails the build instead of reaching production.

## How to regenerate the chapter files

```bash
npm run build:bible-data
```

This reads each `full.json` and writes:

```
data/bibles/<ID>/index.json                    # verse count per chapter (~12 KB)
data/bibles/<ID>/chapters/<book>/<chapter>.json  # 1,190 files per translation
```

Both outputs are generated, are listed in `.gitignore`, and are rebuilt from scratch on
every run — a chapter deleted from the source cannot survive as a stale file. The script
runs automatically as `prebuild`, as part of `npm run dev`, and as `pretest`, so a fresh
clone never serves missing data.

Each chapter file holds the **exact response body** of the chapter endpoint. That is the
whole point of the preprocessing step: the route reads one ~3 KB file and returns the
bytes without a `JSON.parse`, so no request ever scans the 31,105-verse array.

The script also validates the source against `src/lib/bible/books.ts` (the 66-book table
with canonical chapter counts that the reader's pickers use) and against each entry's
declared `verseCount` in `src/lib/bible/translations.ts`.

## Endpoints

Every endpoint accepts `GET`, `HEAD`, and `OPTIONS` only. Anything else gets a `405` with
an `Allow` header. None of them require authentication.

### `GET /api/bibles`

The catalog.

```json
{
  "translations": [
    {
      "id": "GENZ",
      "name": "Gen Z Bible",
      "language": "English",
      "direction": "ltr",
      "source": "World English Bible",
      "verseCount": 31105
    },
    {
      "id": "PIDGIN",
      "name": "Nigerian Pidgin Bible",
      "language": "Nigerian Pidgin",
      "direction": "ltr",
      "source": "World English Bible",
      "verseCount": 31105
    }
  ]
}
```

### `GET /api/bibles/:translationId`

One translation's metadata plus its full book and chapter structure, including the verse
count of every chapter. Lets a client build book and chapter pickers in one request
instead of probing for 404s.

```json
{
  "id": "GENZ",
  "name": "Gen Z Bible",
  "language": "English",
  "direction": "ltr",
  "source": "World English Bible",
  "verseCount": 31105,
  "downloadUrl": "/api/bibles/GENZ/download",
  "books": [
    {
      "book": 1,
      "name": "Genesis",
      "testament": "old",
      "chapters": [{ "chapter": 1, "verseCount": 31 }]
    }
  ]
}
```

### `GET /api/bibles/:translationId/:book/:chapter`

One chapter.

```json
{
  "translationId": "GENZ",
  "book": 43,
  "chapter": 3,
  "verses": [{ "verse": 1, "text": "…" }]
}
```

### `GET /api/bibles/:translationId/:book/:chapter/:verse`

One verse.

```json
{
  "translationId": "GENZ",
  "book": 43,
  "chapter": 3,
  "verse": 16,
  "text": "…"
}
```

### `GET /api/bibles/:translationId/download`

The complete translation in the original flat format, streamed from disk.

```
Content-Type: application/json; charset=utf-8
Content-Disposition: attachment; filename="genz-bible.json"
```

`PIDGIN` yields `filename="pidgin-bible.json"`. `HEAD` returns the same headers, including
`Content-Length`, without opening the file.

## Validation and errors

| Parameter       | Accepted                                                   |
| --------------- | ---------------------------------------------------------- |
| `translationId` | exactly `GENZ` or `PIDGIN`                                 |
| `book`          | integer 1–66, no leading zeros, no sign, no decimal point   |
| `chapter`       | positive integer, must exist in that book                   |
| `verse`         | positive integer, must exist in that chapter                |

Every failure uses one envelope:

```json
{ "error": { "code": "INVALID_BOOK", "message": "Book must be an integer from 1 to 66." } }
```

| Status | Code                  | Cause                                              |
| ------ | --------------------- | -------------------------------------------------- |
| 400    | `INVALID_BOOK`        | book is not an integer in 1–66                      |
| 400    | `INVALID_CHAPTER`     | chapter is not a positive integer                   |
| 400    | `INVALID_VERSE`       | verse is not a positive integer                     |
| 404    | `UNKNOWN_TRANSLATION` | translation is not hosted here                      |
| 404    | `CHAPTER_NOT_FOUND`   | chapter does not exist in that book                 |
| 404    | `VERSE_NOT_FOUND`     | verse does not exist in that chapter                |
| 500    | `INTERNAL_ERROR`      | the data could not be read; details are logged only |

Segments are validated left to right, so a request with several bad segments reports the
leftmost one. Error messages never contain a filesystem path, a stack, or the data root.

## Caching

| Response                              | `Cache-Control`                                                    |
| ------------------------------------- | ------------------------------------------------------------------ |
| catalog, metadata, chapter, verse, download | `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` |
| any error                             | `no-store`                                                         |
| `/_next/static/*`                     | `public, max-age=31536000, immutable` (set by Next.js)             |

The Bible files only change on deploy, so an hour at the CDN with a day of
stale-while-revalidate is safe: the worst case is a client holding a verse for an hour
after a text correction ships. Errors are never cached, so a `404` today does not outlive
the deploy that adds the missing data. Versioned build output under `/_next/static` has a
content hash in the filename and is already served by Next.js as immutable for a year;
that header cannot be overridden, so nothing in `next.config.ts` needs to set it.

### Compression

The API negotiates its own `Content-Encoding`, preferring Brotli and falling back to gzip,
and sets `Vary: Accept-Encoding`. Psalm 119 goes out as 4,961 bytes of Brotli instead of
17,034 bytes of JSON.

This is deliberate rather than redundant: Next's built-in `compress` option covers rendered
HTML but **does not reach Route Handler responses**, which leave `next start` chunked and
uncompressed. Bodies under 1 KB are left alone, where the header overhead would cost more
than it saves, and a client that sends `Accept-Encoding: identity` or `br;q=0, gzip;q=0`
gets plain JSON.

The complete-file download is not compressed in-process — it is streamed with an accurate
`Content-Length`, which a 5 MB in-memory compress would have to give up. CDNs compress it
at the edge. A CDN that has already compressed a response sees `Content-Encoding` set and
passes ours through rather than double-encoding it.

## CORS

Native mobile clients send no `Origin` header and are unaffected by CORS; the headers
below exist for browsers.

- **Unset `BIBLE_API_ALLOWED_ORIGINS` (the default):** `Access-Control-Allow-Origin: *`.
  This is a reasonable production default — the text is public domain, the endpoints are
  unauthenticated, and no cookies or credentials are involved, so there is nothing a
  hostile page can obtain that it could not fetch server-side.
- **Set:** only the listed origins are echoed back, and `Vary: Origin` is sent so a CDN
  cannot serve one origin's response to another. A non-listed origin gets no CORS grant.

`OPTIONS` returns `204` with `Access-Control-Allow-Methods: GET, HEAD, OPTIONS`,
`Access-Control-Allow-Headers: Content-Type`, and `Access-Control-Max-Age: 86400`.

To restrict the API to FirstWord's own surfaces:

```
BIBLE_API_ALLOWED_ORIGINS=https://firstword.online,https://app.firstword.online
```

## Configuring the FirstWord mobile app

> Building the client? [**docs/mobile-integration.md**](./mobile-integration.md) is the
> full React Native / Expo guide — typed client module, chapter hook, error handling,
> offline install, and an integration checklist. This section is the summary.

Point the app at the site's origin and append `/api`. There is no API key and no auth
header.

```ts
// config/bible-api.ts
export const BIBLE_API_BASE_URL =
    process.env.EXPO_PUBLIC_BIBLE_API_BASE_URL ?? "https://firstword.online/api";

export async function fetchChapter(translationId: string, book: number, chapter: number) {
    const response = await fetch(`${BIBLE_API_BASE_URL}/bibles/${translationId}/${book}/${chapter}`, {
        headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Bible API ${response.status}`);
    return response.json();
}
```

| Environment    | Base URL                          |
| -------------- | --------------------------------- |
| Production     | `https://firstword.online/api`    |
| Local (device) | `http://<your-lan-ip>:3000/api`   |
| Local (sim)    | `http://localhost:3000/api`       |

Notes for the client:

- Treat `GENZ` and `PIDGIN` as opaque stable IDs; read the display name, language, and
  direction from `GET /api/bibles` rather than hardcoding them.
- Respect `Cache-Control`. The platform HTTP cache is enough — a chapter is a few
  kilobytes and is good for an hour.
- For offline reading, ship or fetch `/api/bibles/:id/download` once and index it locally.
  Do not call the download endpoint per chapter.
- Branch on the `error.code`, not on the message text. Messages may be reworded; codes will
  not.

## Security

- **Allowlist, not paths.** `src/lib/bible/translations.ts` holds a frozen list of two
  entries. `getTranslation` matches a request string against it with `===` and returns one
  of those objects or `undefined`; no request string ever reaches the filesystem.
- **Integers, not strings.** `src/lib/bible/validate.ts` returns `number | undefined`, and
  the path builders in `paths.ts` stringify from those numbers, so a segment cannot
  contribute a separator or a `..`.
- **A resolved-path check anyway.** Every builder passes through `assertInsideDataRoot`,
  which throws if the resolved path leaves the data root.
- **Method surface.** Only `GET`, `HEAD`, and `OPTIONS` are exported, so Next answers
  everything else with `405`.
- **No internal detail in errors.** 500s log the cause server-side and return a fixed
  message.

`tests/security.test.ts` asserts all of this, including 16 traversal spellings (raw,
percent-encoded, double-encoded, backslash, and null-byte) in each of the three
user-supplied segments, and that no route file exports a method beyond `GET`, `HEAD`, and
`OPTIONS`.

## Environment variables

None are required. Two are available:

| Variable                     | Default                    | Effect                                                                           |
| ---------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| `BIBLE_API_ALLOWED_ORIGINS`  | unset → `*`                | Comma-separated browser origin allowlist for the API.                            |
| `BIBLE_DATA_DIR`             | `<project root>/data/bibles` | Absolute path to the data root. For self-hosted layouts that keep data off the app volume. |

If you set `BIBLE_DATA_DIR`, set it for the build too — the generator writes to the same
location it is read from.

## Deployment notes

The routes read `data/bibles/**` at request time, which is not reachable from the module
graph, so Next's file tracing cannot infer it. `next.config.ts` declares it:

```ts
outputFileTracingIncludes: {
    "/api/bibles/**": ["./data/bibles/**/*.json"],
}
```

Without that, the generated chapter files are left out of the serverless bundle and every
chapter request 500s in production. If you add a Bible route outside `/api/bibles`, extend
that glob.

## Example requests

```bash
BASE=https://firstword.online   # or http://localhost:3000

# Catalog
curl -s "$BASE/api/bibles"

# One translation's structure (trimmed)
curl -s "$BASE/api/bibles/GENZ" | head -c 400

# Genesis 1
curl -s "$BASE/api/bibles/GENZ/1/1"

# John 3, Nigerian Pidgin
curl -s "$BASE/api/bibles/PIDGIN/43/3"

# John 3:16
curl -s "$BASE/api/bibles/GENZ/43/3/16"

# Complete downloads
curl -sOJ "$BASE/api/bibles/GENZ/download"      # writes genz-bible.json
curl -sOJ "$BASE/api/bibles/PIDGIN/download"    # writes pidgin-bible.json

# Download headers only
curl -sI "$BASE/api/bibles/GENZ/download"

# Brotli-compressed chapter (curl decodes it with --compressed)
curl -s --compressed "$BASE/api/bibles/GENZ/19/119" | head -c 120
curl -sI -H "Accept-Encoding: br, gzip" "$BASE/api/bibles/GENZ/19/119"

# CORS preflight
curl -si -X OPTIONS "$BASE/api/bibles/GENZ/43/3" \
    -H "Origin: https://app.firstword.online" \
    -H "Access-Control-Request-Method: GET"

# Method not allowed
curl -si -X POST "$BASE/api/bibles"

# Unknown translation -> 404
curl -s "$BASE/api/bibles/KJV/1/1"

# Invalid book -> 400
curl -s "$BASE/api/bibles/GENZ/67/1"

# Invalid chapter -> 400
curl -s "$BASE/api/bibles/GENZ/1/0"

# Chapter outside the book -> 404
curl -s "$BASE/api/bibles/GENZ/1/51"

# Invalid verse -> 400
curl -s "$BASE/api/bibles/GENZ/43/3/abc"

# Verse outside the chapter -> 404
curl -s "$BASE/api/bibles/GENZ/1/1/999"

# Path traversal -> 404, no file served
curl -s "$BASE/api/bibles/..%2F..%2Fetc%2Fpasswd/download"
```

## Pages

| Route             | What it is                                                              |
| ----------------- | ----------------------------------------------------------------------- |
| `/bibles`         | Both translations, with links to the detail pages and the reader.       |
| `/bibles/genz`    | Gen Z Bible: facts, paraphrase warning, attribution, **Download JSON**. |
| `/bibles/pidgin`  | Same, for the Nigerian Pidgin Bible.                                    |
| `/read`           | Online reader.                                                          |

The reader keeps its reference in the query string (`/read?translation=GENZ&book=43&chapter=3`),
so a chapter can be bookmarked, shared, and reached with the back button. It offers a
translation, book, and chapter picker, previous/next chapter navigation that crosses book
boundaries, per-verse copy and share (via the Web Share API where available, falling back
to the clipboard), and distinct states for loading, an unavailable reference, and an
unreachable API — the last with a retry.

## Tests

```bash
npm test
```

`pretest` regenerates the chapter files first. The route handlers are plain
`(Request, { params })` functions on the Web Fetch API, so the tests call them directly —
no server, no listener. 128 tests across eight files cover the catalog, Genesis 1, John 3
in both translations, single verses, both complete downloads, the `Content-Type` and
`Content-Disposition` headers, unknown translations, malformed and out-of-range
book/chapter/verse values, traversal attempts, CORS and preflight behaviour, the method
surface, cache and compression headers, and that all 31,105 references survive
preprocessing with identical text.
