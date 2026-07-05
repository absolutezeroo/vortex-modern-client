import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorCollapsedCategoriesMessageParser} from '../../parser/newnavigator';

/**
 * Event for collapsed categories
 *
 * @see source_as_win63/habbo/communication/messages/incoming/newnavigator/NavigatorCollapsedCategoriesMessageEvent.as
 */
export class NavigatorCollapsedCategoriesMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NavigatorCollapsedCategoriesMessageParser);
    }
}
