/**
 * Turns raw route segments into validated values, or into the 400/404 response
 * that should be returned instead.
 *
 * Shared by the chapter, verse, download, and translation-metadata routes so all
 * four reject the same inputs with the same status codes and error codes.
 */

import { BOOK_COUNT } from "./books";
import { jsonError } from "./http";
import { getTranslation, TRANSLATION_IDS, type Translation } from "./translations";
import { chapterExistsInCanon, parseBookNumber, parsePositiveInt } from "./validate";

export type Resolution<T> = { ok: true; value: T } | { ok: false; response: Response };

function fail<T>(response: Response): Resolution<T> {
    return { ok: false, response };
}

/**
 * An unknown translation is a 404 rather than a 400: `/api/bibles/KJV` is a
 * well-formed request for a translation this API does not host.
 */
export function resolveTranslation(
    request: Request,
    raw: string,
): Resolution<Translation> {
    const translation = getTranslation(raw);
    if (!translation) {
        return fail(
            jsonError(
                request,
                404,
                "UNKNOWN_TRANSLATION",
                `Unknown translation. Available translations: ${TRANSLATION_IDS.join(", ")}.`,
            ),
        );
    }
    return { ok: true, value: translation };
}

export type ChapterReference = {
    translation: Translation;
    book: number;
    chapter: number;
};

export function resolveChapterReference(
    request: Request,
    params: { translationId: string; book: string; chapter: string },
): Resolution<ChapterReference> {
    const translation = resolveTranslation(request, params.translationId);
    if (!translation.ok) return fail(translation.response);

    const book = parseBookNumber(params.book);
    if (book === undefined) {
        return fail(
            jsonError(
                request,
                400,
                "INVALID_BOOK",
                `Book must be an integer from 1 to ${BOOK_COUNT}.`,
            ),
        );
    }

    const chapter = parsePositiveInt(params.chapter);
    if (chapter === undefined) {
        return fail(
            jsonError(request, 400, "INVALID_CHAPTER", "Chapter must be a positive integer."),
        );
    }

    // A chapter outside the canon can be refused from the static book table,
    // without a filesystem read.
    if (!chapterExistsInCanon(book, chapter)) {
        return fail(
            jsonError(
                request,
                404,
                "CHAPTER_NOT_FOUND",
                `Chapter ${chapter} does not exist in book ${book}.`,
            ),
        );
    }

    return { ok: true, value: { translation: translation.value, book, chapter } };
}

export function resolveVerseNumber(request: Request, raw: string): Resolution<number> {
    const verse = parsePositiveInt(raw);
    if (verse === undefined) {
        return fail(
            jsonError(request, 400, "INVALID_VERSE", "Verse must be a positive integer."),
        );
    }
    return { ok: true, value: verse };
}
