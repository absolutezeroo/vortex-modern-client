import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Resolution achievement data - holds fields for a single resolution achievement
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/achievements/class_1723.as
 */
export class ResolutionAchievementData
{
	public static readonly STATE_INACTIVE: number = 0;

	constructor(wrapper: IMessageDataWrapper)
	{
		this._achievementId = wrapper.readInt();
		this._level = wrapper.readInt();
		this._badgeId = wrapper.readString();
		this._requiredLevel = wrapper.readInt();
		this._state = wrapper.readInt();
	}

	private _achievementId: number = 0;

	get achievementId(): number
	{
		return this._achievementId;
	}

	private _level: number = 0;

	get level(): number
	{
		return this._level;
	}

	private _badgeId: string = '';

	get badgeId(): string
	{
		return this._badgeId;
	}

	private _requiredLevel: number = 0;

	get requiredLevel(): number
	{
		return this._requiredLevel;
	}

	private _state: number = 0;

	get state(): number
	{
		return this._state;
	}

	get enabled(): boolean
	{
		return this._state === ResolutionAchievementData.STATE_INACTIVE;
	}

	dispose(): void
	{
		this._achievementId = 0;
		this._level = 0;
		this._badgeId = '';
		this._requiredLevel = 0;
	}
}
