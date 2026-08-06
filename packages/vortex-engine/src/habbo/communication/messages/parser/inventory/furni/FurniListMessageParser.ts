import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {FurniListItemParser} from './FurniListItemParser';

/**
 * Parser for FurniList message (fragmented inventory list)
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/furni/FurniListEventParser.as
 */
export class FurniListMessageParser implements IMessageParser
{
    private _totalFragments: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListEventParser.as::get totalFragments()
    get totalFragments(): number
    {
        return this._totalFragments;
    }

    private _fragmentNo: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListEventParser.as::get fragmentNo()
    get fragmentNo(): number
    {
        return this._fragmentNo;
    }

    private _items: Map<number, FurniListItemParser> = new Map();

    get items(): Map<number, FurniListItemParser>
    {
        return this._items;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListEventParser.as::flush()
    flush(): boolean
    {
        this._items.clear();

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/furni/FurniListEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._totalFragments = wrapper.readInt();
        this._fragmentNo = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const item = new FurniListItemParser(wrapper);

            this._items.set(item.itemId, item);
        }

        return true;
    }
}
