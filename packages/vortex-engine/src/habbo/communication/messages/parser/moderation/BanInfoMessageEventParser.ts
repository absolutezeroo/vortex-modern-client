import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The ban a moderator just handed the player, pushed so the client can raise the alert dialog
 * before the connection drops.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/moderation/BanInfoMessageEventParser.as
 */
export class BanInfoMessageEventParser implements IMessageParser
{
    private _target: number = -1;
    private _reason: string = '';
    private _banExpirySeconds: number = -1;
    private _localizedReason: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2231/_SafeCls_2884.as::get target()
    get target(): number
    {
        return this._target;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2231/_SafeCls_2884.as::get reason()
    get reason(): string
    {
        return this._reason;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2231/_SafeCls_2884.as::get banExpirySeconds()
    get banExpirySeconds(): number
    {
        return this._banExpirySeconds;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2231/_SafeCls_2884.as::get localizedReason()
    get localizedReason(): string
    {
        return this._localizedReason;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2231/_SafeCls_2884.as::flush()
    flush(): boolean
    {
        this._target = -1;
        this._reason = '';
        this._banExpirySeconds = -1;
        this._localizedReason = '';

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2231/_SafeCls_2884.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        // `target` is a **short**, not an int, where every other id field on this parser is an int.
        // Reading it as an int eats the two leading bytes of `reason` and desyncs the rest.
        this._target = wrapper.readShort();
        this._reason = wrapper.readString();
        this._banExpirySeconds = wrapper.readInt();
        this._localizedReason = wrapper.readString();

        return true;
    }
}
