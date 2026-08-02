import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    DailyTasksActiveListMessageEventParser
} from '@habbo/communication/messages/parser/quest/DailyTasksActiveListMessageEventParser';

/**
 * Incoming: the user's currently active daily tasks (header 1824).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2860/_SafeCls_3179.as
 * (class name recovered from
 * sources/win63_version/habbo/communication/messages/incoming/quest/DailyTasksActiveListMessageEvent.as)
 */
export class DailyTasksActiveListMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2860/_SafeCls_3179.as::_SafeCls_3179()
    constructor(callback: MessageEventCallback)
    {
        super(callback, DailyTasksActiveListMessageEventParser);
    }
}
