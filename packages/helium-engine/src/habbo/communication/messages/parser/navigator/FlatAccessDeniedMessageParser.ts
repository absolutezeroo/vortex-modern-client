import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for flat access denied message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/FlatAccessDeniedMessageEventParser.as
 */
export class FlatAccessDeniedMessageParser implements IMessageParser
{
    private _flatId: number = 0;

    get flatId(): number
    {
        return this._flatId;
    }

    private _userName: string | null = null;

    get userName(): string | null
    {
        return this._userName;
    }

    flush(): boolean
    {
        this._flatId = 0;
        this._userName = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._flatId = wrapper.readInt();
        if(wrapper.bytesAvailable > 0)
        {
            this._userName = wrapper.readString();
        }
        return true;
    }
}
