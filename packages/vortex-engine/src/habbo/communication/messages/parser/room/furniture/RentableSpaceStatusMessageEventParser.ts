import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses a rentable space's state: rented or not, whether *this* player may rent it, and the
 * renter/price/countdown behind those answers.
 *
 * Two things the wire does not say outright:
 * - **`canRent` is derived**, not sent. The server sends an error code; zero means "you may rent",
 *   anything else is the reason you may not. The code stays available as `canRentErrorCode`, which
 *   the widget maps to a `rentablespace.widget.error_reason_*` message.
 * - **The renter fields are cleared when the space is free.** AS3 reads them either way, then
 *   resets `renterId` to -1 and `renterName` to `""` if `rented` was false — so a stale name from
 *   the wire never reaches the view.
 *
 * Name recovered from `sources/win63_version/habbo/communication/messages/parser/room/furniture/RentableSpaceStatusMessageEventParser.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as
 */
export class RentableSpaceStatusMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::_SafeStr_8740
    private _rented: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::_SafeStr_8210
    private _renterId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::_SafeStr_7918
    private _renterName: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::_SafeStr_9068
    private _canRent: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::_SafeStr_8528
    private _canRentErrorCode: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::_SafeStr_9201
    private _timeRemaining: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::_SafeStr_8355
    private _price: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::get rented()
    get rented(): boolean
    {
        return this._rented;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::get renterId()
    get renterId(): number
    {
        return this._renterId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::get renterName()
    get renterName(): string
    {
        return this._renterName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::get canRent()
    get canRent(): boolean
    {
        return this._canRent;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::get canRentErrorCode()
    get canRentErrorCode(): number
    {
        return this._canRentErrorCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::get timeRemaining()
    get timeRemaining(): number
    {
        return this._timeRemaining;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::get price()
    get price(): number
    {
        return this._price;
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::flush()
     *
     * Returns true without clearing anything, as AS3 does.
     */
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4163.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._rented = wrapper.readBoolean();
        this._canRentErrorCode = wrapper.readInt();
        this._canRent = this._canRentErrorCode === 0;
        this._renterId = wrapper.readInt();
        this._renterName = wrapper.readString();
        this._timeRemaining = wrapper.readInt();
        this._price = wrapper.readInt();

        if(!this._rented)
        {
            this._renterId = -1;
            this._renterName = '';
        }

        return true;
    }
}
