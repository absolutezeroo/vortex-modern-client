/**
 * ExpressionMessageEventParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.action.ExpressionMessageEventParser
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class ExpressionMessageEventParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    private _expressionType: number = -1;

    get expressionType(): number
    {
        return this._expressionType;
    }

    flush(): boolean
    {
        this._userId = 0;
        this._expressionType = -1;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper === null)
        {
            return false;
        }

        this._userId = wrapper.readInt();
        this._expressionType = wrapper.readInt();

        return true;
    }
}
