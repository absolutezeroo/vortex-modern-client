import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses quiz results data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/QuizResultsMessageEventParser.as
 */
export class QuizResultsMessageParser implements IMessageParser
{
    private _quizCode: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/QuizResultsMessageEventParser.as::get quizCode()
    get quizCode(): string
    {
        return this._quizCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/QuizResultsMessageEventParser.as::_questionIdsForWrongAnswers
    private _questionIdsForWrongAnswers: Array<number> = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/QuizResultsMessageEventParser.as::get questionIdsForWrongAnswers()
    get questionIdsForWrongAnswers(): Array<number>
    {
        return this._questionIdsForWrongAnswers;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/QuizResultsMessageEventParser.as::flush()
    flush(): boolean
    {
        this._quizCode = '';
        this._questionIdsForWrongAnswers = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/QuizResultsMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._quizCode = wrapper.readString();
        this._questionIdsForWrongAnswers = [];

        const count = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            this._questionIdsForWrongAnswers.push(wrapper.readInt());
        }

        return true;
    }
}
