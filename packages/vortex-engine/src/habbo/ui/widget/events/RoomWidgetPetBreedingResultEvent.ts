/**
 * RoomWidgetPetBreedingResultEvent
 *
 * The two offspring records behind BreedPetsResultView.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPetBreedingResultEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';
import type {PetBreedingResultEventData} from './PetBreedingResultEventData';

export class RoomWidgetPetBreedingResultEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetPetBreedingResultEvent.as::PET_BREEDING_RESULT
    public static readonly PET_BREEDING_RESULT: string = 'RWPBRE_PET_BREEDING_RESULT';

    private _resultData: PetBreedingResultEventData;

    private _resultData2: PetBreedingResultEventData;

    // AS3: .../RoomWidgetPetBreedingResultEvent.as::RoomWidgetPetBreedingResultEvent()
    constructor(resultData: PetBreedingResultEventData, resultData2: PetBreedingResultEventData)
    {
        super(RoomWidgetPetBreedingResultEvent.PET_BREEDING_RESULT);

        this._resultData = resultData;
        this._resultData2 = resultData2;
    }

    // AS3: .../RoomWidgetPetBreedingResultEvent.as::get resultData()
    get resultData(): PetBreedingResultEventData
    {
        return this._resultData;
    }

    // AS3: .../RoomWidgetPetBreedingResultEvent.as::get resultData2()
    get resultData2(): PetBreedingResultEventData
    {
        return this._resultData2;
    }
}
