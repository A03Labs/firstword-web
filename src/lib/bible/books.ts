/**
 * The 66-book Protestant canon, in canonical order, as used by the World
 * English Bible and therefore by both paraphrases.
 *
 * `chapters` is static on purpose: the reader's book/chapter pickers need it
 * before any request is made, and the build script asserts these counts against
 * the source files (see `scripts/build-bible-data.mts`), so a mismatch fails the
 * build instead of silently producing a picker that offers missing chapters.
 */

export const BOOK_COUNT = 66;

/** Books 1-39 are Old Testament; 40-66 are New Testament. */
export const FIRST_NEW_TESTAMENT_BOOK = 40;

export type Testament = "old" | "new";

export type Book = {
    /** 1-66, the value used in API paths. */
    readonly number: number;
    readonly name: string;
    readonly chapters: number;
    readonly testament: Testament;
};

const NAMES_AND_CHAPTERS: readonly (readonly [string, number])[] = [
    ["Genesis", 50],
    ["Exodus", 40],
    ["Leviticus", 27],
    ["Numbers", 36],
    ["Deuteronomy", 34],
    ["Joshua", 24],
    ["Judges", 21],
    ["Ruth", 4],
    ["1 Samuel", 31],
    ["2 Samuel", 24],
    ["1 Kings", 22],
    ["2 Kings", 25],
    ["1 Chronicles", 29],
    ["2 Chronicles", 36],
    ["Ezra", 10],
    ["Nehemiah", 13],
    ["Esther", 10],
    ["Job", 42],
    ["Psalms", 151],
    ["Proverbs", 31],
    ["Ecclesiastes", 12],
    ["Song of Solomon", 8],
    ["Isaiah", 66],
    ["Jeremiah", 52],
    ["Lamentations", 5],
    ["Ezekiel", 48],
    ["Daniel", 12],
    ["Hosea", 14],
    ["Joel", 3],
    ["Amos", 9],
    ["Obadiah", 1],
    ["Jonah", 4],
    ["Micah", 7],
    ["Nahum", 3],
    ["Habakkuk", 3],
    ["Zephaniah", 3],
    ["Haggai", 2],
    ["Zechariah", 14],
    ["Malachi", 4],
    ["Matthew", 28],
    ["Mark", 16],
    ["Luke", 24],
    ["John", 21],
    ["Acts", 28],
    ["Romans", 16],
    ["1 Corinthians", 16],
    ["2 Corinthians", 13],
    ["Galatians", 6],
    ["Ephesians", 6],
    ["Philippians", 4],
    ["Colossians", 4],
    ["1 Thessalonians", 5],
    ["2 Thessalonians", 3],
    ["1 Timothy", 6],
    ["2 Timothy", 4],
    ["Titus", 3],
    ["Philemon", 1],
    ["Hebrews", 13],
    ["James", 5],
    ["1 Peter", 5],
    ["2 Peter", 3],
    ["1 John", 5],
    ["2 John", 1],
    ["3 John", 1],
    ["Jude", 1],
    ["Revelation", 22],
];

export const BOOKS: readonly Book[] = Object.freeze(
    NAMES_AND_CHAPTERS.map(([name, chapters], index) =>
        Object.freeze({
            number: index + 1,
            name,
            chapters,
            testament: index + 1 < FIRST_NEW_TESTAMENT_BOOK ? ("old" as const) : ("new" as const),
        }),
    ),
);

export function getBook(bookNumber: number): Book | undefined {
    return BOOKS[bookNumber - 1];
}

/** `"John 3"`, for page titles, share text, and error messages. */
export function formatReference(book: number, chapter: number, verse?: number): string {
    const name = getBook(book)?.name ?? `Book ${book}`;
    return verse === undefined ? `${name} ${chapter}` : `${name} ${chapter}:${verse}`;
}
