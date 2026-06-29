import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for pet respect failed event
 *
 * Parses the required days and avatar age in days.
 *
 * @see source_as_win63/habbo/communication/messages/parser/room/pets/PetRespectFailedEventParser.as
 */
export class PetRespectFailedEventParser implements IMessageParser
{
	private _requiredDays: number = 0;

	get requiredDays(): number
	{
		return this._requiredDays;
	}

	private _avatarAgeInDays: number = 0;

	get avatarAgeInDays(): number
	{
		return this._avatarAgeInDays;
	}

	flush(): boolean
	{
		this._requiredDays = 0;
		this._avatarAgeInDays = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._requiredDays = wrapper.readInt();
		this._avatarAgeInDays = wrapper.readInt();

		return true;
	}
}
