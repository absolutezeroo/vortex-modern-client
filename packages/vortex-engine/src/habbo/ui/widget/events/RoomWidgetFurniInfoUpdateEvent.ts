/**
 * RoomWidgetFurniInfoUpdateEvent
 *
 * @see sources/win63_version/habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent.as
 */
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetFurniInfoUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: sources/win63_version/habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent.as::FURNI
    public static readonly FURNI: string = 'RWFIUE_FURNI';

    public id: number = 0;
    public category: number = 0;
    public name: string = '';
    public description: string = '';
    public image: unknown = null;
    public classId: number = 0;
    public isWallItem: boolean = false;
    public isStickie: boolean = false;
    public isRoomOwner: boolean = false;
    public roomControllerLevel: number = 0;
    public isAnyRoomController: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent.as::_SafeStr_9024
    // AS3 initialises this to -1, not 0 - matches the `event.expiration >= 0` gate on
    // InfoStandFurniView.ts:608, though handleGetFurniInfoMessage() always assigns a real value
    // before emitting, so the default itself is never observed today.
    public expiration: number = -1;
    // AS3 (_SafeStr_9402) initialises this to -1, not 0: 0 reads as "offer id 0 exists"
    // and shows a phantom purchase button; -1 means no offer.
    public purchaseOfferId: number = -1;
    public bcOfferId: number = -1;
    public extraParam: string = '';
    public isOwner: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent.as::get/set tradeable()
    // Write-only in AS3 too - InfoStandWidgetHandler writes it, nothing in ui/ ever reads it back.
    public tradeable: boolean = false;
    public stuffData: IStuffData | null = null;
    public groupId: number = 0;
    public ownerId: number = 0;
    public ownerName: string = '';
    public usagePolicy: number = 0;
    public rentOfferId: number = -1;
    public purchaseCouldBeUsedForBuyout: boolean = false;
    public rentCouldBeUsedForBuyout: boolean = false;
    public availableForBuildersClub: boolean = false;
    public isNft: boolean = false;

    // AS3: sources/win63_version/habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent.as::RoomWidgetFurniInfoUpdateEvent()
    constructor(type: string)
    {
        super(type);
    }
}
