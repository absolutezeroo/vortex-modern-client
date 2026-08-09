/**
 * RoomWidgetRentableBotInfoUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetRentableBotInfoUpdateEvent.as
 *
 * The click panel's answer for a *rentable* bot — the kind bought from the catalog and placed from
 * the inventory. Distinct from `RoomWidgetUserInfoUpdateEvent.BOT`, which serves the old
 * (non-rentable) bots and carries a user-shaped payload.
 *
 * Every field is a getter/setter pair in AS3, filled in by
 * `InfoStandWidgetHandler.handleGetRentableBotInfoMessage()` after construction; plain properties
 * here preserve that. AS3's trailing `bubbles`/`cancelable` constructor params go with the rest of
 * the Flash Event base — see RoomWidgetUpdateEvent.ts.
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetRentableBotInfoUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::RENTABLE_BOT
    public static readonly RENTABLE_BOT: string = 'RWRBIUE_RENTABLE_BOT';
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::DEFAULT_BOT_BADGE_ID
    public static readonly DEFAULT_BOT_BADGE_ID: string = 'RENTABLE_BOT';

    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set name()
    public name: string = '';
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set motto()
    public motto: string = '';
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set webID()
    public webID: number = 0;
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set figure()
    public figure: string = '';
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set badges()
    public badges: string[] = [];
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set carryItem()
    public carryItem: number = 0;
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set userRoomId()
    public userRoomId: number = 0;
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set ownerId()
    public ownerId: number = 0;
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set ownerName()
    public ownerName: string = '';
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set amIOwner()
    public amIOwner: boolean = false;
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set amIAnyRoomController()
    public amIAnyRoomController: boolean = false;
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set myRoomControllerLevel()
    public myRoomControllerLevel: number = 0;
    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::set botSkills()
    public botSkills: number[] = [];

    // AS3: .../RoomWidgetRentableBotInfoUpdateEvent.as::RoomWidgetRentableBotInfoUpdateEvent()
    constructor()
    {
        super(RoomWidgetRentableBotInfoUpdateEvent.RENTABLE_BOT);
    }
}
