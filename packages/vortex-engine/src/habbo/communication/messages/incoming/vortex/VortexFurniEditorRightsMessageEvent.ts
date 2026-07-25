import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    VortexFurniEditorRightsMessageParser
} from '@habbo/communication/messages/parser/vortex/VortexFurniEditorRightsMessageParser';

/**
 * NOT ported from AS3 — Vortex-only staff tool. See the parser for the wire contract.
 */
export class VortexFurniEditorRightsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFurniEditorRightsMessageParser);
    }
}
