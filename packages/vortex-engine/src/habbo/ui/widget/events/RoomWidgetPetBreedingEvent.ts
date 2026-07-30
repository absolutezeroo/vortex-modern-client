/**
 * RoomWidgetPetBreedingEvent
 *
 * Progress of a breeding negotiation, on its way to AvatarInfoWidget's BreedPetView.
 *
 * AS3 takes no payload in the constructor: the three fields are getter/setter pairs the handler
 * fills in afterwards, which is why they are plain mutable properties here.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPetBreedingEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetPetBreedingEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetPetBreedingEvent.as::_SafeStr_11365
    // Name derived: obfuscated in every tree, and the value matches BreedPetsMessageComposer's
    // "request" state (0). AS3 declares the four in value order 0..3.
    public static readonly TYPE_START: number = 0;

    // AS3: .../RoomWidgetPetBreedingEvent.as::_SafeStr_11263
    // Name derived, see TYPE_START.
    public static readonly TYPE_CANCEL: number = 1;

    // AS3: .../RoomWidgetPetBreedingEvent.as::TYPE_ACCEPT
    public static readonly TYPE_ACCEPT: number = 2;

    // AS3: .../RoomWidgetPetBreedingEvent.as::TYPE_REQUEST
    public static readonly TYPE_REQUEST: number = 3;

    // AS3: .../RoomWidgetPetBreedingEvent.as::PET_BREEDING
    // The trailing underscore is AS3's own.
    public static readonly PET_BREEDING: string = 'RWPPBE_PET_BREEDING_';

    // AS3: .../RoomWidgetPetBreedingEvent.as::get state()/set state()
    public state: number = 0;

    // AS3: .../RoomWidgetPetBreedingEvent.as::get ownPetId()/set ownPetId()
    public ownPetId: number = 0;

    // AS3: .../RoomWidgetPetBreedingEvent.as::get otherPetId()/set otherPetId()
    public otherPetId: number = 0;

    // AS3: .../RoomWidgetPetBreedingEvent.as::RoomWidgetPetBreedingEvent()
    constructor()
    {
        super(RoomWidgetPetBreedingEvent.PET_BREEDING);
    }
}
