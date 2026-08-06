import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for question answered events (word quiz)
 *
 * @see source_as_win63/habbo/communication/messages/parser/poll/QuestionAnsweredEventParser.as
 */
export class QuestionAnsweredEventParser implements IMessageParser
{
    private _userId: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/QuestionAnsweredEventParser.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/QuestionAnsweredEventParser.as::_value
    private _value: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/QuestionAnsweredEventParser.as::get value()
    get value(): string
    {
        return this._value;
    }

    private _answerCounts: Map<string, number> = new Map();

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/QuestionAnsweredEventParser.as::get answerCounts()
    get answerCounts(): Map<string, number>
    {
        return this._answerCounts;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/QuestionAnsweredEventParser.as::flush()
    flush(): boolean
    {
        this._userId = -1;
        this._value = '';
        this._answerCounts = new Map();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/QuestionAnsweredEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._userId = wrapper.readInt();
        this._value = wrapper.readString();
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
