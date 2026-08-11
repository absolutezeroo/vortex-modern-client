import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for a quiz's question set (header 1982).
 *
 * Sent by both quiz entry points — `showHabboWayQuiz()` passes `"HabboWay1"`, `showSafetyQuiz()`
 * passes `"SafetyQuiz1"`. The window is not opened here: it opens when `QuizDataMessageEvent`
 * comes back with the question ids.
 *
 * Header from the primary registry (`_composers[1982] = _SafeCls_2671`); the class name is
 * recovered from `sources/win63_version/habbo/communication/messages/outgoing/help/GetQuizQuestionsComposer.as`.
 * `vortex-emulator` corroborates: `Revision20260701/Headers.cs::GetQuizQuestionsEvent = 1982`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_2671.as
 */
export class GetQuizQuestionsComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_2671.as::_SafeStr_4642
    private _data: [string];

    // AS3: _SafeCls_2671.as::_SafeCls_2671()
    constructor(quizCode: string)
    {
        super();

        this._data = [quizCode];
    }

    // AS3: _SafeCls_2671.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
