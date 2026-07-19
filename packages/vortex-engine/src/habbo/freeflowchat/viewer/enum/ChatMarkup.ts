/**
 * ChatMarkup
 *
 * Lightweight bracket-tag chat markup (`[b]bold[/b]`, `[red]colored[/red]`)
 * and the `@color@ message` prefix shorthand - converted to the same inline
 * HTML tags (`<b>`, `<font color="...">`) AS3's Flash TextField/StyleSheet
 * renders natively. See ChatTextLayout.ts's `parseInlineMarkup()` for how
 * this port turns that HTML back into styled runs (no real HTML text
 * component - see that file's header for why).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/enum/ChatMarkup.as
 */
export class ChatMarkup
{
    static readonly COLOUR_ARRAY: [string, number][] = [
        ['red', 9115929],
        ['cyan', 32639],
        ['blue', 19609],
        ['green', 32768],
        ['purple', 4980812]
    ];

    private static readonly WHITE_COLOUR_ARRAY: [string, number][] = [
        ['red', 16738922],
        ['cyan', 5233370],
        ['blue', 6269183],
        ['green', 6738794],
        ['purple', 11767039]
    ];

    static readonly COLOUR_NAMES: string[] = ChatMarkup.COLOUR_ARRAY.map(([name]) => name);

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/enum/ChatMarkup.as::getColourArray()
    private static getColourArray(baseColor: number): [string, number][]
    {
        return baseColor === 16777215 ? ChatMarkup.WHITE_COLOUR_ARRAY : ChatMarkup.COLOUR_ARRAY;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/enum/ChatMarkup.as::getHexColorForTag()
    private static getHexColorForTag(tag: string, baseColor: number): string | null
    {
        const entry = ChatMarkup.getColourArray(baseColor).find(([name]) => name === tag);

        return entry ? `#${entry[1].toString(16).toUpperCase()}` : null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/enum/ChatMarkup.as::applyColourToChat()
    static applyColourToChat(text: string, baseColor: number): string
    {
        for(const [name, hex] of ChatMarkup.getColourArray(baseColor))
        {
            if(text.indexOf(`@${name}@`) === 0)
            {
                const color = `#${hex.toString(16).toUpperCase()}`;
                let rest = text.substring(name.length + 2);

                if(rest.charAt(0) === ' ') rest = rest.substring(1);

                return `<font color="${color}">${rest}</font>`;
            }
        }

        return text;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/enum/ChatMarkup.as::tokenize()
    static tokenize(text: string): string[]
    {
        const tokens: string[] = [];
        let current = '';
        let inTag = false;

        for(const ch of text)
        {
            if(ch === '[')
            {
                if(current.length > 0)
                {
                    tokens.push(current);
                    current = '';
                }

                inTag = true;
                current += ch;
            }
            else if(ch === ']' && inTag)
            {
                current += ch;
                tokens.push(current);
                current = '';
                inTag = false;
            }
            else
            {
                current += ch;
            }
        }

        if(current.length > 0) tokens.push(current);

        return tokens;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/enum/ChatMarkup.as::applyToElements()
    static applyToElements(text: string, baseColor: number): string
    {
        if(text.length === 0) return '';

        const tokens = ChatMarkup.tokenize(text);
        const stack: {tag: string; index: number}[] = [];

        for(let i = 0; i < tokens.length; i++)
        {
            const token = tokens[i];

            if(token.charAt(0) === '[' && token.charAt(token.length - 1) === ']' && (token.charAt(1) === '/' || (token.length > 2 && token.length <= 10)))
            {
                let tag = token.substring(1, token.length - 1).toLowerCase();
                const isClosing = tag.charAt(0) === '/';

                if(isClosing)
                {
                    tag = tag.substring(1);

                    if(stack.length > 0 && stack[stack.length - 1].tag === tag)
                    {
                        const opened = stack.pop()!;

                        if(tag === 'b' || tag === 'i' || tag === 'u')
                        {
                            tokens[opened.index] = `<${tag}>`;
                            tokens[i] = `</${tag}>`;
                        }
                        else
                        {
                            const hex = ChatMarkup.getHexColorForTag(tag, baseColor);

                            if(hex !== null)
                            {
                                tokens[opened.index] = `<font color="${hex}">`;
                                tokens[i] = '</font>';
                            }
                        }
                    }
                }
                else if(tag === 'b' || tag === 'i' || tag === 'u' || ChatMarkup.COLOUR_NAMES.indexOf(tag) !== -1)
                {
                    stack.push({tag, index: i});
                }
            }
        }

        return tokens.join('');
    }
}
