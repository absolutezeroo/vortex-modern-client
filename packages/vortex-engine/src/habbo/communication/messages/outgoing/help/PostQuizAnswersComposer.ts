import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Submits a quiz's answers (header 1387).
 *
 * The answers are the selected option index per question, in the order the questions were asked —
 * not in the order they were displayed, which the client shuffles per question.
 *
 * Wire shape is the quiz code, then the answer count, then one integer per answer; AS3 writes the
 * length itself rather than relying on a list helper.
 *
 * Header from the primary registry (`_composers[1387] = _SafeCls_3577`); the class name is
 * recovered from `sources/win63_version/habbo/communication/messages/outgoing/help/PostQuizAnswersComposer.as`.
 * `vortex-emulator` corroborates: `Revision20260701/Headers.cs::PostQuizAnswersEvent = 1387`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_3577.as
 */
export class PostQuizAnswersComposer extends MessageComposer<unknown[]>
{
    // AS3: _SafeCls_3577.as::_SafeStr_4642
    private _data: unknown[];

    // AS3: _SafeCls_3577.as::_SafeCls_3577()
    constructor(quizCode: string, answers: number[])
    {
        super();

        this._data = [quizCode, answers.length];

        for(const answer of answers) this._data.push(answer);
    }

    // AS3: _SafeCls_3577.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
