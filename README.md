# FirstWord

The FirstWord landing page, policy pages, and the public Bible API, built with
[Next.js](https://nextjs.org).

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

`npm run dev` regenerates the preprocessed Bible chapter files before starting, so a fresh
clone serves the API correctly on the first request.

## Layout

| Path                     | What it is                                                       |
| ------------------------ | ---------------------------------------------------------------- |
| `src/app/page.tsx`       | Landing page                                                     |
| `src/app/privacy/`       | Privacy policy                                                   |
| `src/app/terms/`         | Terms of use                                                     |
| `src/app/delete-account/`| Account deletion instructions                                    |
| `src/app/bibles/`        | Translation catalog and per-translation download pages           |
| `src/app/read/`          | Online Bible reader                                              |
| `src/app/api/bibles/`    | Public Bible API route handlers                                  |
| `src/lib/bible/`         | Translation allowlist, canon table, validation, data access      |
| `scripts/`               | Build-time preprocessing                                         |
| `data/bibles/`           | Source and generated Bible data                                  |
| `tests/`                 | Vitest suite                                                     |

Tailwind utilities provide the styling; shared font and theme tokens live in
`src/app/globals.css`, and the class strings shared across routes live in
`src/app/components/styles.ts`.

## Bible translations

Two paraphrase editions of the public-domain World English Bible are hosted here, as a
JSON API, as complete downloads, and as an online reader.

> Based on the World English Bible (WEB), a public-domain Bible translation. Gen Z and
> Nigerian Pidgin wording is an automated paraphrase and should receive editorial and
> theological review before publication.

Neither edition is an independently translated critical text.

| ID       | Name                  | Language        | Verses | Pages            |
| -------- | --------------------- | --------------- | ------ | ---------------- |
| `GENZ`   | Gen Z Bible           | English         | 31,105 | `/bibles/genz`   |
| `PIDGIN` | Nigerian Pidgin Bible | Nigerian Pidgin | 31,105 | `/bibles/pidgin` |

### Endpoints

```
GET /api/bibles                                        catalog
GET /api/bibles/:translationId                         metadata + book/chapter structure
GET /api/bibles/:translationId/:book/:chapter          one chapter
GET /api/bibles/:translationId/:book/:chapter/:verse   one verse
GET /api/bibles/:translationId/download                complete flat JSON file
```

All are public, unauthenticated, CORS-enabled, and accept `GET`, `HEAD`, and `OPTIONS`
only.

```bash
curl -s http://localhost:3000/api/bibles
curl -s http://localhost:3000/api/bibles/GENZ/43/3
curl -s http://localhost:3000/api/bibles/GENZ/43/3/16
curl -sOJ http://localhost:3000/api/bibles/GENZ/download
```

### Data and preprocessing

The committed source of each translation is a flat array of 31,105
`{book, chapter, verse, text}` records:

```
data/bibles/GENZ/full.json
data/bibles/PIDGIN/full.json
```

`npm run build:bible-data` splits each one into per-chapter files plus a small index:

```
data/bibles/<ID>/index.json
data/bibles/<ID>/chapters/<book>/<chapter>.json    # 1,190 files per translation
```

Those outputs are generated and gitignored. The script runs automatically as `prebuild`,
inside `npm run dev`, and as `pretest`. Each chapter file holds the exact response body of
the chapter endpoint, so a request reads one ~3 KB file and returns its bytes — no request
ever scans the full translation, and downloads are streamed rather than buffered.

Full documentation — response shapes, error codes, caching, CORS, security model, and a
curl example for every endpoint — is in [docs/bible-api.md](docs/bible-api.md). The
React Native / Expo integration guide for the FirstWord mobile app, including a
copy-paste client, offline install, and an integration checklist, is in
[docs/mobile-integration.md](docs/mobile-integration.md).

## Environment variables

None are required. Two are available:

| Variable                    | Default                      | Effect                                                            |
| --------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `BIBLE_API_ALLOWED_ORIGINS` | unset → `*`                  | Comma-separated browser origin allowlist for the Bible API.       |
| `BIBLE_DATA_DIR`            | `<project root>/data/bibles` | Absolute path to the Bible data root, for self-hosted layouts.    |

## Commands

```bash
npm run dev                 # regenerate Bible data, then start the dev server
npm run build:bible-data    # regenerate the preprocessed chapter files
npm run typecheck           # tsc --noEmit
npm run lint                # eslint
npm test                    # vitest run (regenerates data first)
npm run build               # production build (regenerates data first)
npm run start               # serve the production build
```
