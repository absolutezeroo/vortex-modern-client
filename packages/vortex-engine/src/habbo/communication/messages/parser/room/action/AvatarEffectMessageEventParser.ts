/**
 * AvatarEffectMessageEventParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.action.AvatarEffectMessageEventParser
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class AvatarEffectMessageEventParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    private _effectId: number = 0;

    get effectId(): number
    {
        return this._effectId;
    }

    private _delayMilliSeconds: number = 0;

    get delayMilliSeconds(): number
    {
        return this._delayMilliSeconds;
    }

    flush(): boolean
    {
        this._userId = 0;
        this._effectId = 0;
        this._delayMilliSeconds = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper === null)
        {
            return false;
        }

        this._userId = wrapper.readInt();
        this._effectId = wrapper.readInt();
        this._delayMilliSeconds = wrapper.readInt();

        return true;
    }
}
