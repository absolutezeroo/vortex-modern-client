import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * GetCustomFilterResultMessageEventParser
 *
 * The player's whole word-filter list. One of the few parsers this dump leaves
 * unobfuscated — the class name below is the real one, not a derivation.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4205/GetCustomFilterResultMessageEventParser.as
 */
export class GetCustomFilterResultMessageEventParser implements IMessageParser
{
    // AS3: .../GetCustomFilterResultMessageEventParser.as::_SafeStr_7148
    private _words: string[] = [];

    /** AS3 hands out a copy, so a caller cannot edit the parser's own list. */
    // AS3: .../GetCustomFilterResultMessageEventParser.as::get words()
    get words(): string[]
    {
        return this._words.slice();
    }

    // AS3: .../GetCustomFilterResultMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../GetCustomFilterResultMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._words = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._words.push(wrapper.readString());

        return true;
    }
}
