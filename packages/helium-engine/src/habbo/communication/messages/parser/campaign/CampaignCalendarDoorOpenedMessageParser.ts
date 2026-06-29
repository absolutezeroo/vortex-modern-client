import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for campaign calendar door opened response
 *
 * @see source_as_win63/habbo/communication/messages/parser/campaign/CampaignCalendarDoorOpenedMessageEventParser.as
 */
export class CampaignCalendarDoorOpenedMessageParser implements IMessageParser
{
	private _doorOpened: boolean = false;

	get doorOpened(): boolean
	{
		return this._doorOpened;
	}

	private _productName: string = '';

	get productName(): string
	{
		return this._productName;
	}

	private _customImage: string = '';

	get customImage(): string
	{
		return this._customImage;
	}

	private _furnitureClassName: string = '';

	get furnitureClassName(): string
	{
		return this._furnitureClassName;
	}

	flush(): boolean
	{
		this._doorOpened = false;
		this._productName = '';
		this._customImage = '';
		this._furnitureClassName = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._doorOpened = wrapper.readBoolean();
		this._productName = wrapper.readString();
		this._customImage = wrapper.readString();
		this._furnitureClassName = wrapper.readString();
		return true;
	}
}
