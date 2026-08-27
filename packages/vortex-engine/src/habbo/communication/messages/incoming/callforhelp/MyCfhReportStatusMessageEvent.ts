import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    MyCfhReportStatusMessageEventParser
} from '../../parser/callforhelp/MyCfhReportStatusMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/callforhelp/MyCfhReportStatusMessageEvent.as
 */
export class MyCfhReportStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MyCfhReportStatusMessageEventParser);
    }
}
