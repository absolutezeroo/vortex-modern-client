import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for converted room id message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/ConvertedRoomIdEventParser.as
 */
export class ConvertedRoomIdMessageParser implements IMessageParser
{
    private _globalId: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/ConvertedRoomIdEventParser.as::get globalId()
    get globalId(): string
    {
        return this._globalId;
    }

    private _convertedId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/ConvertedRoomIdEventParser.as::get convertedId()
    get convertedId(): number
    {
        return this._convertedId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/ConvertedRoomIdEventParser.as::flush()
    flush(): boolean
    {
        this._globalId = '';
        this._convertedId = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/ConvertedRoomIdEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._globalId = wrapper.readString();
        this._convertedId = wrapper.readInt();
        return true;
    }
}
