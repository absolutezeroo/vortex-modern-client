import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PollQuestion} from './PollQuestion';
import {PollChoice} from './PollChoice';

/**
 * Parser for poll contents events
 *
 * @see source_as_win63/habbo/communication/messages/parser/poll/PollContentsEventParser.as
 */
export class PollContentsEventParser implements IMessageParser
{
    private _id: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::_startMessage
    private _startMessage: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::get startMessage()
    get startMessage(): string
    {
        return this._startMessage;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::_endMessage
    private _endMessage: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::get endMessage()
    get endMessage(): string
    {
        return this._endMessage;
    }

    private _numQuestions: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::get numQuestions()
    get numQuestions(): number
    {
        return this._numQuestions;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::_questionArray
    private _questionArray: PollQuestion[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::get questionArray()
    get questionArray(): PollQuestion[]
    {
        return this._questionArray;
    }

    private _npsPoll: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::get npsPoll()
    get npsPoll(): boolean
    {
        return this._npsPoll;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::flush()
    flush(): boolean
    {
        this._id = -1;
        this._startMessage = '';
        this._endMessage = '';
        this._numQuestions = 0;
        this._questionArray = [];
        this._npsPoll = false;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._id = wrapper.readInt();
        this._startMessage = wrapper.readString();
        this._endMessage = wrapper.readString();
        this._numQuestions = wrapper.readInt();
        this._questionArray = [];

        for(let i = 0; i < this._numQuestions; i++)
        {
            const question = this.parseQuestion(wrapper);
            const childCount = wrapper.readInt();

            for(let j = 0; j < childCount; j++)
            {
                question.children.push(this.parseQuestion(wrapper));
            }

            this._questionArray.push(question);
        }

        this._npsPoll = wrapper.readBoolean();

        return true;
    }

    /**
     * AS3: sources/win63_version/habbo/communication/messages/parser/poll/PollContentsEventParser.as::parseQuestion()
     *
     * Choices are only on the wire for the two selection types (1 radio, 2 checkbox); the text
     * types carry an answer count but no choices.
     *
     * This used to return an anonymous object with `{value, text, type}` choices, where the
     * dialog reads `choiceText`/`choiceType` — a mismatch that throws nothing and renders an
     * empty answer list. It builds the real `PollQuestion`/`PollChoice` now.
     */
    private parseQuestion(wrapper: IMessageDataWrapper): PollQuestion
    {
        const question = new PollQuestion();

        question.questionId = wrapper.readInt();
        question.sortOrder = wrapper.readInt();
        question.questionType = wrapper.readInt();
        question.questionText = wrapper.readString();
        question.questionCategory = wrapper.readInt();
        question.questionAnswerType = wrapper.readInt();
        question.questionAnswerCount = wrapper.readInt();

        if(question.questionType === PollQuestion.QUESTION_TYPE_RADIO
            || question.questionType === PollQuestion.QUESTION_TYPE_CHECKBOX)
        {
            for(let i = 0; i < question.questionAnswerCount; i++)
            {
                question.questionChoices.push(
                    new PollChoice(wrapper.readString(), wrapper.readString(), wrapper.readInt())
                );
            }
        }

        return question;
    }
}
