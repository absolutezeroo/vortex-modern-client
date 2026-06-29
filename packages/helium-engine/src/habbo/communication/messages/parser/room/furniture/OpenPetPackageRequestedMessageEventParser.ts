import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for open pet package requested message
 *
 * @see source_as_win63/habbo/communication/messages/parser/room/furniture/OpenPetPackageRequestedMessageEventParser.as
 */
export class OpenPetPackageRequestedMessageEventParser implements IMessageParser
{
	private _objectId: number = -1;

	get objectId(): number
	{
		return this._objectId;
	}

	private _figureData: unknown = null;

	get figureData(): unknown
	{
		return this._figureData;
	}

	flush(): boolean
	{
		this._objectId = -1;
		this._figureData = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._objectId = wrapper.readInt();

		// TODO: Parse figureData (obfuscated class_1657 in AS3)

		return true;
	}
}
