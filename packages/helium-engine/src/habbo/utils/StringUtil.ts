/**
 * String utility functions.
 *
 * Provides static helper methods for common string operations
 * such as padding, trimming, validation, and sanitization.
 *
 * @see source_as_win63/habbo/utils/StringUtil.as
 */
export class StringUtil
{
    /**
	 * Pad a string with leading zeros to reach a target length.
	 *
	 * @param str The string to pad
	 * @param length The desired minimum length
	 * @returns The padded string
	 */
    static addLeftZeroPadding(str: string, length: number): string
    {
        while(str.length < length)
        {
            str = '0' + str;
        }

        return str;
    }

    /**
	 * Remove all font HTML tags from a string.
	 *
	 * @param str The string to strip font tags from
	 * @returns The string with font tags removed
	 */
    static stripFontTag(str: string): string
    {
        return str.replace(/<\/?font[^>]*>/gi, '');
    }

    /**
	 * Trim whitespace from both ends of a string.
	 *
	 * @param str The string to trim
	 * @returns The trimmed string, or empty string if null/undefined
	 */
    static trim(str: string): string
    {
        return str ? str.trim() : '';
    }

    /**
	 * Remove all whitespace characters from a string.
	 *
	 * @param str The string to process
	 * @returns The string with all spaces removed
	 */
    static removeWhiteSpace(str: string): string
    {
        return str ? str.replace(/ /g, '') : '';
    }

    /**
	 * Convert a string to lowercase alphanumeric characters only.
	 *
	 * @param str The string to convert
	 * @returns The alphanumeric lowercase string
	 */
    static toAlphaNumericLow(str: string): string
    {
        return str.toLowerCase().replace(/\W/g, '');
    }

    /**
	 * Return the string or an empty string if null/undefined.
	 *
	 * @param str The string to check
	 * @returns The string, or empty string if null/undefined
	 */
    static nonNull(str: string | null): string
    {
        return str ?? '';
    }

    /**
	 * Check if a string is empty (null, undefined, or zero length).
	 *
	 * @param str The string to check
	 * @returns True if the string is empty
	 */
    static isEmpty(str: string | null): boolean
    {
        return str === null || str.length === 0;
    }

    /**
	 * Check if a string is blank (null, undefined, or only whitespace).
	 *
	 * @param str The string to check
	 * @returns True if the string is blank
	 */
    static isBlank(str: string | null): boolean
    {
        if(str === null)
        {
            return true;
        }

        return StringUtil.trim(str).length === 0;
    }
}
