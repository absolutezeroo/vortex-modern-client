import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class ShowEnforceRoomCategoryDialogEventParser implements IMessageParser
{
    private _selectionType: number = 0;

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._selectionType = wrapper.readInt();
        return true;
    }

    get selectionType(): number { return this._selectionType; }
}
