import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for question events (word quiz)
 *
 * @see source_as_win63/habbo/communication/messages/parser/poll/QuestionEventParser.as
 */
export class QuestionEventParser implements IMessageParser
{
    private _pollType: string | null = null;

    get pollType(): string | null
    {
        return this._pollType;
    }

    private _pollId: number = -1;

    get pollId(): number
    {
        return this._pollId;
    }

    private _questionId: number = -1;

    get questionId(): number
    {
        return this._questionId;
    }

    private _duration: number = -1;

    get duration(): number
    {
        return this._duration;
    }

    private _question: Record<string, unknown> | null = null;

    get question(): Record<string, unknown> | null
    {
        return this._question;
    }

    flush(): boolean
    {
        this._pollType = null;
        this._pollId = -1;
        this._questionId = -1;
        this._duration = -1;
        this._question = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._pollType = wrapper.readString();
        this._pollId = wrapper.readInt();
        this._questionId = wrapper.readInt();
        this._duration = wrapper.readInt();

        const question: Record<string, unknown> = {};
        question['id'] = wrapper.readInt();
        question['number'] = wrapper.readInt();
        question['type'] = wrapper.readInt();
        question['content'] = wrapper.readString();

        const questionType = question['type'] as number;

        if(questionType === 1 || questionType === 2)
        {
            question['selection_min'] = wrapper.readInt();
            wrapper.readInt();
            const selections: string[] = [];
            const selectionValues: string[] = [];

            question['selections'] = selections;
            question['selection_values'] = selectionValues;
            question['selection_count'] = 0;
            question['selection_max'] = 0;
        }

        this._question = question;

        return true;
    }
}
