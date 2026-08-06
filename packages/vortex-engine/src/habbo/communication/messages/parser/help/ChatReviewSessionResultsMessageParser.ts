import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses chat review session results data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionResultsMessageEventParser.as
 */
export class ChatReviewSessionResultsMessageParser implements IMessageParser
{
    private _winningVoteCode: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionResultsMessageEventParser.as::get winningVoteCode()
    get winningVoteCode(): number
    {
        return this._winningVoteCode;
    }

    private _ownVoteCode: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionResultsMessageEventParser.as::get ownVoteCode()
    get ownVoteCode(): number
    {
        return this._ownVoteCode;
    }

    private _finalStatus: Array<number> = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionResultsMessageEventParser.as::get finalStatus()
    get finalStatus(): Array<number>
    {
        return this._finalStatus;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionResultsMessageEventParser.as::flush()
    flush(): boolean
    {
        this._winningVoteCode = -1;
        this._ownVoteCode = -1;
        this._finalStatus = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionResultsMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._winningVoteCode = wrapper.readInt();
        this._ownVoteCode = wrapper.readInt();
        this._finalStatus = [];

        const count = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            this._finalStatus.push(wrapper.readInt());
        }

        return true;
    }
}
