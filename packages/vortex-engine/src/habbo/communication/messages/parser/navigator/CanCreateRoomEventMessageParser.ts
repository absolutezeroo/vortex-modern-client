import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for can create room event message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/CanCreateRoomEventEventParser.as
 */
export class CanCreateRoomEventMessageParser implements IMessageParser
{
    private _canCreateEvent: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CanCreateRoomEventEventParser.as::get canCreateEvent()
    get canCreateEvent(): boolean
    {
        return this._canCreateEvent;
    }

    private _errorCode: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CanCreateRoomEventEventParser.as::get errorCode()
    get errorCode(): number
    {
        return this._errorCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CanCreateRoomEventEventParser.as::flush()
    flush(): boolean
    {
        this._canCreateEvent = false;
        this._errorCode = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CanCreateRoomEventEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._canCreateEvent = wrapper.readBoolean();
        this._errorCode = wrapper.readInt();
        return true;
    }
}
