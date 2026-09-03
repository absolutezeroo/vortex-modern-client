import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Why the game would not start. The handler ignores the value and always shows
 * `snowwar.error.generic`, so nothing here distinguishes the two reasons AS3 declares.
 *
 * Both of AS3's reason constants are declared under placeholder names: they are obfuscated in all
 * three trees (`_SafeStr_11495`/`_SafeStr_10848`, `const_1202`/`const_593`) and no call site gives
 * either a meaning, so there is nothing to recover. The values are the wire contract.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2StartingGameFailedMessageParser.as
 */
export class Game2StartingGameFailedMessageParser implements IMessageParser
{
    // AS3: Game2StartingGameFailedMessageParser.as::_SafeStr_11495 — obfuscated in every tree.
    public static readonly REASON_UNNAMED_1: number = 1;

    // AS3: Game2StartingGameFailedMessageParser.as::_SafeStr_10848 — obfuscated in every tree.
    public static readonly REASON_UNNAMED_2: number = 2;

    // AS3: Game2StartingGameFailedMessageParser.as::_SafeStr_7389
    private _reason: number = 0;

    // AS3: Game2StartingGameFailedMessageParser.as::get reason()
    get reason(): number
    {
        return this._reason;
    }

    // AS3: Game2StartingGameFailedMessageParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: Game2StartingGameFailedMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._reason = wrapper.readInt();

        return true;
    }
}
