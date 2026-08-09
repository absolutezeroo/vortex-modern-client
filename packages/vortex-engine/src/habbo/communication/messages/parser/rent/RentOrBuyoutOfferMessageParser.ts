import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The quote for extending or buying out a rented furni.
 *
 * `buyout` is the server's answer, not an echo of the request: it decides whether the dialog reads
 * as an extension or a purchase. The item is identified by type name, which is what the window
 * matches against the furni it is showing before accepting the reply.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_3704.as
 */
export class RentOrBuyoutOfferMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3704.as::_SafeStr_8112 (name derived: backs get isWallItem())
    private _isWallItem: boolean = false;

    // AS3: _SafeCls_3704.as::_furniTypeName
    private _furniTypeName: string = '';

    // AS3: _SafeCls_3704.as::_SafeStr_9560 (name derived: backs get buyout())
    private _buyout: boolean = false;

    // AS3: _SafeCls_3704.as::_SafeStr_6678 (name derived: backs get priceInCredits())
    private _priceInCredits: number = 0;

    // AS3: _SafeCls_3704.as::_SafeStr_6823 (name derived: backs get priceInActivityPoints())
    private _priceInActivityPoints: number = 0;

    // AS3: _SafeCls_3704.as::_SafeStr_7308 (name derived: backs get activityPointType())
    private _activityPointType: number = 0;

    // AS3: _SafeCls_3704.as::get isWallItem()
    get isWallItem(): boolean
    {
        return this._isWallItem;
    }

    // AS3: _SafeCls_3704.as::get furniTypeName()
    get furniTypeName(): string
    {
        return this._furniTypeName;
    }

    // AS3: _SafeCls_3704.as::get buyout()
    get buyout(): boolean
    {
        return this._buyout;
    }

    // AS3: _SafeCls_3704.as::get priceInCredits()
    get priceInCredits(): number
    {
        return this._priceInCredits;
    }

    // AS3: _SafeCls_3704.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    // AS3: _SafeCls_3704.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    // AS3: _SafeCls_3704.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_3704.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._isWallItem = wrapper.readBoolean();
        this._furniTypeName = wrapper.readString();
        this._buyout = wrapper.readBoolean();
        this._priceInCredits = wrapper.readInt();
        this._priceInActivityPoints = wrapper.readInt();
        this._activityPointType = wrapper.readInt();

        return true;
    }
}
