import type {ChatItem} from '../../data/ChatItem';

/**
 * Chat colour tag parser. Detects colour prefix tags in chat text
 * (e.g. @red@, @cyan@) and returns the parsed text and colour value.
 *
 * @see source_as_win63/habbo/freeflowchat/viewer/enum/ChatColours.as
 */
export class ChatColours
{
    public static readonly COLOUR_ARRAY: [string, number][] = [
        ['@red@', 0x8B0909],
        ['@cyan@', 0x007F7F],
        ['@blue@', 0x004C99],
        ['@green@', 0x008000],
        ['@purple@', 0x4BF5CC],
    ];

    /**
	 * Checks if the chat item's text starts with a colour tag prefix,
	 * and if so returns the stripped text and the corresponding colour.
	 *
	 * @param item The chat item to process
	 * @returns An object with the (possibly stripped) text and colour (null if no tag found)
	 */
    static applyColourToChat(item: ChatItem): { text: string; color: number | null }
    {
        for(const [tag, color] of ChatColours.COLOUR_ARRAY)
        {
            if(item.text.startsWith(tag))
            {
                return {text: item.text.substring(tag.length), color};
            }
        }

        return {text: item.text, color: null};
    }
}
