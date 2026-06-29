/**
 * Data class defining a moderation action (Alert, Mute, Ban, Kick, etc.)
 *
 * Contains the action's metadata including type, sanction info, and duration.
 *
 * @see source_as_win63/habbo/moderation/ModActionDefinition.as
 */
export class ModActionDefinition
{
	public static readonly ALERT: number = 1;
	public static readonly MUTE: number = 2;
	public static readonly BAN: number = 3;
	public static readonly KICK: number = 4;
	public static readonly TRADING_LOCK: number = 5;
	public static readonly MESSAGE: number = 6;

	constructor(actionId: number, name: string, actionType: number, sanctionTypeId: number, actionLengthHours: number)
	{
		this._actionId = actionId;
		this._name = name;
		this._actionType = actionType;
		this._sanctionTypeId = sanctionTypeId;
		this._actionLengthHours = actionLengthHours;
	}

	private _actionId: number;

	get actionId(): number
	{
		return this._actionId;
	}

	private _name: string;

	get name(): string
	{
		return this._name;
	}

	private _actionType: number;

	get actionType(): number
	{
		return this._actionType;
	}

	private _sanctionTypeId: number;

	get sanctionTypeId(): number
	{
		return this._sanctionTypeId;
	}

	private _actionLengthHours: number;

	get actionLengthHours(): number
	{
		return this._actionLengthHours;
	}
}
