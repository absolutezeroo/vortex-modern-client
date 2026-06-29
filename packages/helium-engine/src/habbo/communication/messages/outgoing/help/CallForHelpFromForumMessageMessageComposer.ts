import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a call for help report from a forum message.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/CallForHelpFromForumMessageMessageComposer.as
 */
export class CallForHelpFromForumMessageMessageComposer extends MessageComposer<ConstructorParameters<typeof CallForHelpFromForumMessageMessageComposer>>
{
	private _data: ConstructorParameters<typeof CallForHelpFromForumMessageMessageComposer>;

	constructor(groupId: number, threadId: number, messageId: number, topicId: number, message: string)
	{
		super();
		this._data = [groupId, threadId, messageId, topicId, message];
	}

	getMessageArray()
	{
		return this._data;
	}
}
