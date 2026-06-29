import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * ScrSendUserInfoMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.ScrSendUserInfoEventParser
 * - com.sulake.habbo.communication.messages.parser.users.ScrSendUserInfoMessageParser
 */
export class ScrSendUserInfoMessageParser implements IMessageParser
{
	public static readonly RESPONSE_TYPE_LOGIN = 1;
	public static readonly RESPONSE_TYPE_PURCHASE = 2;
	public static readonly RESPONSE_TYPE_DISCOUNT_AVAILABLE = 3;
	public static readonly RESPONSE_TYPE_CITIZENSHIP_DISCOUNT = 4;

	private _productName: string = '';
	private _daysToPeriodEnd: number = 0;
	private _memberPeriods: number = 0;
	private _periodsSubscribedAhead: number = 0;
	private _responseType: number = 0;
	private _hasEverBeenMember: boolean = false;
	private _isVIP: boolean = false;
	private _pastClubDays: number = 0;
	private _pastVipDays: number = 0;
	private _minutesUntilExpiration: number = 0;
	private _minutesSinceLastModified: number = 0;

	get productName(): string
	{
		return this._productName;
	}

	get daysToPeriodEnd(): number
	{
		return this._daysToPeriodEnd;
	}

	get memberPeriods(): number
	{
		return this._memberPeriods;
	}

	get periodsSubscribedAhead(): number
	{
		return this._periodsSubscribedAhead;
	}

	get responseType(): number
	{
		return this._responseType;
	}

	get hasEverBeenMember(): boolean
	{
		return this._hasEverBeenMember;
	}

	get isVIP(): boolean
	{
		return this._isVIP;
	}

	get pastClubDays(): number
	{
		return this._pastClubDays;
	}

	get pastVipDays(): number
	{
		return this._pastVipDays;
	}

	get minutesUntilExpiration(): number
	{
		return this._minutesUntilExpiration;
	}

	get minutesSinceLastModified(): number
	{
		return this._minutesSinceLastModified;
	}

	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if(!wrapper) return false;

		this._productName = wrapper.readString();
		this._daysToPeriodEnd = wrapper.readInt();
		this._memberPeriods = wrapper.readInt();
		this._periodsSubscribedAhead = wrapper.readInt();
		this._responseType = wrapper.readInt();
		this._hasEverBeenMember = wrapper.readBoolean();
		this._isVIP = wrapper.readBoolean();
		this._pastClubDays = wrapper.readInt();
		this._pastVipDays = wrapper.readInt();
		this._minutesUntilExpiration = wrapper.readInt();

		if(wrapper.bytesAvailable > 0)
		{
			this._minutesSinceLastModified = wrapper.readInt();
		}

		return true;
	}
}
