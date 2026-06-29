import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CheckUserNameResultMessageParser} from '../../parser/help/CheckUserNameResultMessageParser';

/**
 * Event for check user name result.
 * Contains the validation result and name suggestions.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/avatar/CheckUserNameResultMessageEvent.as
 */
export class CheckUserNameResultMessageEvent extends MessageEvent implements IMessageEvent
{
	public static readonly NAME_OK: number = 0;
	public static readonly ERROR_NAME_REQUIRED: number = 1;
	public static readonly ERROR_NAME_TOO_SHORT: number = 2;
	public static readonly ERROR_NAME_TOO_LONG: number = 3;
	public static readonly ERROR_NAME_NOT_VALID: number = 4;
	public static readonly ERROR_NAME_IN_USE: number = 5;

	constructor(callback: MessageEventCallback)
	{
		super(callback, CheckUserNameResultMessageParser);
	}
}
