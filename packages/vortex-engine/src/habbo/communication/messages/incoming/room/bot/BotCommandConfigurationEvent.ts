import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BotCommandConfigurationParser} from '@habbo/communication/messages/parser/room/bot/BotCommandConfigurationParser';

/**
 * The stored configuration of one bot skill (header 2463).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2511/_SafeCls_2595.as
 * (obfuscated; subscribed by `BotSkillConfigurationViewBase.open()`).
 */
export class BotCommandConfigurationEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, BotCommandConfigurationParser);
    }
}
