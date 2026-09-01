import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Why the join was refused. `_SafeCls_1951.onJoiningGameFailed()` maps three of the eight values to
 * a localisation key and everything else to the generic error.
 *
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2JoiningGameFailedMessageParser.as
 * declares eight public reason constants (1..8) whose identifiers are obfuscated in all three trees
 * (`_SafeStr_*` here, `const_*` in win63_version, PRODUCTION obfuscates the file whole). Only the
 * three the handler acts on have a recoverable meaning, and those are the three declared below;
 * naming 1, 3, 5 and 7 would be invention.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2JoiningGameFailedMessageParser.as
 */
export class Game2JoiningGameFailedMessageParser implements IMessageParser
{
    /** Derived name — `_SafeStr_11238`; the handler answers it with `snowwar.error.duplicate_machineid`. */
    // AS3: Game2JoiningGameFailedMessageParser.as::_SafeStr_11238
    public static readonly REASON_DUPLICATE_MACHINE_ID: number = 2;

    /**
     * Derived names — `_SafeStr_11742` and `_SafeStr_10845`; the handler answers *both* with
     * `snowwar.error.has_active_instance`, which is why the pair shares one meaning here.
     */
    // AS3: Game2JoiningGameFailedMessageParser.as::_SafeStr_11742
    public static readonly REASON_HAS_ACTIVE_INSTANCE: number = 6;

    // AS3: Game2JoiningGameFailedMessageParser.as::_SafeStr_10845
    public static readonly REASON_HAS_ACTIVE_INSTANCE_ALT: number = 7;

    /** Derived name — `_SafeStr_10946`; the handler answers it with `snowwar.error.no_free_games_left`. */
    // AS3: Game2JoiningGameFailedMessageParser.as::_SafeStr_10946
    public static readonly REASON_NO_FREE_GAMES_LEFT: number = 8;

    // AS3: Game2JoiningGameFailedMessageParser.as::_SafeStr_7389
    private _reason: number = 0;

    // AS3: Game2JoiningGameFailedMessageParser.as::get reason()
    get reason(): number
    {
        return this._reason;
    }

    // AS3: Game2JoiningGameFailedMessageParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: Game2JoiningGameFailedMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._reason = wrapper.readInt();

        return true;
    }
}
