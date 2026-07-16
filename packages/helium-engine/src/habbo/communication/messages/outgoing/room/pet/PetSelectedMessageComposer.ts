import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Tells the server a pet was selected (header 2757) — sent alongside GetPetInfoMessageComposer when
 * the `petSelect.enabled` config is on. Fire-and-forget: it has no reply, the info comes back via
 * PetInfoMessageEvent (3192) in answer to GetPetInfo.
 *
 * Body is a single int (the pet's web id), matching Revision20260701's PetSelectedMessageParser
 * (`PetId = packet.PopInt()`), which is handled by a real PetSelectedMessageHandler.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/pets/PetSelectedMessageComposer.as
 */
export class PetSelectedMessageComposer extends MessageComposer<ConstructorParameters<typeof PetSelectedMessageComposer>>
{
    private _data: ConstructorParameters<typeof PetSelectedMessageComposer>;

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/room/pets/PetSelectedMessageComposer.as::PetSelectedMessageComposer()
    constructor(petId: number)
    {
        super();
        this._data = [petId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/room/pets/PetSelectedMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
