import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    DailyTasksTaskUpdateMessageEventParser
} from '@habbo/communication/messages/parser/quest/DailyTasksTaskUpdateMessageEventParser';

/**
 * Incoming: progress/status change on one daily task (header 1065).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2860/_SafeCls_3449.as
 * (class name recovered from
 * sources/win63_version/habbo/communication/messages/incoming/quest/DailyTasksTaskUpdateMessageEvent.as)
 */
export class DailyTasksTaskUpdateMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2860/_SafeCls_3449.as::_SafeCls_3449()
    constructor(callback: MessageEventCallback)
    {
        super(callback, DailyTasksTaskUpdateMessageEventParser);
    }
}
