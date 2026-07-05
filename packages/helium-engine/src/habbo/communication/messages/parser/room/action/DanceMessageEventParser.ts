/**
 * DanceMessageEventParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.action.DanceMessageEventParser
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class DanceMessageEventParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    private _danceStyle: number = 0;

    get danceStyle(): number
    {
        return this._danceStyle;
    }

    flush(): boolean
    {
        this._userId = 0;
        this._danceStyle = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper === null)
        {
            return false;
        }

        this._userId = wrapper.readInt();
        this._danceStyle = wrapper.readInt();

        return true;
    }
}
