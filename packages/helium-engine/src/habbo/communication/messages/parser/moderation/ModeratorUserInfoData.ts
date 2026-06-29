import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class containing detailed user information for moderators.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/class_1670.as
 */
export class ModeratorUserInfoData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._userId = wrapper.readInt();
		this._userName = wrapper.readString();
		this._figure = wrapper.readString();
		this._registrationAgeInMinutes = wrapper.readInt();
		this._minutesSinceLastLogin = wrapper.readInt();
		this._online = wrapper.readBoolean();
		this._cfhCount = wrapper.readInt();
		this._abusiveCfhCount = wrapper.readInt();
		this._cautionCount = wrapper.readInt();
		this._banCount = wrapper.readInt();
		this._tradingLockCount = wrapper.readInt();
		this._tradingExpiryDate = wrapper.readString();
		this._lastPurchaseDate = wrapper.readString();
		this._identityId = wrapper.readInt();
		this._identityRelatedBanCount = wrapper.readInt();
		this._primaryEmailAddress = wrapper.readString();
		this._userClassification = wrapper.readString();

		if (wrapper.bytesAvailable > 0)
		{
			this._lastSanctionTime = wrapper.readString();
			this._sanctionAgeHours = wrapper.readInt();
		}
	}

	private _userId: number;

	get userId(): number
	{
		return this._userId;
	}

	private _userName: string;

	get userName(): string
	{
		return this._userName;
	}

	private _figure: string;

	get figure(): string
	{
		return this._figure;
	}

	private _registrationAgeInMinutes: number;

	get registrationAgeInMinutes(): number
	{
		return this._registrationAgeInMinutes;
	}

	private _minutesSinceLastLogin: number;

	get minutesSinceLastLogin(): number
	{
		return this._minutesSinceLastLogin;
	}

	private _online: boolean;

	get online(): boolean
	{
		return this._online;
	}

	private _cfhCount: number;

	get cfhCount(): number
	{
		return this._cfhCount;
	}

	private _abusiveCfhCount: number;

	get abusiveCfhCount(): number
	{
		return this._abusiveCfhCount;
	}

	private _cautionCount: number;

	get cautionCount(): number
	{
		return this._cautionCount;
	}

	private _banCount: number;

	get banCount(): number
	{
		return this._banCount;
	}

	private _tradingLockCount: number;

	get tradingLockCount(): number
	{
		return this._tradingLockCount;
	}

	private _tradingExpiryDate: string;

	get tradingExpiryDate(): string
	{
		return this._tradingExpiryDate;
	}

	private _lastPurchaseDate: string;

	get lastPurchaseDate(): string
	{
		return this._lastPurchaseDate;
	}

	private _identityId: number;

	get identityId(): number
	{
		return this._identityId;
	}

	private _identityRelatedBanCount: number;

	get identityRelatedBanCount(): number
	{
		return this._identityRelatedBanCount;
	}

	private _primaryEmailAddress: string;

	get primaryEmailAddress(): string
	{
		return this._primaryEmailAddress;
	}

	private _userClassification: string;

	get userClassification(): string
	{
		return this._userClassification;
	}

	private _lastSanctionTime: string = '';

	get lastSanctionTime(): string
	{
		return this._lastSanctionTime;
	}

	private _sanctionAgeHours: number = 0;

	get sanctionAgeHours(): number
	{
		return this._sanctionAgeHours;
	}
}
