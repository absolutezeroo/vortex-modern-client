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

    // AS3: sources/win63_version/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredPermissionsEventParser.as::get canModify()
    get canModify(): boolean
    {
        return this._canModify;
    }

    private _canRead: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredPermissionsEventParser.as::get canRead()
    get canRead(): boolean
    {
        return this._canRead;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredPermissionsEventParser.as::flush()
    flush(): boolean
    {
        this._canModify = false;
        this._canRead = false;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredPermissionsEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._canModify = wrapper.readBoolean();
        this._canRead = wrapper.readBoolean();

        return true;
    }
}
