import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * BCPlacementWarningMessageParser — the server warns before completing a builders-club placement
 * (WIN63 header 2458) and echoes back everything needed to re-send the placement confirmed.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2463`); named after its readable consumer
 * `RoomMessageHandler.onBCPlacementWarning`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2184/_SafeCls_2463.as
 */
export class BCPlacementWarningMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2463.as::_SafeStr_10291 (name derived: the floor-placement type code)
    public static readonly TYPE_CODE_FLOOR: number = 0;

    // AS3: _SafeCls_2463.as::_SafeStr_11528 (name derived: the wall-placement type code; AS3 never
    // reads it — the handler tests only against the floor code and treats everything else as wall)
    public static readonly TYPE_CODE_WALL: number = 1;

    // AS3: _SafeCls_2463.as::_typeCode
    private _typeCode: number = 0;

    // AS3: _SafeCls_2463.as::_SafeStr_7494 (name recovered from `get pageId()`)
    private _pageId: number = 0;

    // AS3: _SafeCls_2463.as::_offerId
    private _offerId: number = 0;

    // AS3: _SafeCls_2463.as::_SafeStr_5176 (name recovered from `get extraParam()`)
    private _extraParam: string = '';

    // AS3: _SafeCls_2463.as::_SafeStr_4555 (name recovered from `get x()`)
    private _x: number = 0;

    // AS3: _SafeCls_2463.as::_SafeStr_4557 (name recovered from `get y()`)
    private _y: number = 0;

    // AS3: _SafeCls_2463.as::_SafeStr_4615 (name recovered from `get direction()`)
    private _direction: number = 0;

    // AS3: _SafeCls_2463.as::_SafeStr_8549 (name recovered from `get wallLocation()`)
    private _wallLocation: string = '';

    // AS3: _SafeCls_2463.as::get typeCode()
    get typeCode(): number
    {
        return this._typeCode;
    }

    // AS3: _SafeCls_2463.as::get pageId()
    get pageId(): number
    {
        return this._pageId;
    }

    // AS3: _SafeCls_2463.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: _SafeCls_2463.as::get extraParam()
    get extraParam(): string
    {
        return this._extraParam;
    }

    // AS3: _SafeCls_2463.as::get x()
    get x(): number
    {
        return this._x;
    }

    // AS3: _SafeCls_2463.as::get y()
    get y(): number
    {
        return this._y;
    }

    // AS3: _SafeCls_2463.as::get direction()
    get direction(): number
    {
        return this._direction;
    }

    // AS3: _SafeCls_2463.as::get wallLocation()
    get wallLocation(): string
    {
        return this._wallLocation;
    }

    // AS3: _SafeCls_2463.as::flush()
    flush(): boolean
    {
        // AS3's flush() body is empty — it resets nothing and just returns true. Preserved verbatim:
        // every field is overwritten by parse() on the branch that reads it, and the fields on the
        // other branch keep their previous message's values.
        return true;
    }

    // AS3: _SafeCls_2463.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper == null)
        {
            return false;
        }

        this._typeCode = wrapper.readInt();
        this._pageId = wrapper.readInt();
        this._offerId = wrapper.readInt();
        this._extraParam = wrapper.readString();

        if(this._typeCode === BCPlacementWarningMessageParser.TYPE_CODE_FLOOR)
        {
            this._x = wrapper.readInt();
            this._y = wrapper.readInt();
            this._direction = wrapper.readInt();
        }
        else
        {
            this._wallLocation = wrapper.readString();
        }

        return true;
    }
}
