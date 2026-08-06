import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for moderator tool window preferences (position/size).
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/ModeratorToolPreferencesEventParser.as
 */
export class ModeratorToolPreferencesParser implements IMessageParser
{
    private _windowX: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorToolPreferencesEventParser.as::get windowX()
    get windowX(): number
    {
        return this._windowX;
    }

    private _windowY: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorToolPreferencesEventParser.as::get windowY()
    get windowY(): number
    {
        return this._windowY;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorToolPreferencesEventParser.as::_windowWidth
    private _windowWidth: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorToolPreferencesEventParser.as::get windowWidth()
    get windowWidth(): number
    {
        return this._windowWidth;
    }

    private _windowHeight: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorToolPreferencesEventParser.as::get windowHeight()
    get windowHeight(): number
    {
        return this._windowHeight;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorToolPreferencesEventParser.as::flush()
    flush(): boolean
    {
        this._windowX = 0;
        this._windowY = 0;
        this._windowWidth = 0;
        this._windowHeight = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorToolPreferencesEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._windowX = wrapper.readInt();
        this._windowY = wrapper.readInt();
        this._windowWidth = wrapper.readInt();
        this._windowHeight = wrapper.readInt();

        return true;
    }
}
