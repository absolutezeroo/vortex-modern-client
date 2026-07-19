/**
 * Filter mode constants for navigator search input.
 *
 * Defines filter prefixes (owner:, roomname:, tag:, group:) that can be
 * typed in the search input to narrow results by a specific field.
 *
 * @see sources/win63_version/habbo/navigator/view/search/class_3893.as
 */
export class FilterMode
{
    static readonly DEFAULT: number = 0;
    static readonly OWNER: number = 1;
    static readonly ROOMNAME: number = 2;
    static readonly TAG: number = 3;
    static readonly GROUP: number = 4;
    static readonly ANYTHING: number = 5;

    static readonly FILTER_PREFIX: string[] = ['', 'owner:', 'roomname:', 'tag:', 'group:', ''];

    /**
	 * Detect which filter mode is present at the start of the input string.
	 *
	 * @param input - The raw filter string from the search input
	 * @returns The filter mode index matching a prefix, or DEFAULT (0) if none
	 */
    static filterInInput(input: string): number
    {
        for(let i = 1; i < FilterMode.FILTER_PREFIX.length; i++)
        {
            if(input.indexOf(FilterMode.FILTER_PREFIX[i]) === 0)
            {
                return i;
            }
        }

        return FilterMode.DEFAULT;
    }
}
