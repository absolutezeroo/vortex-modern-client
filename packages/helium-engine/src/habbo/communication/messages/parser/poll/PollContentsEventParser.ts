import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for poll contents events
 *
 * @see source_as_win63/habbo/communication/messages/parser/poll/PollContentsEventParser.as
 */
export class PollContentsEventParser implements IMessageParser
{
	private _id: number = -1;

	get id(): number
	{
		return this._id;
	}

	private _startMessage: string = '';

	get startMessage(): string
	{
		return this._startMessage;
	}

	private _endMessage: string = '';

	get endMessage(): string
	{
		return this._endMessage;
	}

	private _numQuestions: number = 0;

	get numQuestions(): number
	{
		return this._numQuestions;
	}

	private _questionArray: unknown[] = [];

	get questionArray(): unknown[]
	{
		return this._questionArray;
	}

	private _npsPoll: boolean = false;

	get npsPoll(): boolean
	{
		return this._npsPoll;
	}

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

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._id = wrapper.readInt();
		this._startMessage = wrapper.readString();
		this._endMessage = wrapper.readString();
		this._numQuestions = wrapper.readInt();
		this._questionArray = [];

		for (let i = 0; i < this._numQuestions; i++)
		{
			const question = this.parseQuestion(wrapper);
			const childCount = wrapper.readInt();

			const children: unknown[] = [];
			for (let j = 0; j < childCount; j++)
			{
				children.push(this.parseQuestion(wrapper));
			}

			this._questionArray.push({...question, children});
		}

		this._npsPoll = wrapper.readBoolean();

		return true;
	}

	private parseQuestion(wrapper: IMessageDataWrapper): Record<string, unknown>
	{
		const questionId = wrapper.readInt();
		const sortOrder = wrapper.readInt();
		const questionType = wrapper.readInt();
		const questionText = wrapper.readString();
		const questionCategory = wrapper.readInt();
		const questionAnswerType = wrapper.readInt();
		const questionAnswerCount = wrapper.readInt();

		const questionChoices: unknown[] = [];

		if (questionType === 1 || questionType === 2)
		{
			for (let i = 0; i < questionAnswerCount; i++)
			{
				const choiceValue = wrapper.readString();
				const choiceText = wrapper.readString();
				const choiceType = wrapper.readInt();
				questionChoices.push({value: choiceValue, text: choiceText, type: choiceType});
			}
		}

		return {
			questionId,
			sortOrder,
			questionType,
			questionText,
			questionCategory,
			questionAnswerType,
			questionAnswerCount,
			questionChoices,
		};
	}
}
