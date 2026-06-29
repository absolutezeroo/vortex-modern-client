import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class FlatControllerRemovedEventParser implements IMessageParser
{
    private _flatId: number = 0;
    private _userId: number = 0;

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._flatId = wrapper.readInt();
        this._userId = wrapper.readInt();
        return true;
    }

    get flatId(): number { return this._flatId; }
    get userId(): number { return this._userId; }
}
