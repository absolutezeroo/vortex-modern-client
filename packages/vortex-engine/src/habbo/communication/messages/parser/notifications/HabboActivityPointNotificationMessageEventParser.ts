import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for a single activity-point (seasonal currency) balance change.
 *
 * Where `ActivityPointsMessageParser` carries the whole wallet, this one carries one
 * currency: its new total (`amount`), how much it just moved by (`change`) and which
 * currency it is (`type`).
 *
 * The class is obfuscated in the primary tree (`_SafeCls_2925`); the member names are
 * readable there and the class name is recovered from
 * `sources/win63_version/habbo/communication/messages/parser/notifications/HabboActivityPointNotificationMessageEventParser.as`,
 * which has the identical three-int body.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as
 */
export class HabboActivityPointNotificationMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as::amount
    private _amount: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as::change
    private _change: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as::get change()
    get change(): number
    {
        return this._change;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as::type
    private _type: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as::get type()
    get type(): number
    {
        return this._type;
    }

    /**
	 * AS3 flushes nothing here - it just returns true, and every field is overwritten by
	 * the next parse(). Kept as-is rather than "fixed" into a reset.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_2925.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._amount = wrapper.readInt();
        this._change = wrapper.readInt();
        this._type = wrapper.readInt();

        return true;
    }
}