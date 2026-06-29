import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ShowEnforceRoomCategoryDialogEventParser} from '../../parser/roomsettings/ShowEnforceRoomCategoryDialogEventParser';

export class ShowEnforceRoomCategoryDialogEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ShowEnforceRoomCategoryDialogEventParser);
    }
}
