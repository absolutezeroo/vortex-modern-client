import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Closes one or more issues with a resolution code.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/CloseIssuesMessageComposer.as
 */
export class CloseIssuesMessageComposer extends MessageComposer<unknown[]>
{
	private _data: unknown[];

	constructor(issueIds: number[], resolution: number)
	{
		super();
		this._data = [];
		this._data.push(resolution);
		this._data.push(issueIds.length);

		for (const issueId of issueIds)
		{
			this._data.push(issueId);
		}
	}

	getMessageArray(): unknown[]
	{
		return this._data;
	}
}
