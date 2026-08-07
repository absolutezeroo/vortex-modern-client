import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * One tracking event, on its way to the server's event log.
 *
 * Nothing in any of the three AS3 trees constructs this — the handler is the only reference. It
 * is a public entry point kept alive for whatever used to feed it, and it is ported for the same
 * reason: the handler that consumes it is real and registered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetConversionPointMessage.as
 */
export class RoomWidgetConversionPointMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::CONVERSION_POINT
    // Name DERIVED (`_SafeStr_10745`): the constant is obfuscated in every tree; named after its
    // own value, which is what the handler matches on.
    public static readonly CONVERSION_POINT: string = 'RWCPM_CONVERSION_POINT';

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::_category
    private _category: string;

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::_pointType
    private _pointType: string;

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::_action
    private _action: string;

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::_extraString
    private _extraString: string;

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::_extraInt
    private _extraInt: number;

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::RoomWidgetConversionPointMessage()
    // AS3 coerces the two optional tail fields through a truthiness test, so an empty string and a
    // zero both fall back to the same empty/zero — kept, since `??` would not.
    constructor(
        type: string,
        category: string,
        pointType: string,
        action: string,
        extraString: string = '',
        extraInt: number = 0
    )
    {
        super(type);

        this._category = category;
        this._pointType = pointType;
        this._action = action;
        this._extraString = extraString ? extraString : '';
        this._extraInt = extraInt ? extraInt : 0;
    }

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::get category()
    get category(): string
    {
        return this._category;
    }

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::get pointType()
    get pointType(): string
    {
        return this._pointType;
    }

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::get action()
    get action(): string
    {
        return this._action;
    }

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::get extraString()
    get extraString(): string
    {
        return this._extraString;
    }

    // AS3: .../widget/messages/RoomWidgetConversionPointMessage.as::get extraInt()
    get extraInt(): number
    {
        return this._extraInt;
    }
}
