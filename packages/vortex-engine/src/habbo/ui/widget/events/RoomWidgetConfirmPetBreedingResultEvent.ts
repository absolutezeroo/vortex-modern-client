/**
 * RoomWidgetConfirmPetBreedingResultEvent
 *
 * Whether the confirmed nest was accepted, and if not, why.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetConfirmPetBreedingResultEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetConfirmPetBreedingResultEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetConfirmPetBreedingResultEvent.as::CONFIRM_PET_BREEDING_RESULT
    public static readonly CONFIRM_PET_BREEDING_RESULT: string = 'RWPPBE_CONFIRM_PET_BREEDING_RESULT';

    // AS3: .../RoomWidgetConfirmPetBreedingResultEvent.as::SUCCESS
    public static readonly SUCCESS: number = 0;

    // AS3: .../RoomWidgetConfirmPetBreedingResultEvent.as::NO_NEST_FOUND
    public static readonly NO_NEST_FOUND: number = 1;

    // AS3: .../RoomWidgetConfirmPetBreedingResultEvent.as::PETS_MISSING
    public static readonly PETS_MISSING: number = 2;

    // AS3: .../RoomWidgetConfirmPetBreedingResultEvent.as::INVALID_NAME
    public static readonly INVALID_NAME: number = 3;

    private _breedingNestStuffId: number;

    private _result: number;

    // AS3: .../RoomWidgetConfirmPetBreedingResultEvent.as::RoomWidgetConfirmPetBreedingResultEvent()
    constructor(breedingNestStuffId: number, result: number)
    {
        super(RoomWidgetConfirmPetBreedingResultEvent.CONFIRM_PET_BREEDING_RESULT);

        this._breedingNestStuffId = breedingNestStuffId;
        this._result = result;
    }

    // AS3: .../RoomWidgetConfirmPetBreedingResultEvent.as::get breedingNestStuffId()
    get breedingNestStuffId(): number
    {
        return this._breedingNestStuffId;
    }

    // AS3: .../RoomWidgetConfirmPetBreedingResultEvent.as::get result()
    get result(): number
    {
        return this._result;
    }
}
