import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IgnoreResultMessageParser} from '../../parser/users/IgnoreResultMessageParser';

/**
 * Event for ignore/unignore result.
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.IgnoreResultMessageEvent
 */
export class IgnoreResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IgnoreResultMessageParser);
    }

    get result(): number
    {
        return (this._parser as IgnoreResultMessageParser).result;
    }

    get userId(): number
    {
        return (this._parser as IgnoreResultMessageParser).ignoredUserId;
    }
}
