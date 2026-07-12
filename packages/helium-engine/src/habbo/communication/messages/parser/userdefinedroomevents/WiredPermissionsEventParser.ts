import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the current user's wired-trigger permissions in the room (read/modify).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredPermissionsEventParser.as
 */
export class WiredPermissionsEventParser implements IMessageParser
{
    private _canModify: boolean = false;

    get canModify(): boolean
    {
        return this._canModify;
    }

    private _canRead: boolean = false;

    get canRead(): boolean
    {
        return this._canRead;
    }

    flush(): boolean
    {
        this._canModify = false;
        this._canRead = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._canModify = wrapper.readBoolean();
        this._canRead = wrapper.readBoolean();

        return true;
    }
}
