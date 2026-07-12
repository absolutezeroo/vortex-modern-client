/**
 * PetVocalMessageEvent
 *
 * Vortex-custom message (not part of the official AS3 client dumps).
 * @see vortex-client/src/com/sulake/habbo/communication/messages/incoming/room/pets/PetVocalMessageEvent.as
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetVocalMessageEventParser} from '@habbo/communication/messages/parser/room/pet/PetVocalMessageEventParser';

export class PetVocalMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PetVocalMessageEventParser);
    }
}
