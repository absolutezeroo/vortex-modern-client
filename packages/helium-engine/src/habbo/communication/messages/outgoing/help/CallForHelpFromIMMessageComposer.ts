import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a call for help report from an instant message conversation.
 * Chat entries array contains pairs of [timestamp, message] strings.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/CallForHelpFromIMMessageComposer.as
 */
export class CallForHelpFromIMMessageComposer extends MessageComposer<unknown[]>
{
	private _data: unknown[];

	constructor(message: string, topicId: number, reportedUserId: number, chatEntries: string[])
	{
		super();
		this._data = [];
		this._data.push(message);
		this._data.push(topicId);
		this._data.push(reportedUserId);
		this._data.push(chatEntries.length / 2);

		for (const entry of chatEntries)
		{
			this._data.push(entry);
		}
	}

	getMessageArray()
	{
		return this._data;
	}
}
