import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ChangeEmailResultParser} from '../../parser/users/ChangeEmailResultParser';

/**
 * ChangeEmailResultEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.ChangeEmailResultEvent
 */
export class ChangeEmailResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ChangeEmailResultParser);
    }
}
