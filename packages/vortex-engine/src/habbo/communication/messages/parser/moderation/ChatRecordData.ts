import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ChatEntryData} from './ChatEntryData';

/**
 * Data class for a chat record containing context and chat log entries.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/class_1757.as
 */
export class ChatRecordData
{
    public static readonly TYPE_CYCLED_ROOM: number = 0;
    public static readonly TYPE_ROOM: number = 1;
    public static readonly TYPE_THREAD: number = 2;
    public static readonly TYPE_THREAD_REPLY: number = 3;
    public static readonly TYPE_IM: number = 4;
    public static readonly TYPE_SELFIE: number = 5;
    public static readonly TYPE_PHOTO: number = 6;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._context = new Map<string, unknown>();
        this._chatlog = [];

        this._recordType = wrapper.readByte();

        const contextCount = wrapper.readShort();

        for(let i = 0; i < contextCount; i++)
        {
            const key = wrapper.readString();
            const dataType = wrapper.readByte();

            switch(dataType)
            {
                case 0:
                    this._context.set(key, wrapper.readBoolean());
                    break;
                case 1:
                    this._context.set(key, wrapper.readInt());
                    break;
                case 2:
                    this._context.set(key, wrapper.readString());
                    break;
                default:
                    throw new Error('Unknown data type ' + dataType);
            }
        }

        const chatlogCount = wrapper.readShort();

        for(let i = 0; i < chatlogCount; i++)
        {
            this._chatlog.push(new ChatEntryData(wrapper));
        }
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::_recordType
    private _recordType: number;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::get recordType()
    get recordType(): number
    {
        return this._recordType;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::_context
    private _context: Map<string, unknown>;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::get context()
    get context(): Map<string, unknown>
    {
        return this._context;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::_chatlog
    private _chatlog: ChatEntryData[];

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::get chatlog()
    get chatlog(): ChatEntryData[]
    {
        return this._chatlog;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::get roomId()
    get roomId(): number
    {
        return this.getInt('roomId');
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::get roomName()
    get roomName(): string
    {
        return (this._context.get('roomName') as string) ?? '';
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::get groupId()
    get groupId(): number
    {
        return this.getInt('groupId');
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::get threadId()
    get threadId(): number
    {
        return this.getInt('threadId');
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::get messageId()
    get messageId(): number
    {
        return this.getInt('messageId');
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/moderation/ChatRecordData.as::getInt()
    private getInt(key: string): number
    {
        const value = this._context.get(key);

        if(value == null)
        {
            return 0;
        }

        return value as number;
    }
}
