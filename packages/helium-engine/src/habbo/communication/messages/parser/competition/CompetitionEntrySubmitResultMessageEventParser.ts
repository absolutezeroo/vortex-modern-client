import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for competition entry submit result message
 *
 * @see source_as_win63/habbo/communication/messages/parser/competition/CompetitionEntrySubmitResultMessageEventParser.as
 */
export class CompetitionEntrySubmitResultMessageEventParser implements IMessageParser
{
	public static readonly OK: number = 0;
	public static readonly RESULT_1: number = 1;
	public static readonly RESULT_2: number = 2;
	public static readonly RESULT_3: number = 3;
	public static readonly RESULT_4: number = 4;
	public static readonly RESULT_5: number = 5;
	public static readonly RESULT_6: number = 6;
	private _missingFurnis: Map<string, string> | null = null;

	private _goalId: number = 0;

	get goalId(): number
	{
		return this._goalId;
	}

	private _goalCode: string = '';

	get goalCode(): string
	{
		return this._goalCode;
	}

	private _result: number = 0;

	get result(): number
	{
		return this._result;
	}

	private _requiredFurnis: string[] | null = null;

	get requiredFurnis(): string[] | null
	{
		return this._requiredFurnis;
	}

	isMissing(name: string): boolean
	{
		if (!this._missingFurnis) return false;
		return this._missingFurnis.has(name);
	}

	flush(): boolean
	{
		this._goalId = 0;
		this._goalCode = '';
		this._result = 0;
		this._requiredFurnis = null;
		this._missingFurnis = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._goalId = wrapper.readInt();
		this._goalCode = wrapper.readString();
		this._result = wrapper.readInt();

		this._requiredFurnis = [];
		let count: number = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._requiredFurnis.push(wrapper.readString());
		}

		this._missingFurnis = new Map();
		count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._missingFurnis.set(wrapper.readString(), "");
		}

		return true;
	}
}
