import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for user name changed messages.
 * Contains the user's web ID, room entity ID, and new name.
 *
 * @see source_as_win63/habbo/communication/messages/parser/users/UserNameChangedMessageEventParser.as
 */
export class UserNameChangedMessageParser implements IMessageParser
{
    private _webId: number = -1;

    get webId(): number
    {
        return this._webId;
    }

    private _id: number = -1;

    get id(): number
    {
        return this._id;
    }

    private _newName: string = '';

    get newName(): string
    {
        return this._newName;
    }

    flush(): boolean
    {
        this._webId = -1;
        this._id = -1;
        this._newName = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._webId = wrapper.readInt();
        this._id = wrapper.readInt();
        this._newName = wrapper.readString();

        return true;
    }
}
