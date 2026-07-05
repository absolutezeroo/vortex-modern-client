import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserFlatCatsMessageParser} from '../../parser/navigator/UserFlatCatsMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/UserFlatCatsEvent.as
 */
export class UserFlatCatsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, UserFlatCatsMessageParser);
    }
}
