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

    get resultCode(): number
    {
        return this._resultCode;
    }

    private _roomLimit: number = 0;

    get roomLimit(): number
    {
        return this._roomLimit;
    }

    flush(): boolean
    {
        this._resultCode = 0;
        this._roomLimit = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._resultCode = wrapper.readInt();
        this._roomLimit = wrapper.readInt();
        return true;
    }
}
