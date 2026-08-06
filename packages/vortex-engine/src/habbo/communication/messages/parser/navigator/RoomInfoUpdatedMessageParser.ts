import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room info updated message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/RoomInfoUpdatedEventParser.as
 */
export class RoomInfoUpdatedMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomInfoUpdatedEventParser.as::_flatId
    private _flatId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomInfoUpdatedEventParser.as::get flatId()
    get flatId(): number
    {
        return this._flatId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomInfoUpdatedEventParser.as::flush()
    flush(): boolean
    {
        this._flatId = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/RoomInfoUpdatedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._flatId = wrapper.readInt();
        return true;
    }
}
