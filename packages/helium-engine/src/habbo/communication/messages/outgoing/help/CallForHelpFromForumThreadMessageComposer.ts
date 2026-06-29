import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a call for help report from a forum thread.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/CallForHelpFromForumThreadMessageComposer.as
 */
export class CallForHelpFromForumThreadMessageComposer extends MessageComposer<ConstructorParameters<typeof CallForHelpFromForumThreadMessageComposer>>
{
	private _data: ConstructorParameters<typeof CallForHelpFromForumThreadMessageComposer>;

	constructor(groupId: number, threadId: number, topicId: number, message: string)
	{
		super();
		this._data = [groupId, threadId, topicId, message];
	}

	getMessageArray()
	{
		return this._data;
	}
}
