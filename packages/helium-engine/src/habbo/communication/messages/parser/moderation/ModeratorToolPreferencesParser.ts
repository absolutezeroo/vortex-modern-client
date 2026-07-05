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

    get windowX(): number
    {
        return this._windowX;
    }

    private _windowY: number = 0;

    get windowY(): number
    {
        return this._windowY;
    }

    private _windowWidth: number = 0;

    get windowWidth(): number
    {
        return this._windowWidth;
    }

    private _windowHeight: number = 0;

    get windowHeight(): number
    {
        return this._windowHeight;
    }

    flush(): boolean
    {
        this._windowX = 0;
        this._windowY = 0;
        this._windowWidth = 0;
        this._windowHeight = 0;
        return true;
    }

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
