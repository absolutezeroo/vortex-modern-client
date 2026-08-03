import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * ModifyCustomFilterResultMessageEventParser
 *
 * The outcome of an add or a remove, and the word it applied to. Unobfuscated in the dump,
 * so the class name below is the real one.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4205/ModifyCustomFilterResultMessageEventParser.as
 */
export class ModifyCustomFilterResultMessageEventParser implements IMessageParser
{
    // AS3: .../ModifyCustomFilterResultMessageEventParser.as::_SafeStr_5699
    private _result: number = -1;

    // AS3: .../ModifyCustomFilterResultMessageEventParser.as::_SafeStr_8955
    private _word: string = '';

    // AS3: .../ModifyCustomFilterResultMessageEventParser.as::get result()
    get result(): number
    {
        return this._result;
    }

    // AS3: .../ModifyCustomFilterResultMessageEventParser.as::get word()
    get word(): string
    {
        return this._word;
    }

    // AS3: .../ModifyCustomFilterResultMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../ModifyCustomFilterResultMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._result = wrapper.readInt();
        this._word = wrapper.readString();

        return true;
    }
}
