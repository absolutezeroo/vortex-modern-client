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

    get errorCode(): number
    {
        return this._errorCode;
    }

    get filteredText(): string
    {
        return this._filteredText;
    }

    flush(): boolean
    {
        this._errorCode = 0;
        this._filteredText = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errorCode = wrapper.readInt();
        this._filteredText = wrapper.readString();

        return true;
    }
}
