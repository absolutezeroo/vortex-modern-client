/**
 * RoomWidgetConfirmPetBreedingEvent
 *
 * The payload behind ConfirmPetBreedingView: which nest, which two parents, the rarity outcomes to
 * choose from, and the pet type the nest will produce.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetConfirmPetBreedingEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';
import type {ConfirmPetBreedingPetData} from './ConfirmPetBreedingPetData';
import type {BreedingRarityCategoryData} from './BreedingRarityCategoryData';

export class RoomWidgetConfirmPetBreedingEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetConfirmPetBreedingEvent.as::CONFIRM_PET_BREEDING
    // The trailing underscore is AS3's own.
    public static readonly CONFIRM_PET_BREEDING: string = 'RWPPBE_CONFIRM_PET_BREEDING_';

    private _nestId: number;

    private _pet1: ConfirmPetBreedingPetData;

    private _pet2: ConfirmPetBreedingPetData;

    private _rarityCategories: BreedingRarityCategoryData[];

    private _resultPetTypeId: number;

    // AS3: .../RoomWidgetConfirmPetBreedingEvent.as::RoomWidgetConfirmPetBreedingEvent()
    constructor(
        nestId: number,
        pet1: ConfirmPetBreedingPetData,
        pet2: ConfirmPetBreedingPetData,
        rarityCategories: BreedingRarityCategoryData[],
        resultPetTypeId: number
    )
    {
        super(RoomWidgetConfirmPetBreedingEvent.CONFIRM_PET_BREEDING);

        this._nestId = nestId;
        this._pet1 = pet1;
        this._pet2 = pet2;
        this._rarityCategories = rarityCategories;
        this._resultPetTypeId = resultPetTypeId;
    }

    // AS3: .../RoomWidgetConfirmPetBreedingEvent.as::get nestId()
    get nestId(): number
    {
        return this._nestId;
    }

    // AS3: .../RoomWidgetConfirmPetBreedingEvent.as::get pet1()
    get pet1(): ConfirmPetBreedingPetData
    {
        return this._pet1;
    }

    // AS3: .../RoomWidgetConfirmPetBreedingEvent.as::get pet2()
    get pet2(): ConfirmPetBreedingPetData
    {
        return this._pet2;
    }

    // AS3: .../RoomWidgetConfirmPetBreedingEvent.as::get rarityCategories()
    get rarityCategories(): BreedingRarityCategoryData[]
    {
        return this._rarityCategories;
    }

    // AS3: .../RoomWidgetConfirmPetBreedingEvent.as::get resultPetTypeId()
    get resultPetTypeId(): number
    {
        return this._resultPetTypeId;
    }
}
