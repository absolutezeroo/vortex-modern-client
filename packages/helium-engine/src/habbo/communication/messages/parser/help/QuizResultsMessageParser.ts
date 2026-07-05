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

    get quizCode(): string
    {
        return this._quizCode;
    }

    private _questionIdsForWrongAnswers: Array<number> = [];

    get questionIdsForWrongAnswers(): Array<number>
    {
        return this._questionIdsForWrongAnswers;
    }

    flush(): boolean
    {
        this._quizCode = '';
        this._questionIdsForWrongAnswers = [];
        return true;
    }

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
