import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for notification dialog message
 *
 * Parses a dialog type string and a set of key-value parameter pairs.
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/NotificationDialogMessageEventParser.as
 */
export class NotificationDialogMessageEventParser implements IMessageParser
{
    private _type: string = '';

    get type(): string
    {
        return this._type;
    }

    private _parameters: Map<string, string> = new Map();

    get parameters(): Map<string, string>
    {
        return this._parameters;
    }

    flush(): boolean
    {
        this._type = '';
        this._parameters = new Map();
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._type = wrapper.readString();
        this._parameters = new Map();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const key = wrapper.readString();
            const value = wrapper.readString();
            this._parameters.set(key, value);
        }

        return true;
    }
}
