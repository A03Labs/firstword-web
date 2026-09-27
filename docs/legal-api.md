# Legal API

A public, unauthenticated JSON API for the FirstWord **Terms of Use** and **Privacy
Policy**. It serves the same copy as the `/terms` and `/privacy` pages, so an app can show
the documents natively, and check whether they have changed since a user accepted them,
without scraping HTML.

## Documents

| Slug      | Title          | Web page   | API                   |
| --------- | -------------- | ---------- | --------------------- |
| `terms`   | Terms of Use   | `/terms`   | `/api/legal/terms`    |
| `privacy` | Privacy Policy | `/privacy` | `/api/legal/privacy`  |

Slugs are stable and case-sensitive. `Terms` or `terms-of-use` return a 404.

## Endpoints

```
GET /api/legal                          list of documents with their last-updated dates
GET /api/legal/:document                one document in full, as structured JSON
GET /api/legal/:document?format=markdown  the same document as CommonMark
```

All three are public, unauthenticated, CORS-enabled, and accept `GET`, `HEAD`, and
`OPTIONS` only.

### `GET /api/legal`

A small list. Fetch this when the app starts to learn whether either document has
changed.

```json
{
  "documents": [
    {
      "slug": "terms",
      "title": "Terms of Use",
      "description": "The terms that govern your use of FirstWord — …",
      "lastUpdated": "2026-08-27",
      "url": "https://firstword.online/terms",
      "apiUrl": "https://firstword.online/api/legal/terms"
    },
    {
      "slug": "privacy",
      "title": "Privacy Policy",
      "description": "How FirstWord handles your account, …",
      "lastUpdated": "2026-08-18",
      "url": "https://firstword.online/privacy",
      "apiUrl": "https://firstword.online/api/legal/privacy"
    }
  ]
}
```

`lastUpdated` is an ISO date (`YYYY-MM-DD`). It is the document's version: it changes only
when the text changes.

### `GET /api/legal/:document`

The full document. The example below is trimmed.

```json
{
  "slug": "terms",
  "title": "Terms of Use",
  "description": "The terms that govern your use of FirstWord — …",
  "lastUpdated": "2026-08-27",
  "url": "https://firstword.online/terms",
  "apiUrl": "https://firstword.online/api/legal/terms",
  "lede": "These terms govern your use of the FirstWord app, website, and related services. By using FirstWord, you agree to them.",
  "sections": [
    {
      "number": 22,
      "anchor": "section-22",
      "url": "https://firstword.online/terms#section-22",
      "title": "Account and Data Deletion",
      "blocks": [
        {
          "type": "paragraph",
          "text": "You may request deletion of your FirstWord account … in accordance with our Privacy Policy. You can start that request on our account deletion page.",
          "content": [
            { "type": "text", "text": "You may request deletion of your FirstWord account … in accordance with our " },
            { "type": "link", "text": "Privacy Policy", "href": "https://firstword.online/privacy" },
            { "type": "text", "text": ". You can start that request on our " },
            { "type": "link", "text": "account deletion", "href": "https://firstword.online/delete-account" },
            { "type": "text", "text": " page." }
          ]
        }
      ]
    }
  ]
}
```

Response headers include `X-Document-Last-Updated: 2026-08-27`. The header is exposed to
browsers through `Access-Control-Expose-Headers`, so a `HEAD` request is enough to check
the version.

#### Sections

| Field    | Type   | Notes                                                       |
| -------- | ------ | ----------------------------------------------------------- |
| `number` | number | Starts at 1 and runs without gaps, in reading order          |
| `anchor` | string | The section's id on the web page, e.g. `section-07`          |
| `url`    | string | Deep link to the section on the web page                     |
| `title`  | string | Section heading                                              |
| `blocks` | array  | The body, in reading order (see below)                       |

#### Block types

There are only four block types, so a native renderer can handle every one without an HTML
engine:

| `type`      | Fields                  | Render as                                               |
| ----------- | ----------------------- | ------------------------------------------------------- |
| `paragraph` | `text`, `content`       | A paragraph. Use `content` for rich text, or `text` for plain |
| `heading`   | `text`                  | A small subheading inside the section (e.g. "1.1 Account Information") |
| `list`      | `items` (string[])      | A bulleted list                                         |
| `quote`     | `text`                  | A pull-quote or callout                                 |

A paragraph's `content` is a list of inline runs:

| `type`      | Fields         | Render as                                                 |
| ----------- | -------------- | --------------------------------------------------------- |
| `text`      | `text`         | Plain text                                                |
| `strong`    | `text`         | Bold text                                                 |
| `link`      | `text`, `href` | A tappable link. `href` is always absolute (`https://…` or `mailto:…`) |
| `lineBreak` | none           | A line break inside the paragraph                         |

`text` on a paragraph is the same content flattened, with each `lineBreak` turned into
`\n`. If you don't need bold text or links, render `text` and ignore `content`.

Links that point to this site (such as the Privacy Policy) are resolved against the host
that served the request. A staging build therefore links to staging, and production links
to production.

The client should ignore any unknown block or inline `type` rather than failing on it, so
that a new type can be added later without breaking installed apps.

### `GET /api/legal/:document?format=markdown`

The same content as CommonMark, served as `text/markdown; charset=utf-8`. Use it if the
app already has a Markdown renderer.

```markdown
# Privacy Policy

_Last updated: August 18, 2026_

FirstWord is designed to help you spend more time in God's Word, …

## 1. Information We Collect

We collect information necessary to provide and improve FirstWord.

### 1.1 Account Information

If you create an account, we may collect:

- Email address
- Name or display name
…
```

Links are absolute and wrapped in `<…>` (`[Privacy Policy](<https://firstword.online/privacy>)`),
line breaks are CommonMark hard breaks (a trailing `\`), and Markdown characters that
appear in the copy are escaped.

## Validation and errors

| Parameter  | Accepted                              |
| ---------- | ------------------------------------- |
| `document` | exactly `terms` or `privacy`          |
| `format`   | `json` (the default) or `markdown`    |

Errors use the same envelope as the Bible API:

```json
{ "error": { "code": "UNKNOWN_DOCUMENT", "message": "Unknown document. Use \"terms\" or \"privacy\"." } }
```

| Status | Code               | Cause                                      |
| ------ | ------------------ | ------------------------------------------ |
| 400    | `INVALID_FORMAT`   | `format` is anything other than `json` or `markdown` |
| 404    | `UNKNOWN_DOCUMENT` | the slug is not `terms` or `privacy`       |

Error responses are sent with `Cache-Control: no-store`.

## Caching, compression, and CORS

These work the same way as in the Bible API ([bible-api.md](bible-api.md)):

- Successful responses are sent with
  `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`.
  The copy only changes when the site is deployed, so an updated document reaches clients
  within about an hour.
- The full documents are about 27–40 KB as JSON. They are compressed with Brotli or gzip
  when the client sends `Accept-Encoding`.
- Any origin can read the API by default. Setting `BIBLE_API_ALLOWED_ORIGINS` limits
  access to the listed origins, and it applies to these routes too.

## Using it in the mobile app

### Showing a document

```ts
const BASE_URL = "https://firstword.online";

type Inline =
  | { type: "text" | "strong"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "lineBreak" };

type Block =
  | { type: "paragraph"; text: string; content: Inline[] }
  | { type: "heading" | "quote"; text: string }
  | { type: "list"; items: string[] };

export type LegalDocument = {
  slug: "terms" | "privacy";
  title: string;
  lastUpdated: string;
  url: string;
  lede: string;
  sections: { number: number; anchor: string; url: string; title: string; blocks: Block[] }[];
};

export async function fetchLegalDocument(slug: "terms" | "privacy"): Promise<LegalDocument> {
  const response = await fetch(`${BASE_URL}/api/legal/${slug}`);
  if (!response.ok) throw new Error(`Legal document ${slug}: HTTP ${response.status}`);
  return response.json();
}
```

A minimal React Native renderer:

```tsx
import { Linking, Text, View } from "react-native";

function Paragraph({ content }: { content: Inline[] }) {
  return (
    <Text>
      {content.map((inline, i) => {
        switch (inline.type) {
          case "text":
            return inline.text;
          case "strong":
            return <Text key={i} style={{ fontWeight: "700" }}>{inline.text}</Text>;
          case "link":
            return (
              <Text key={i} style={{ textDecorationLine: "underline" }}
                    onPress={() => Linking.openURL(inline.href)}>
                {inline.text}
              </Text>
            );
          case "lineBreak":
            return "\n";
          default:
            return null; // ignore unknown inline types
        }
      })}
    </Text>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <Paragraph content={block.content} />;
    case "heading":
      return <Text style={{ fontWeight: "600", textTransform: "uppercase" }}>{block.text}</Text>;
    case "list":
      return <View>{block.items.map((item) => <Text key={item}>{"• "}{item}</Text>)}</View>;
    case "quote":
      return <Text style={{ borderLeftWidth: 3, paddingLeft: 12 }}>{block.text}</Text>;
    default:
      return null; // ignore unknown block types
  }
}
```

If you only need a "Read the full terms" link, open `url` (or a section's `url`) in the
browser and skip the API.

### Asking users to accept updated documents

Store the `lastUpdated` value a user accepted, per document, for example as
`acceptedTermsVersion` on their profile. At launch:

```ts
const { documents } = await (await fetch(`${BASE_URL}/api/legal`)).json();
const changed = documents.filter(
  (doc: { slug: string; lastUpdated: string }) => doc.lastUpdated !== accepted[doc.slug],
);
if (changed.length > 0) {
  // show the changed documents and record the new lastUpdated on acceptance
}
```

Compare the dates for inequality rather than with `<` or `>`. A different value means the
document changed.

### Offline

The documents are small. Cache the last JSON response on the device, show it when the
network is unavailable, and refresh it in the background.

## Editing the documents

The copy is stored as data, and both the web pages and the API read from it:

```
src/lib/legal/terms.ts       Terms of Use
src/lib/legal/privacy.ts     Privacy Policy
src/lib/legal/types.ts       block types and the builders used to write them
src/lib/legal/documents.ts   registry, JSON and Markdown serializers
src/lib/legal/contact.ts     CONTACT_EMAIL (also used by the site footer)
src/app/components/legal-document.tsx   the web page renderer
```

Content is written with small builders:

```ts
section(18, "Privacy", [
    paragraph(
        "Your use of FirstWord is also governed by our ",
        link("Privacy Policy", "/privacy"),
        ", which explains how we collect, use, store, and protect information.",
    ),
    heading("1.1 Account Information"),
    list(["Email address", "Name or display name"]),
    quote("By using FirstWord, you acknowledge that …"),
]),
```

- Write internal links as site paths (`/privacy`). The page renders them with Next.js
  `<Link>`, and the API makes them absolute.
- Number sections 1, 2, 3, … without gaps. A test enforces this, and the numbers are also
  the page anchors (`#section-07`).
- **Change `lastUpdated` whenever the text of a document changes.** Apps use it to decide
  whether to ask users to accept the document again. Leave it unchanged for typo fixes that
  don't change the meaning, if you don't want users asked again.
- To add a new block or inline type, add it in `types.ts`, `documents.ts`
  (`toMarkdown`), `legal-document.tsx`, and this document. Installed apps skip types
  they don't know, so ship the app renderer before the content that uses the new type.

## Example requests

```bash
# List of documents
curl -s http://localhost:3000/api/legal

# Full Terms of Use as JSON
curl -s http://localhost:3000/api/legal/terms

# Privacy Policy as Markdown
curl -s "http://localhost:3000/api/legal/privacy?format=markdown"

# Version check only, no body
curl -sI http://localhost:3000/api/legal/terms | grep -i x-document-last-updated

# Brotli-compressed (curl decodes it with --compressed)
curl -s --compressed -H "Accept-Encoding: br" http://localhost:3000/api/legal/terms

# Unknown document -> 404
curl -s http://localhost:3000/api/legal/cookies

# Unsupported format -> 400
curl -s "http://localhost:3000/api/legal/terms?format=html"
```

## Tests

`tests/legal.test.ts` covers both endpoints: response shapes, absolute links, Markdown
output, the version header on `HEAD`, compression, error codes, and checks on the data
itself (valid dates, sections numbered without gaps, no empty sections).

```bash
npm test
```
