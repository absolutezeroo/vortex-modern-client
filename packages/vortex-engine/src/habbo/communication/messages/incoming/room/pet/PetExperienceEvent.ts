import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetExperienceEventParser} from '@habbo/communication/messages/parser/room/pet/PetExperienceEventParser';

/**
 * A pet gained experience (header 946).
 *
 * The server's field set does not match the AS3's and this message fails **silently** — treat the
 * parser's values as untrustworthy until the emulator is fixed. See PetExperienceEventParser's
 * header for the detail.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/room/pets/PetExperienceEvent.as
 */
export class PetExperienceEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PetExperienceEventParser);
    }
}
