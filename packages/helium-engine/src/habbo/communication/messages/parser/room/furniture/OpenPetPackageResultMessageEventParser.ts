import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for open pet package result message
 *
 * @see source_as_win63/habbo/communication/messages/parser/room/furniture/OpenPetPackageResultMessageEventParser.as
 */
export class OpenPetPackageResultMessageEventParser implements IMessageParser
{
	private _objectId: number = 0;

	get objectId(): number
	{
		return this._objectId;
	}

	private _nameValidationStatus: number = 0;

	get nameValidationStatus(): number
	{
		return this._nameValidationStatus;
	}

	private _nameValidationInfo: string = '';

	get nameValidationInfo(): string
	{
		return this._nameValidationInfo;
	}

	flush(): boolean
	{
		this._objectId = 0;
		this._nameValidationStatus = 0;
		this._nameValidationInfo = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._objectId = wrapper.readInt();
		this._nameValidationStatus = wrapper.readInt();
		this._nameValidationInfo = wrapper.readString();

		return true;
	}
}
