import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {PetInfoData} from '../../incoming/notifications/PetFigureDataParser';
import {parsePetInfoData} from '../../incoming/notifications/PetFigureDataParser';

/**
 * Parser for pet respect notification event
 *
 * Parses respect count, pet owner ID, and pet data.
 *
 * @see source_as_win63/habbo/communication/messages/parser/users/PetRespectNotificationEventParser.as
 */
export class PetRespectNotificationEventParser implements IMessageParser
{
	public static readonly PET_TREAT_TYPE_ID: number = 16;

	private _respect: number = 0;

	get respect(): number
	{
		return this._respect;
	}

	private _petOwnerId: number = 0;

	get petOwnerId(): number
	{
		return this._petOwnerId;
	}

	private _petData: PetInfoData | null = null;

	get petData(): PetInfoData | null
	{
		return this._petData;
	}

	flush(): boolean
	{
		this._respect = 0;
		this._petOwnerId = 0;
		this._petData = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._respect = wrapper.readInt();
		this._petOwnerId = wrapper.readInt();
		this._petData = parsePetInfoData(wrapper);

		return true;
	}

	/**
	 * Returns whether this is a treat notification
	 */
	isTreat(): boolean
	{
		return this._petData !== null && this._petData.figureData.typeId === PetRespectNotificationEventParser.PET_TREAT_TYPE_ID;
	}
}
