import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Submit answers to a poll question
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/poll/PollAnswerComposer.as
 */
export class PollAnswerComposer extends MessageComposer<ConstructorParameters<typeof PollAnswerComposer>>
{
	private _data: ConstructorParameters<typeof PollAnswerComposer>;

	constructor(pollId: number, questionId: number, answers: string[])
	{
		super();

		this._data = [pollId, questionId, answers];
	}

	getMessageArray()
	{
		return this._data;
	}

}
