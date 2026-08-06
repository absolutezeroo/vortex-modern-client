import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Submit answers to a poll question
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/poll/PollAnswerComposer.as
 */
export class PollAnswerComposer extends MessageComposer<ConstructorParameters<typeof PollAnswerComposer>>
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/outgoing/poll/PollAnswerComposer.as::_data
    private _data: ConstructorParameters<typeof PollAnswerComposer>;

    constructor(pollId: number, questionId: number, answers: string[])
    {
        super();

        this._data = [pollId, questionId, answers];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/poll/PollAnswerComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
