import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * GroupDetailsChangedMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.GroupDetailsChangedMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.GroupDetailsChangedMessageParser
 */
export class GroupDetailsChangedMessageParser implements IMessageParser
{
    private _groupId: number = 0;

    get groupId(): number
    {
        return this._groupId;
    }

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._groupId = wrapper.readInt();
        return true;
    }
}
