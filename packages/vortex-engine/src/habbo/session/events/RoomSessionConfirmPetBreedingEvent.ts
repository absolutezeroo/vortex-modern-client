import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';
import type {BreedingPetInfo} from '@habbo/communication/messages/incoming/room/pet/BreedingPetInfo';
import type {
    PetBreedingRarityCategory
} from '@habbo/communication/messages/incoming/room/pet/PetBreedingRarityCategory';

/**
 * Room session confirm pet breeding event
 *
 * AS3 types pet1/pet2 as the message's own breeding-pet DTO and rarityCategories as an Array of the
 * rarity DTO; both are typed concretely here rather than left as `unknown`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as
 */
export class RoomSessionConfirmPetBreedingEvent extends RoomSessionEvent
{
    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::CONFIRM_PET_BREEDING
    public static readonly CONFIRM_PET_BREEDING = 'RSPFUE_CONFIRM_PET_BREEDING';

    constructor(session: IRoomSession, nestId: number, pet1: BreedingPetInfo | null, pet2: BreedingPetInfo | null, rarityCategories: PetBreedingRarityCategory[], resultPetTypeId: number)
    {
        super(RoomSessionConfirmPetBreedingEvent.CONFIRM_PET_BREEDING, session);
        this._nestId = nestId;
        this._pet1 = pet1;
        this._pet2 = pet2;
        this._rarityCategories = rarityCategories;
        this._resultPetTypeId = resultPetTypeId;
    }

    private _nestId: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::get nestId()
    get nestId(): number
    {
        return this._nestId;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::_pet1
    private _pet1: BreedingPetInfo | null;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::get pet1()
    get pet1(): BreedingPetInfo | null
    {
        return this._pet1;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::_pet2
    private _pet2: BreedingPetInfo | null;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::get pet2()
    get pet2(): BreedingPetInfo | null
    {
        return this._pet2;
    }

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::_rarityCategories
    private _rarityCategories: PetBreedingRarityCategory[];

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::get rarityCategories()
    get rarityCategories(): PetBreedingRarityCategory[]
    {
        return this._rarityCategories;
    }

    private _resultPetTypeId: number;

    // AS3: .../src/com/sulake/habbo/session/events/RoomSessionConfirmPetBreedingEvent.as::get resultPetTypeId()
    get resultPetTypeId(): number
    {
        return this._resultPetTypeId;
    }
}
