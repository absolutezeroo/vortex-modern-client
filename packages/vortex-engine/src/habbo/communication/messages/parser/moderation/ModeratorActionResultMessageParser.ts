import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for moderator action result messages.
 * Indicates success or failure of a moderation action.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/ModeratorActionResultMessageEventParser.as
 */
export class ModeratorActionResultMessageParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    private _success: boolean = false;

    get success(): boolean
    {
        return this._success;
    }

    flush(): boolean
    {
        this._userId = 0;
        this._success = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._userId = wrapper.readInt();
        this._success = wrapper.readBoolean();

        return true;
    }
}
