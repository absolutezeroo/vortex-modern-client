import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Result code constants for room creation check
 */
export const CanCreateRoomResult = {
    OK: 0,
    MAX_ROOMS_REACHED: 1,
} as const;

/**
 * Parser for can create room message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/CanCreateRoomEventParser.as
 */
export class CanCreateRoomMessageParser implements IMessageParser
{
    private _resultCode: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CanCreateRoomEventParser.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    private _roomLimit: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CanCreateRoomEventParser.as::get roomLimit()
    get roomLimit(): number
    {
        return this._roomLimit;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CanCreateRoomEventParser.as::flush()
    flush(): boolean
    {
        this._resultCode = 0;
        this._roomLimit = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/CanCreateRoomEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._resultCode = wrapper.readInt();
        this._roomLimit = wrapper.readInt();
        return true;
    }
}
