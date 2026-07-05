import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Represents a single pending call for help entry.
 */
export interface PendingCall
{
    callId: string;
    timestamp: string;
    message: string;
}

/**
 * Parser for pending calls for help messages.
 * Contains the list of pending CFH tickets for the user.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/CallForHelpPendingCallsMessageEventParser.as
 */
export class CallForHelpPendingCallsMessageParser implements IMessageParser
{
    private _calls: PendingCall[] = [];

    get calls(): PendingCall[]
    {
        return this._calls;
    }

    get callCount(): number
    {
        return this._calls.length;
    }

    flush(): boolean
    {
        this._calls = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._calls = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const callId = wrapper.readString();
            const timestamp = wrapper.readString();
            const message = wrapper.readString();

            this._calls.push({callId, timestamp, message});
        }

        return true;
    }
}
