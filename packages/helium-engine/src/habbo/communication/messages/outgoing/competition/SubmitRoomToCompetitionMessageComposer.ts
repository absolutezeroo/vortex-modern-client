import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * SubmitRoomToCompetitionMessageComposer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/SubmitRoomToCompetitionMessageComposer.as
 */
export class SubmitRoomToCompetitionMessageComposer extends MessageComposer<ConstructorParameters<typeof SubmitRoomToCompetitionMessageComposer>>
{
	public static readonly CONFIRM_NO: number = 0;
	public static readonly CONFIRM_YES: number = 1;
	public static readonly CONFIRM_ACCEPT: number = 2;
	public static readonly CONFIRM_REJECT: number = 3;

	private _data: ConstructorParameters<typeof SubmitRoomToCompetitionMessageComposer>;

	constructor(goalCode: string, confirmAction: number)
	{
		super();

		this._data = [goalCode, confirmAction];
	}

	getMessageArray()
	{
		return this._data;
	}
}
