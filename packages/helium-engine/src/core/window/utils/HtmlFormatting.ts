import type {ITextFormat} from '../components/ITextWindow';

// TS-only: no AS3 equivalent — Flash's native TextField.htmlText parses a
// restricted HTML subset (<b>/<i>/<u>/<br>/...) internally; the Canvas2D port
// has no such engine, so formatted_text/html windows need this to turn markup
// into plain text + per-range TextFormat overrides (TextController.setTextFormat())
// before drawing. Only a hardcoded, closed set of tag names is ever recognized -
// no attributes are parsed and nothing is ever interpreted as markup by the
// renderer (plain Canvas2D fillText()), so unknown/malformed tags are simply
// dropped as text, never executed or otherwise acted upon.
export interface IParsedHtmlText
{
    text: string;
    runs: Array<{ start: number; end: number; format: ITextFormat }>;
}

const TAG_FORMAT_KEY: Record<string, keyof ITextFormat> = {
    b: 'bold',
    i: 'italic',
    u: 'underline',
};

const RECOGNIZED_TAG_PATTERN = /<(\/?)(b|i|u)>/gi;
const UNRECOGNIZED_TAG_PATTERN = /<(?!\/?(?:b|i|u)\b)[^>]+>/gi;

/**
 * Parses a small, hardcoded subset of Flash's htmlText markup (<b>, <i>,
 * <u>, <br>) into plain text plus TextController.setTextFormat()-compatible
 * ranges. Any other tag is stripped without being interpreted.
 */
export function parseHtmlFormatting(html: string): IParsedHtmlText
{
    const normalized = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(UNRECOGNIZED_TAG_PATTERN, '');

    let text = '';
    let lastIndex = 0;
    const openStack: Array<{ tag: string; start: number }> = [];
    const runs: Array<{ start: number; end: number; format: ITextFormat }> = [];
    let match: RegExpExecArray | null;

    RECOGNIZED_TAG_PATTERN.lastIndex = 0;

    while((match = RECOGNIZED_TAG_PATTERN.exec(normalized)) !== null)
    {
        text += normalized.slice(lastIndex, match.index);
        lastIndex = match.index + match[0].length;

        const isClosing = match[1] === '/';
        const tag = match[2].toLowerCase();

        if(!isClosing)
        {
            openStack.push({tag, start: text.length});
            continue;
        }

        for(let i = openStack.length - 1; i >= 0; i--)
        {
            if(openStack[i].tag !== tag) continue;

            const open = openStack.splice(i, 1)[0];

            if(text.length > open.start)
            {
                runs.push({start: open.start, end: text.length, format: {[TAG_FORMAT_KEY[tag]]: true} as ITextFormat});
            }

            break;
        }
    }

    text += normalized.slice(lastIndex);

    for(const open of openStack)
    {
        if(text.length > open.start)
        {
            runs.push({start: open.start, end: text.length, format: {[TAG_FORMAT_KEY[open.tag]]: true} as ITextFormat});
        }
    }

    return {text, runs};
}
