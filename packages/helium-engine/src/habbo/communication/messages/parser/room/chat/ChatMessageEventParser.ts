/**
 * ChatMessageEventParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.chat.ChatMessageEventParser
 *
 * Parser for chat messages (chat, whisper, shout).
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export interface ChatLink
{
    url: string;
    displayText: string;
    isTrusted: boolean;
}

export class ChatMessageEventParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    private _text: string = '';

    get text(): string
    {
        return this._text;
    }

    private _gesture: number = 0;

    get gesture(): number
    {
        return this._gesture;
    }

    private _styleId: number = 0;

    get styleId(): number
    {
        return this._styleId;
    }

    private _links: ChatLink[] | null = null;

    get links(): ChatLink[] | null
    {
        return this._links;
    }

    private _trackingId: number = -1;

    get trackingId(): number
    {
        return this._trackingId;
    }

    flush(): boolean
    {
        this._userId = 0;
        this._text = '';
        this._gesture = 0;
        this._styleId = 0;
        this._links = null;
        this._trackingId = -1;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper === null)
        {
            return false;
        }

        this._userId = wrapper.readInt();
        this._text = wrapper.readString();
        this._gesture = wrapper.readInt();
        this._styleId = wrapper.readInt();

        const linkCount = wrapper.readInt();

        if(linkCount > 0)
        {
            this._links = [];

            for(let i = 0; i < linkCount; i++)
            {
                this._links.push({
                    url: wrapper.readString(),
                    displayText: wrapper.readString(),
                    isTrusted: wrapper.readBoolean(),
                });
            }
        }

        this._trackingId = wrapper.readInt();

        return true;
    }
}
