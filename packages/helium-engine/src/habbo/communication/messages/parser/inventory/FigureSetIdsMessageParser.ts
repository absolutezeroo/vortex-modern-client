import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for figure set IDs message (clothing)
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/clothing/FigureSetIdsEventParser.as
 */
export class FigureSetIdsMessageParser implements IMessageParser
{
	private _figureSetIds: number[] = [];

	get figureSetIds(): number[]
	{
		return this._figureSetIds;
	}

	private _boundFurnitureNames: string[] = [];

	get boundFurnitureNames(): string[]
	{
		return this._boundFurnitureNames;
	}

	flush(): boolean
	{
		this._figureSetIds = [];
		this._boundFurnitureNames = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		let count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._figureSetIds.push(wrapper.readInt());
		}
		count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._boundFurnitureNames.push(wrapper.readString());
		}
		return true;
	}
}
