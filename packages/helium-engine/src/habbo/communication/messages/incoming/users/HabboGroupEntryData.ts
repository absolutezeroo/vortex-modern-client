import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * HabboGroupEntryData
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.incoming.users.class_1745
 * - com.sulake.habbo.communication.messages.incoming.users.HabboGroupEntryData
 */
export class HabboGroupEntryData
{
	private _groupId: number;
	private _groupName: string;
	private _badgeCode: string;
	private _primaryColor: string;
	private _secondaryColor: string;
	private _favourite: boolean;
	private _ownerId: number;
	private _hasForum: boolean;

	constructor(wrapper: IMessageDataWrapper)
	{
		this._groupId = wrapper.readInt();
		this._groupName = wrapper.readString();
		this._badgeCode = wrapper.readString();
		this._primaryColor = wrapper.readString();
		this._secondaryColor = wrapper.readString();
		this._favourite = wrapper.readBoolean();
		this._ownerId = wrapper.readInt();
		this._hasForum = wrapper.readBoolean();
	}

	get groupId(): number
	{
		return this._groupId;
	}

	get groupName(): string
	{
		return this._groupName;
	}

	get badgeCode(): string
	{
		return this._badgeCode;
	}

	get primaryColor(): string
	{
		return this._primaryColor;
	}

	get secondaryColor(): string
	{
		return this._secondaryColor;
	}

	get favourite(): boolean
	{
		return this._favourite;
	}

	get ownerId(): number
	{
		return this._ownerId;
	}

	get hasForum(): boolean
	{
		return this._hasForum;
	}
}
