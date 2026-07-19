import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for mystery box keys message
 *
 * @see source_as_win63/habbo/communication/messages/parser/mysterybox/MysteryBoxKeysMessageEventParser.as
 */
export class MysteryBoxKeysMessageParser implements IMessageParser
{
    private _boxColor: string = '';

    get boxColor(): string
    {
        return this._boxColor;
    }

    private _keyColor: string = '';

    get keyColor(): string
    {
        return this._keyColor;
    }

    flush(): boolean
    {
        this._boxColor = '';
        this._keyColor = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._boxColor = wrapper.readString();
        this._keyColor = wrapper.readString();
        return true;
    }
}
