import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for mystery box keys message
 *
 * @see source_as_win63/habbo/communication/messages/parser/mysterybox/MysteryBoxKeysMessageEventParser.as
 */
export class MysteryBoxKeysMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/mysterybox/MysteryBoxKeysMessageEventParser.as::_boxColor
    private _boxColor: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/mysterybox/MysteryBoxKeysMessageEventParser.as::get boxColor()
    get boxColor(): string
    {
        return this._boxColor;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/mysterybox/MysteryBoxKeysMessageEventParser.as::_keyColor
    private _keyColor: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/mysterybox/MysteryBoxKeysMessageEventParser.as::get keyColor()
    get keyColor(): string
    {
        return this._keyColor;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/mysterybox/MysteryBoxKeysMessageEventParser.as::flush()
    flush(): boolean
    {
        this._boxColor = '';
        this._keyColor = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/mysterybox/MysteryBoxKeysMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._boxColor = wrapper.readString();
        this._keyColor = wrapper.readString();
        return true;
    }
}
