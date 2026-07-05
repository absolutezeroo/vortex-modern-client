import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CategoriesWithVisitorCountMessageParser} from '../../parser/navigator/CategoriesWithVisitorCountMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/CategoriesWithVisitorCountEvent.as
 */
export class CategoriesWithVisitorCountMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CategoriesWithVisitorCountMessageParser);
    }
}
