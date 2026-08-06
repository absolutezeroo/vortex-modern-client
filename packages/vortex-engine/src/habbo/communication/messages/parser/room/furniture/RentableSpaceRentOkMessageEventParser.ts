import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the confirmation that a rentable space was rented: when the rent runs out.

 * `expiryTime` is read and currently goes unused — the widget handler answers this message by
 * re-requesting the full status rather than trusting the one field. Ported anyway, because the
 * accessor is part of the class.
 *
 * Name recovered from `sources/win63_version/habbo/communication/messages/parser/room/furniture/RentableSpaceRentOkMessageEventParser.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4064.as
 */
export class RentableSpaceRentOkMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4064.as::_expiryTime
    private _expiryTime: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4064.as::get expiryTime()
    get expiryTime(): number
    {
        return this._expiryTime;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4064.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4064.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._expiryTime = wrapper.readInt();

        return true;
    }
}
