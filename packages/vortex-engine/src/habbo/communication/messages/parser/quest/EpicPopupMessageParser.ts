import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parses epic popup data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/quest/EpicPopupMessageEventParser.as
 */
export class EpicPopupMessageParser implements IMessageParser
{
    private _imageUri: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/EpicPopupMessageEventParser.as::get imageUri()
    get imageUri(): string
    {
        return this._imageUri;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/EpicPopupMessageEventParser.as::flush()
    flush(): boolean
    {
        this._imageUri = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/quest/EpicPopupMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._imageUri = wrapper.readString();
        return true;
    }
}
