/**
 * AvatarInfoData — the per-bubble user permission/state struct.
 *
 * AS3 class is obfuscated to `_SafeCls_2798`; real name recovered from the
 * PRODUCTION 2016 tree (`ui/widget/avatarinfo/AvatarInfoData.as`). Populated
 * from a RoomWidgetUserInfoUpdateEvent; the own-avatar bubble reads
 * `isOwnUser`/`allowNameChange`/`myRoomControllerLevel`/`amIOwner`/`carryItemType`.
 * The peer fields are kept (inert here) so the AvatarMenuView slice can reuse it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as
 */
import type {RoomWidgetUserInfoUpdateEvent} from '../events/RoomWidgetUserInfoUpdateEvent';

export class AvatarInfoData
{
    public isIgnored: boolean = false;
    public canTrade: boolean = false;
    public canTradeReason: number = 0;
    public canBeKicked: boolean = false;
    public canBeBanned: boolean = false;
    public canBeMuted: boolean = false;
    public canBeAskedAsFriend: boolean = false;
    public amIOwner: boolean = false;
    public amIAnyRoomController: boolean = false;
    public respectLeft: number = 0;
    public respectReplenishesLeft: number = 0;
    public isOwnUser: boolean = false;
    public allowNameChange: boolean = false;
    public isGuildRoom: boolean = false;
    public carryItemType: number = 0;
    public myRoomControllerLevel: number = 0;
    public targetRoomControllerLevel: number = 0;
    public isFriend: boolean = false;
    public isAmbassador: boolean = false;
    public isBlocked: boolean = false;

    // AS3: _SafeCls_2798.as::populate()
    public populate(event: RoomWidgetUserInfoUpdateEvent): void
    {
        this.amIAnyRoomController = event.amIAnyRoomController;
        this.myRoomControllerLevel = event.myRoomControllerLevel;
        this.amIOwner = event.amIOwner;
        this.canBeAskedAsFriend = event.canBeAskedAsFriend;
        this.canBeKicked = event.canBeKicked;
        this.canBeBanned = event.canBeBanned;
        this.canBeMuted = event.canBeMuted;
        this.canTrade = event.canTrade;
        this.canTradeReason = event.canTradeReason;
        this.isIgnored = event.isIgnored;
        this.respectLeft = event.respectLeft;
        this.respectReplenishesLeft = event.respectReplenishesLeft;
        this.isOwnUser = event.type === 'RWUIUE_OWN_USER';
        this.allowNameChange = event.allowNameChange;
        this.isGuildRoom = event.isGuildRoom;
        this.targetRoomControllerLevel = event.targetRoomControllerLevel;
        this.carryItemType = event.carryItem;
        this.isFriend = event.isFriend;
        this.isAmbassador = event.amIAnAmbassador;
        this.isBlocked = event.isBlocked;
    }
}
