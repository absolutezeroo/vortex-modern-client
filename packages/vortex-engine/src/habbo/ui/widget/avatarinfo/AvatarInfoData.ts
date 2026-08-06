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
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get isIgnored()
    public isIgnored: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get canTrade()
    public canTrade: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get canTradeReason()
    public canTradeReason: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get canBeKicked()
    public canBeKicked: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get canBeBanned()
    public canBeBanned: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get canBeMuted()
    public canBeMuted: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get canBeAskedAsFriend()
    public canBeAskedAsFriend: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get amIOwner()
    public amIOwner: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get amIAnyRoomController()
    public amIAnyRoomController: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get respectLeft()
    public respectLeft: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get respectReplenishesLeft()
    public respectReplenishesLeft: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get isOwnUser()
    public isOwnUser: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get allowNameChange()
    public allowNameChange: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get isGuildRoom()
    public isGuildRoom: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get carryItemType()
    public carryItemType: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get myRoomControllerLevel()
    public myRoomControllerLevel: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get targetRoomControllerLevel()
    public targetRoomControllerLevel: number = 0;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get isFriend()
    public isFriend: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get isAmbassador()
    public isAmbassador: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_2798.as::get isBlocked()
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
