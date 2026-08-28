import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A rewarded-video payout landing, header 2621.
 *
 * `description` is parsed and never read: `OfferCenter.onOfferRewardDelivered()` takes only the
 * other three. It stays because the field is on the wire and dropping it would desync the read.
 *
 * **Name DERIVED** — no unobfuscated tree carries this message. Named after the emulator's own
 * `OfferRewardDeliveredMessageComposer`, which is the mirror of this class.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1810/_SafeCls_3711.as
 */
export class OfferRewardDeliveredMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3711.as::_SafeStr_8064 (backing field of contentType)
    private _contentType: string = '';

    // AS3: _SafeCls_3711.as::_SafeStr_5613 (backing field of classId)
    private _classId: number = 0;

    // AS3: _SafeCls_3711.as::_name
    private _name: string = '';

    // AS3: _SafeCls_3711.as::_description
    private _description: string = '';

    // AS3: _SafeCls_3711.as::get contentType()
    get contentType(): string
    {
        return this._contentType;
    }

    // AS3: _SafeCls_3711.as::get classId()
    get classId(): number
    {
        return this._classId;
    }

    // AS3: _SafeCls_3711.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: _SafeCls_3711.as::get description()
    get description(): string
    {
        return this._description;
    }

    // AS3: _SafeCls_3711.as::flush()
    flush(): boolean
    {
        this._contentType = '';
        this._classId = 0;
        this._name = '';
        this._description = '';

        return true;
    }

    // AS3: _SafeCls_3711.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._contentType = wrapper.readString();
        this._classId = wrapper.readInt();
        this._name = wrapper.readString();
        this._description = wrapper.readString();

        return true;
    }
}
