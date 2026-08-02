import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    DailyTasksTasksAddedMessageEventParser
} from '@habbo/communication/messages/parser/quest/DailyTasksTasksAddedMessageEventParser';

/**
 * Incoming: daily tasks added on top of the ones already held (header 2506).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2860/_SafeCls_2859.as
 * (class name recovered from
 * sources/win63_version/habbo/communication/messages/incoming/quest/DailyTasksTasksAddedMessageEvent.as)
 */
export class DailyTasksTasksAddedMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2860/_SafeCls_2859.as::_SafeCls_2859()
    constructor(callback: MessageEventCallback)
    {
        super(callback, DailyTasksTasksAddedMessageEventParser);
    }
}
