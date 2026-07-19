import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for a single chat log entry.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/class_1774.as
 */
export class ChatEntryData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._timestamp = wrapper.readString();
        this._chatterId = wrapper.readInt();
        this._chatterName = wrapper.readString();
        this._message = wrapper.readString();
        this._hasHighlighting = wrapper.readBoolean();
    }

    private _timestamp: string;

    get timestamp(): string
    {
        return this._timestamp;
    }

    private _chatterId: number;

    get chatterId(): number
    {
        return this._chatterId;
    }

    private _chatterName: string;

    get chatterName(): string
    {
        return this._chatterName;
    }

    private _message: string;

    get message(): string
    {
        return this._message;
    }

    private _hasHighlighting: boolean;

    get hasHighlighting(): boolean
    {
        return this._hasHighlighting;
    }
}
