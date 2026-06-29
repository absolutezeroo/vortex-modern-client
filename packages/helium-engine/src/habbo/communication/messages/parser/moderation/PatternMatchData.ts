import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for pattern match information in issue reports.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/class_1682.as
 */
export class PatternMatchData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._pattern = wrapper.readString();
		this._startIndex = wrapper.readInt();
		this._endIndex = wrapper.readInt();
	}

	private _pattern: string;

	get pattern(): string
	{
		return this._pattern;
	}

	private _startIndex: number;

	get startIndex(): number
	{
		return this._startIndex;
	}

	private _endIndex: number;

	get endIndex(): number
	{
		return this._endIndex;
	}
}
