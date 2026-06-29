import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a mod tool sanction request.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ModToolSanctionComposer.as
 */
export class ModToolSanctionComposer extends MessageComposer<ConstructorParameters<typeof ModToolSanctionComposer>>
{
	private _data: ConstructorParameters<typeof ModToolSanctionComposer>;

	constructor(issueId: number, sanctionTypeId: number, userId: number)
	{
		super();
		this._data = [issueId, sanctionTypeId, userId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
