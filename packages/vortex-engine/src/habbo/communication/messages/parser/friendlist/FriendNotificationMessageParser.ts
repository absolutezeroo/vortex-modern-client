import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for friend notification events (e.g. friend logged in/out).
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/FriendNotificationEventParser.as
 */
export class FriendNotificationMessageParser implements IMessageParser
{
    private _avatarId: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/FriendNotificationEventParser.as::get avatarId()
    get avatarId(): string
    {
        return this._avatarId;
    }

    private _typeCode: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/FriendNotificationEventParser.as::get typeCode()
    get typeCode(): number
    {
        return this._typeCode;
    }

    private _message: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/FriendNotificationEventParser.as::get message()
    get message(): string
    {
        return this._message;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/FriendNotificationEventParser.as::flush()
    flush(): boolean
    {
        this._avatarId = '';
        this._typeCode = -1;
        this._message = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/FriendNotificationEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._avatarId = wrapper.readString();
        this._typeCode = wrapper.readInt();
        this._message = wrapper.readString();

        return true;
    }
}
