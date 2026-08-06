import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the phone-collection state: where the player stands in the SMS verification flow.
 *
 * `HabboPhoneNumber.onStateMessage()` mirrors both codes into configuration
 * (`phone.collection.status` / `phone.verification.status`) before deciding which view to open,
 * so other components read the state without listening to the message.
 *
 * Note `flush()` resets only two of the three fields — `collectionStatusCode` keeps its previous
 * value. Ported as-is; it is what AS3 does.
 *
 * Name recovered from `sources/win63_version/habbo/communication/messages/parser/gifts/PhoneCollectionStateMessageEventParser.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as
 */
export class PhoneCollectionStateMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as::_SafeStr_8250
    private _phoneStatusCode: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as::_SafeStr_9650
    private _collectionStatusCode: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as::_SafeStr_7714
    private _millisecondsToAllowProcessReset: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as::get phoneStatusCode()
    get phoneStatusCode(): number
    {
        return this._phoneStatusCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as::get collectionStatusCode()
    get collectionStatusCode(): number
    {
        return this._collectionStatusCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as::get millisecondsToAllowProcessReset()
    get millisecondsToAllowProcessReset(): number
    {
        return this._millisecondsToAllowProcessReset;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as::flush()
    flush(): boolean
    {
        this._phoneStatusCode = -1;
        this._millisecondsToAllowProcessReset = -1;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4169.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._phoneStatusCode = wrapper.readInt();
        this._collectionStatusCode = wrapper.readInt();
        this._millisecondsToAllowProcessReset = wrapper.readInt();

        return true;
    }
}
