import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the server's acknowledgement of a community-goal vote.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/landingview/votes/CommunityVoteReceivedEventParser.as
 */
export class CommunityVoteReceivedEventParser implements IMessageParser
{
    private _acknowledged: boolean = false;

    flush(): boolean
    {
        this._acknowledged = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._acknowledged = wrapper.readBoolean();
        return true;
    }

    get acknowledged(): boolean
    {
        return this._acknowledged;
    }
}
