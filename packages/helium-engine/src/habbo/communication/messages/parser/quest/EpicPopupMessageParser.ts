import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parses epic popup data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/quest/EpicPopupMessageEventParser.as
 */
export class EpicPopupMessageParser implements IMessageParser
{
	private _imageUri: string = '';

	get imageUri(): string
	{
		return this._imageUri;
	}

	flush(): boolean
	{
		this._imageUri = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._imageUri = wrapper.readString();
		return true;
	}
}
