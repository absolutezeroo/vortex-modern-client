import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room ad (event) error response.
 * errorCode: 0 = name error, 1 = description error.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/advertisement/RoomAdErrorEventParser.as
 */
export class RoomAdErrorMessageParser implements IMessageParser
{
    private _errorCode: number = 0;
    private _filteredText: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/advertisement/RoomAdErrorEventParser.as::get errorCode()
    get errorCode(): number
    {
        return this._errorCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/advertisement/RoomAdErrorEventParser.as::get filteredText()
    get filteredText(): string
    {
        return this._filteredText;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/advertisement/RoomAdErrorEventParser.as::flush()
    flush(): boolean
    {
        this._errorCode = 0;
        this._filteredText = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/advertisement/RoomAdErrorEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errorCode = wrapper.readInt();
        this._filteredText = wrapper.readString();

        return true;
    }
}
