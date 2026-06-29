import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {FurniListItemParser} from './FurniListItemParser';

/**
 * Parser for FurniListAddOrUpdate message (item added or updated)
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/furni/FurniListAddOrUpdateEventParser.as
 */
export class FurniListAddOrUpdateMessageParser implements IMessageParser
{
	private _items: FurniListItemParser[] = [];

	get items(): FurniListItemParser[]
	{
		return this._items;
	}

	flush(): boolean
	{
		this._items = [];

		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		// Note: AS3 reads 1 item, but the message may contain more in some implementations
		const item = new FurniListItemParser(wrapper);

		this._items.push(item);

		return true;
	}
}
