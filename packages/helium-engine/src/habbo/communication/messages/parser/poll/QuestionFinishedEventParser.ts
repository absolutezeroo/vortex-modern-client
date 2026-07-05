import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for question finished events (word quiz)
 *
 * @see source_as_win63/habbo/communication/messages/parser/poll/QuestionFinishedEventParser.as
 */
export class QuestionFinishedEventParser implements IMessageParser
{
    private _questionId: number = -1;

    get questionId(): number
    {
        return this._questionId;
    }

    private _answerCounts: Map<string, number> = new Map();

    get answerCounts(): Map<string, number>
    {
        return this._answerCounts;
    }

    flush(): boolean
    {
        this._questionId = -1;
        this._answerCounts = new Map();
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._questionId = wrapper.readInt();
        this._answerCounts = new Map();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const key = wrapper.readString();
            const value = wrapper.readInt();
            this._answerCounts.set(key, value);
        }

        return true;
    }
}
