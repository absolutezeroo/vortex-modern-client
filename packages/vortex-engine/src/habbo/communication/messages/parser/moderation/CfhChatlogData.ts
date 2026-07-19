import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ChatRecordData} from './ChatRecordData';

/**
 * Data class for CFH (Call For Help) chatlog data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/class_1674.as
 */
export class CfhChatlogData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._callId = wrapper.readInt();
        this._callerUserId = wrapper.readInt();
        this._reportedUserId = wrapper.readInt();
        this._chatRecordId = wrapper.readInt();
        this._chatRecord = new ChatRecordData(wrapper);
    }

    private _callId: number;

    get callId(): number
    {
        return this._callId;
    }

    private _callerUserId: number;

    get callerUserId(): number
    {
        return this._callerUserId;
    }

    private _reportedUserId: number;

    get reportedUserId(): number
    {
        return this._reportedUserId;
    }

    private _chatRecordId: number;

    get chatRecordId(): number
    {
        return this._chatRecordId;
    }

    private _chatRecord: ChatRecordData;

    get chatRecord(): ChatRecordData
    {
        return this._chatRecord;
    }
}
