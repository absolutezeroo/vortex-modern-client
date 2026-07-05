import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses chat review session started data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionStartedMessageEventParser.as
 */
export class ChatReviewSessionStartedMessageParser implements IMessageParser
{
    private _votingTimeout: number = -1;

    get votingTimeout(): number
    {
        return this._votingTimeout;
    }

    private _chatRecord: string = '';

    get chatRecord(): string
    {
        return this._chatRecord;
    }

    flush(): boolean
    {
        this._votingTimeout = -1;
        this._chatRecord = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._votingTimeout = wrapper.readInt();
        this._chatRecord = wrapper.readString();
        return true;
    }
}
