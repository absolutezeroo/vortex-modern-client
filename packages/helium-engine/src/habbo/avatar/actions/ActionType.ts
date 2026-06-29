/**
 * Represents an action type with its behavioral flags, parsed from JSON.
 *
 * @see sources/win63_version/habbo/avatar/actions/ActionType.as
 */
export class ActionType
{
	constructor(data: any)
	{
		this._id = parseInt(data.value) || 0;
		this._value = parseInt(data.value) || 0;
		this._prevents = [];
		this._preventHeadTurn = true;
		this._isAnimated = true;

		const prevents: string = String(data.prevents ?? '');

		if (prevents !== '')
		{
			this._prevents = prevents.split(',');
		}

		this._preventHeadTurn = (String(data.preventheadturn) === 'true');

		const animated: string = String(data.animated ?? '');

		if (animated === '')
		{
			this._isAnimated = true;
		}
		else
		{
			this._isAnimated = (animated === 'true');
		}
	}

	private _id: number;

	/**
	 * The action type numeric identifier.
	 */
	public get id(): number
	{
		return this._id;
	}

	private _value: number;

	/**
	 * The action type value.
	 */
	public get value(): number
	{
		return this._value;
	}

	private _prevents: string[];

	/**
	 * The list of action identifiers that this type prevents.
	 */
	public get prevents(): string[]
	{
		return this._prevents;
	}

	private _preventHeadTurn: boolean;

	/**
	 * Whether this action type prevents head turning.
	 */
	public get preventHeadTurn(): boolean
	{
		return this._preventHeadTurn;
	}

	private _isAnimated: boolean;

	/**
	 * Whether this action type is animated.
	 */
	public get isAnimated(): boolean
	{
		return this._isAnimated;
	}
}
