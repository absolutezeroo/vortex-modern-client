import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetBreedingResultEventParser} from '@habbo/communication/messages/parser/room/pet/PetBreedingResultEventParser';

/**
 * The outcome of breeding two pets (header 2940).
 *
 * The server sends an entirely different message shape — see PetBreedingResultEventParser's header.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/PetBreedingResultEvent.as
 */
export class PetBreedingResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PetBreedingResultEventParser);
    }
}
