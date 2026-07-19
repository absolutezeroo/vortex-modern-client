import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Result reason code for a wired-trigger reward action.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/userdefinedroomevents/WiredRewardResultMessageEventParser.as
 */
export class WiredRewardResultMessageEventParser implements IMessageParser
{
    private _reason: number = 0;

    flush(): boolean
    {
        this._reason = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._reason = wrapper.readInt();
        return true;
    }

    get reason(): number
    {
        return this._reason;
    }
}
