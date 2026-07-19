import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ScrSendUserInfoMessageParser} from '../../parser/users/ScrSendUserInfoMessageParser';

/**
 * ScrSendUserInfoEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.ScrSendUserInfoEvent
 */
export class ScrSendUserInfoEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ScrSendUserInfoMessageParser);
    }
}
