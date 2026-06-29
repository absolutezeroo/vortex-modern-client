import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for achievement notification information
 *
 * Parses achievement data from the message wrapper including type, level,
 * points, badge info, and category.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/class_1681.as
 */
export class AchievementNotificationData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._type = wrapper.readInt();
		this._level = wrapper.readInt();
		this._badgeId = wrapper.readInt();
		this._badgeCode = wrapper.readString();
		this._points = wrapper.readInt();
		this._levelRewardPoints = wrapper.readInt();
		this._levelRewardPointType = wrapper.readInt();
		this._bonusPoints = wrapper.readInt();
		this._achievementID = wrapper.readInt();
		this._removedBadgeCode = wrapper.readString();
		this._category = wrapper.readString();
		this._showDialogToUser = wrapper.readBoolean();
	}

	private _type: number = 0;

	get type(): number
	{
		return this._type;
	}

	private _level: number = 0;

	get level(): number
	{
		return this._level;
	}

	private _badgeId: number = 0;

	get badgeId(): number
	{
		return this._badgeId;
	}

	private _badgeCode: string = '';

	get badgeCode(): string
	{
		return this._badgeCode;
	}

	private _points: number = 0;

	get points(): number
	{
		return this._points;
	}

	private _levelRewardPoints: number = 0;

	get levelRewardPoints(): number
	{
		return this._levelRewardPoints;
	}

	private _levelRewardPointType: number = 0;

	get levelRewardPointType(): number
	{
		return this._levelRewardPointType;
	}

	private _bonusPoints: number = 0;

	get bonusPoints(): number
	{
		return this._bonusPoints;
	}

	private _achievementID: number = 0;

	get achievementID(): number
	{
		return this._achievementID;
	}

	private _removedBadgeCode: string = '';

	get removedBadgeCode(): string
	{
		return this._removedBadgeCode;
	}

	private _category: string = '';

	get category(): string
	{
		return this._category;
	}

	private _showDialogToUser: boolean = false;

	get showDialogToUser(): boolean
	{
		return this._showDialogToUser;
	}
}
