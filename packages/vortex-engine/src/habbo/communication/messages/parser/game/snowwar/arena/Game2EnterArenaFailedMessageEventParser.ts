import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Why entering the arena was refused.
 *
 * TODO(AS3): the four public reason constants (1..4) are obfuscated in all three trees
 * (`_SafeStr_*` here, `const_*` in win63_version, PRODUCTION obfuscates the file whole). Only 1 has
 * a recoverable meaning — `_SafeCls_1951.onEnterArenaFailed()` answers it with
 * `snowwar.error.game_already_started` and everything else with the generic error — so only that
 * one is declared.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4234` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4234.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2EnterArenaFailedMessageEventParser.as
 */
export class Game2EnterArenaFailedMessageEventParser implements IMessageParser
{
    /** Derived name — `_SafeStr_11717`, the 1 the handler maps to `snowwar.error.game_already_started`. */
    // AS3: _SafeCls_4234.as::_SafeStr_11717
    public static readonly REASON_GAME_ALREADY_STARTED: number = 1;

    // AS3: _SafeCls_4234.as::_SafeStr_7389
    private _reason: number = 0;

    // AS3: _SafeCls_4234.as::get reason()
    get reason(): number
    {
        return this._reason;
    }

    // AS3: _SafeCls_4234.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4234.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._reason = wrapper.readInt();

        return true;
    }
}
