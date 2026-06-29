import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {HabboGroupEntryData} from './HabboGroupEntryData';

/**
 * ExtendedProfileData
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.incoming.users.class_1581
 * - com.sulake.habbo.communication.messages.incoming.users.ExtendedProfileData
 */
export class ExtendedProfileData
{
	private _userId: number;
	private _userName: string;
	private _figure: string;
	private _motto: string;
	private _creationDate: string;
	private _achievementScore: number;
	private _friendCount: number;
	private _isFriend: boolean;
	private _isFriendRequestSent: boolean;
	private _isOnline: boolean;
	private _guilds: HabboGroupEntryData[] = [];
	private _lastAccessSinceInSeconds: number;
	private _openProfileWindow: boolean;
	private _accountLevel: number = 0;
	private _starGemCount: number = 0;
	private _unknownBoolean1: boolean = false;
	private _unknownInt1: number = 0;
	private _unknownBoolean2: boolean = false;
	private _unknownBoolean3: boolean = false;

	constructor(wrapper: IMessageDataWrapper)
	{
		this._userId = wrapper.readInt();
		this._userName = wrapper.readString();
		this._figure = wrapper.readString();
		this._motto = wrapper.readString();
		this._creationDate = wrapper.readString();
		this._achievementScore = wrapper.readInt();
		this._friendCount = wrapper.readInt();
		this._isFriend = wrapper.readBoolean();
		this._isFriendRequestSent = wrapper.readBoolean();
		this._isOnline = wrapper.readBoolean();

		const guildCount = wrapper.readInt();

		for(let i = 0; i < guildCount; i++)
		{
			this._guilds.push(new HabboGroupEntryData(wrapper));
		}

		this._lastAccessSinceInSeconds = wrapper.readInt();
		this._openProfileWindow = wrapper.readBoolean();

		if(wrapper.bytesAvailable > 0)
		{
			this._unknownBoolean1 = wrapper.readBoolean();
			this._accountLevel = wrapper.readInt();
			this._unknownInt1 = wrapper.readInt();
			this._starGemCount = wrapper.readInt();
			this._unknownBoolean2 = wrapper.readBoolean();
			this._unknownBoolean3 = wrapper.readBoolean();
		}
	}

	get userId(): number
	{
		return this._userId;
	}

	get userName(): string
	{
		return this._userName;
	}

	get figure(): string
	{
		return this._figure;
	}

	get motto(): string
	{
		return this._motto;
	}

	get creationDate(): string
	{
		return this._creationDate;
	}

	get achievementScore(): number
	{
		return this._achievementScore;
	}

	get friendCount(): number
	{
		return this._friendCount;
	}

	get isFriend(): boolean
	{
		return this._isFriend;
	}

	get isFriendRequestSent(): boolean
	{
		return this._isFriendRequestSent;
	}

	set isFriendRequestSent(value: boolean)
	{
		this._isFriendRequestSent = value;
	}

	get isOnline(): boolean
	{
		return this._isOnline;
	}

	get guilds(): HabboGroupEntryData[]
	{
		return this._guilds;
	}

	get lastAccessSinceInSeconds(): number
	{
		return this._lastAccessSinceInSeconds;
	}

	get openProfileWindow(): boolean
	{
		return this._openProfileWindow;
	}

	get accountLevel(): number
	{
		return this._accountLevel;
	}

	get starGemCount(): number
	{
		return this._starGemCount;
	}
}
