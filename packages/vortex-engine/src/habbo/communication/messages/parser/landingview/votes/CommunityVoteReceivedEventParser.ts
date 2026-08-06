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

    // AS3: sources/win63_version/habbo/communication/messages/parser/landingview/votes/CommunityVoteReceivedEventParser.as::flush()
    flush(): boolean
    {
        this._acknowledged = false;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/landingview/votes/CommunityVoteReceivedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._acknowledged = wrapper.readBoolean();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/landingview/votes/CommunityVoteReceivedEventParser.as::get acknowledged()
    get acknowledged(): boolean
    {
        return this._acknowledged;
    }
}
