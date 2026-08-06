import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for FurniListRemove message (item removed from inventory)
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/furni/FurniListRemoveEventParser.as
 */
export class FurniListRemoveMessageParser implements IMessageParser
{
    private _itemId: number = 0;

    get itemId(): number
    {
        return this._itemId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListRemoveEventParser.as::flush()
    flush(): boolean
    {
        this._itemId = 0;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListRemoveEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._itemId = wrapper.readInt();

        return true;
    }
}
