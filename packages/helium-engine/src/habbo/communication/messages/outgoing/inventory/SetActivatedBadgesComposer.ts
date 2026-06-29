import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Set which badges are worn/active
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/badges/SetActivatedBadgesComposer.as
 */
export class SetActivatedBadgesComposer extends MessageComposer<unknown[]>
{
	private _data: unknown[];

	constructor(...badgeIds: string[])
	{
		super();

		this._data = [];

		// Build the data array in constructor: slot1, badge1, slot2, badge2, ...
		for (let i = 0; i < 5; i++)
		{
			this._data.push(i + 1); // slot number (1-5)
			this._data.push(badgeIds[i] ?? ''); // badge id or empty
		}
	}

	getMessageArray()
	{
		return this._data;
	}

}
