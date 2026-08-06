import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {JukeboxSongDisksMessageParser} from '@habbo/communication/messages/parser/sound/JukeboxSongDisksMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/sound/JukeboxSongDisksMessageEvent.as
 * (header 2257 from WIN63's registry)
 */
export class JukeboxSongDisksMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, JukeboxSongDisksMessageParser);
    }
}
