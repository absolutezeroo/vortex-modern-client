import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Whether a previously-requested badge has been fulfilled (already granted).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/inventory/badges/IsBadgeRequestFulfilledEventParser.as
 */
export class IsBadgeRequestFulfilledEventParser implements IMessageParser
{
    private _requestCode: string = '';
    private _fulfilled: boolean = false;

    flush(): boolean
    {
        this._requestCode = '';
        this._fulfilled = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._requestCode = wrapper.readString();
        this._fulfilled = wrapper.readBoolean();
        return true;
    }

    get requestCode(): string
    {
        return this._requestCode;
    }

    get fulfilled(): boolean
    {
        return this._fulfilled;
    }
}
