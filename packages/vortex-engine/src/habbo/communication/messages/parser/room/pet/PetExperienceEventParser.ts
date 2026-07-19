import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A pet gained experience — drives the floating "+N" bubble over the pet (header 946).
 *
 * TODO(AS3)/SERVER MISMATCH — this is the one pet message that fails **silently**, so treat any
 * value read here as untrustworthy until the server is fixed. Revision20260701's
 * PetExperienceMessageComposerSerializer writes five ints —
 * `PetId, Experience, ExperienceForNextLevel, Level, MaxLevel` — while the AS3 reads three:
 * `petId, petRoomIndex, gainedExperience`. Only petId lines up. There is enough data on the wire
 * that no read runs off the end, so nothing throws: petRoomIndex silently receives the pet's total
 * Experience and gainedExperience silently receives ExperienceForNextLevel, and the trailing two
 * ints are ignored. Identical in Revision20260112.
 *
 * The AS3 order is kept because it is the real protocol — the fix belongs in the emulator's
 * serializer, not here. See docs/CLIENT-SERVER-ARCHITECTURE.md for the full pet mismatch table.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetExperienceEventParser.as
 */
export class PetExperienceEventParser implements IMessageParser
{
    private _petId: number = 0;

    private _petRoomIndex: number = 0;

    private _gainedExperience: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetExperienceEventParser.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetExperienceEventParser.as::get petRoomIndex()
    get petRoomIndex(): number
    {
        return this._petRoomIndex;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetExperienceEventParser.as::get gainedExperience()
    get gainedExperience(): number
    {
        return this._gainedExperience;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetExperienceEventParser.as::flush()
    flush(): boolean
    {
        this._petId = 0;
        this._petRoomIndex = 0;
        this._gainedExperience = 0;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetExperienceEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._petId = wrapper.readInt();
        this._petRoomIndex = wrapper.readInt();
        this._gainedExperience = wrapper.readInt();

        return true;
    }
}
