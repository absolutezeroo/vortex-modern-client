/**
 * InfoStandWidgetHandler
 *
 * @see sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as
 *
 * Covers furni info (category 10/20) and user/bot identity info (category 100,
 * Phase 1 scope — see handleGetUserInfoMessage()'s header for what's deferred:
 * moderation, trade, group badge, respect, the selected-badges round-trip).
 * `getWidgetMessages()` returns the full AS3 message-type list (so `RoomDesktop`
 * registers this handler for all of them, matching AS3 structure exactly), but
 * `processWidgetMessage()` only implements the furni/user/bot-relevant cases.
 * Every other case is a documented `TODO(AS3)` — no case from `getWidgetMessages()`
 * is silently dropped from the switch.
 */
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Logger} from '@core/utils/Logger';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {StuffDataFactory} from '@habbo/room/object/data/StuffDataFactory';
import {
    HabboGroupDetailsMessageEvent
} from '@habbo/communication/messages/incoming/users/HabboGroupDetailsMessageEvent';
import {
    GetHabboGroupDetailsMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetHabboGroupDetailsMessageComposer';
import {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import {RoomWidgetRoomObjectMessage} from '@habbo/ui/widget/messages/RoomWidgetRoomObjectMessage';
import {RoomWidgetFurniActionMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniActionMessage';
import {RoomWidgetGetBadgeDetailsMessage} from '@habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage';
import {RoomWidgetOpenProfileMessage} from '@habbo/ui/widget/messages/RoomWidgetOpenProfileMessage';
import {
    GetExtendedProfileMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {RoomWidgetFurniInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent';
import {RoomWidgetUserInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent';
import {RoomWidgetInfostandExtraParamEnum} from '@habbo/ui/widget/enums/RoomWidgetInfostandExtraParamEnum';
import {Vector3d} from '@room/utils/Vector3d';
import type {IUserData} from '@habbo/session/IUserData';
import type {InfoStandWidget} from '@habbo/ui/widget/infostand/InfoStandWidget';

const log = Logger.getLogger('InfoStandWidgetHandler');

// Every message type from getWidgetMessages() that processWidgetMessage() doesn't
// yet implement — kept as one list so the switch's default branch can log which
// unimplemented AS3 case fired, instead of a silent no-op.
const UNIMPLEMENTED_WIDGET_MESSAGES = new Set<string>([
    'RWUAM_SEND_FRIEND_REQUEST', 'RWUAM_RESPECT_USER', 'RWUAM_REPLENISH_RESPECT_USER',
    'RWUAM_OPEN_PROFILE', ' RWUAM_RESPECT_PET', 'RWUAM_WHISPER_USER', 'RWUAM_IGNORE_USER',
    'RWUAM_UNIGNORE_USER', 'RWUAM_KICK_USER', 'RWUAM_BAN_USER_DAY', 'RWUAM_BAN_USER_HOUR',
    'RWUAM_BAN_USER_PERM', 'RWUAM_MUTE_USER_2MIN', 'RWUAM_MUTE_USER_5MIN', 'RWUAM_MUTE_USER_10MIN',
    'RWUAM_GIVE_RIGHTS', 'RWUAM_TAKE_RIGHTS', 'RWUAM_START_TRADING', 'RWUAM_OPEN_HOME_PAGE',
    'RWUAM_PASS_CARRY_ITEM', 'RWUAM_GIVE_CARRY_ITEM_TO_PET', 'RWUAM_DROP_CARRY_ITEM',
    'RWUAM_WIRED_INSPECT_BOT', 'RWUAM_WIRED_INSPECT_PET', 'RWRTSM_ROOM_TAG_SEARCH',
    'RWGOI_MESSAGE_GET_BADGE_IMAGE', 'RWUAM_REPORT', 'RWUAM_PICKUP_PET', 'RWUAM_MOUNT_PET',
    'RWUAM_TOGGLE_PET_RIDING_PERMISSION', 'RWUAM_TOGGLE_PET_BREEDING_PERMISSION', 'RWUAM_DISMOUNT_PET',
    'RWUAM_SADDLE_OFF', 'RWUAM_TRAIN_PET', 'RWPCM_PET_COMMAND', 'RWPCM_REQUEST_PET_COMMANDS',
    'RWUAM_REQUEST_PET_UPDATE', 'RWVM_CHANGE_MOTTO_MESSAGE',
    'RWPOM_OPEN_PRESENT', 'RWUAM_GIVE_LIGHT_TO_PET', 'RWUAM_GIVE_WATER_TO_PET', 'RWUAM_TREAT_PET',
    'RWUAM_REPORT_CFH_OTHER', 'RWUAM_AMBASSADOR_ALERT_USER', 'RWUAM_AMBASSADOR_KICK_USER',
    'RWUAM_AMBASSADOR_MUTE_2MIN', 'RWUAM_AMBASSADOR_MUTE_10MIN', 'RWUAM_AMBASSADOR_MUTE_15MIN',
    'RWUAM_AMBASSADOR_MUTE_60MIN', 'RWUAM_AMBASSADOR_MUTE_18HOUR', 'RWUAM_AMBASSADOR_MUTE_36HOUR',
    'RWUAM_AMBASSADOR_MUTE_72HOUR', 'RWUAM_AMBASSADOR_UNMUTE',
]);

export class InfoStandWidgetHandler implements IRoomWidgetHandler, IGetImageListener 
{
    private _groupDetailsEvent: IMessageEvent | null = null;
    private readonly _pendingImageRequests: Map<number, {
        furniId: number;
        category: number;
        roomId: number;
        scale: number
    }> = new Map();

    // onSongInfoReceivedEvent — deferred with the jukebox/song-disk views (both stubs).
    constructor(_musicController: unknown = null) 
    {
    }

    private _disposed: boolean = false;

    public get disposed(): boolean 
    {
        return this._disposed;
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::InfoStandWidgetHandler()
    // TODO(AS3): constructor takes the jukebox/music controller for onNowPlayingChanged /

    private _container: IRoomWidgetHandlerContainer | null = null;

    public get container(): IRoomWidgetHandlerContainer | null 
    {
        return this._container;
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null) 
    {
        if(this._container?.connection && this._groupDetailsEvent) 
        {
            this._container.connection.removeMessageEvent(this._groupDetailsEvent);
            this._groupDetailsEvent.dispose();
            this._groupDetailsEvent = null;
        }

        this._container = value;

        if(!value) return;

        if(value.connection) 
        {
            this._groupDetailsEvent = new HabboGroupDetailsMessageEvent(this.onGroupDetails);
            value.connection.addMessageEvent(this._groupDetailsEvent);
        }
    }

    private _widget: InfoStandWidget | null = null;

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::set widget()
    public set widget(widget: InfoStandWidget | null) 
    {
        this._widget = widget;
    }

    // TODO(AS3): InfoStandWidgetHandler.as — see updateUserData() in InfoStandWidget.ts

    public get type(): string 
    {
        return 'RWE_INFOSTAND';
    }

    // (dead code path while the user view is a stub).
    public get isActivityDisplayEnabled(): boolean 
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::dispose()
    public dispose(): void 
    {
        if(this._disposed) return;

        this._pendingImageRequests.clear();
        this.container = null;
        this._disposed = true;
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[] 
    {
        return [
            RoomWidgetRoomObjectMessage.GET_OBJECT_INFO,
            RoomWidgetRoomObjectMessage.GET_OBJECT_NAME,
            'RWUAM_SEND_FRIEND_REQUEST', 'RWUAM_RESPECT_USER', 'RWUAM_REPLENISH_RESPECT_USER',
            'RWUAM_WIRED_INSPECT', 'RWUAM_WIRED_INSPECT_PET', 'RWUAM_WIRED_INSPECT_BOT',
            'RWUAM_OPEN_PROFILE', 'RWUAM_WHISPER_USER', 'RWUAM_IGNORE_USER', 'RWUAM_UNIGNORE_USER',
            'RWUAM_KICK_USER', 'RWUAM_BAN_USER_DAY', 'RWUAM_BAN_USER_HOUR', 'RWUAM_BAN_USER_PERM',
            'RWUAM_MUTE_USER_2MIN', 'RWUAM_MUTE_USER_5MIN', 'RWUAM_MUTE_USER_10MIN',
            'RWUAM_GIVE_RIGHTS', 'RWUAM_TAKE_RIGHTS', 'RWUAM_START_TRADING', 'RWUAM_OPEN_HOME_PAGE',
            'RWUAM_PASS_CARRY_ITEM', 'RWUAM_GIVE_CARRY_ITEM_TO_PET', 'RWUAM_DROP_CARRY_ITEM',
            RoomWidgetFurniActionMessage.MOVE, RoomWidgetFurniActionMessage.ROTATE,
            RoomWidgetFurniActionMessage.PICKUP, RoomWidgetFurniActionMessage.EJECT,
            RoomWidgetFurniActionMessage.USE, RoomWidgetFurniActionMessage.SAVE_STUFF_DATA,
            RoomWidgetFurniActionMessage.WIRED_INSPECT,
            'RWRTSM_ROOM_TAG_SEARCH', RoomWidgetGetBadgeDetailsMessage.WIDGET_MESSAGE_GET_BADGE_DETAILS,
            'RWGOI_MESSAGE_GET_BADGE_IMAGE', 'RWUAM_REPORT', 'RWUAM_PICKUP_PET', 'RWUAM_MOUNT_PET',
            'RWUAM_TOGGLE_PET_RIDING_PERMISSION', 'RWUAM_TOGGLE_PET_BREEDING_PERMISSION',
            'RWUAM_DISMOUNT_PET', 'RWUAM_SADDLE_OFF', 'RWUAM_TRAIN_PET',
            'RWPCM_PET_COMMAND', 'RWPCM_REQUEST_PET_COMMANDS', ' RWUAM_RESPECT_PET',
            'RWUAM_REQUEST_PET_UPDATE', 'RWVM_CHANGE_MOTTO_MESSAGE', 'RWOPEM_OPEN_USER_PROFILE',
            'RWPOM_OPEN_PRESENT', 'RWUAM_GIVE_LIGHT_TO_PET', 'RWUAM_GIVE_WATER_TO_PET',
            'RWUAM_TREAT_PET', 'RWUAM_REPORT_CFH_OTHER', 'RWUAM_AMBASSADOR_ALERT_USER',
            'RWUAM_AMBASSADOR_KICK_USER', 'RWUAM_AMBASSADOR_MUTE_2MIN', 'RWUAM_AMBASSADOR_MUTE_10MIN',
            'RWUAM_AMBASSADOR_MUTE_15MIN', 'RWUAM_AMBASSADOR_MUTE_60MIN', 'RWUAM_AMBASSADOR_MUTE_18HOUR',
            'RWUAM_AMBASSADOR_MUTE_36HOUR', 'RWUAM_AMBASSADOR_MUTE_72HOUR', 'RWUAM_AMBASSADOR_UNMUTE',
        ];
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown 
    {
        if(!(message instanceof RoomWidgetMessage) || !this._container) return null;

        if(message instanceof RoomWidgetRoomObjectMessage && message.type === RoomWidgetRoomObjectMessage.GET_OBJECT_INFO) 
        {
            this.handleGetObjectInfoMessage(message);

            return null;
        }

        if(message instanceof RoomWidgetRoomObjectMessage && message.type === RoomWidgetRoomObjectMessage.GET_OBJECT_NAME) 
        {
            this.handleGetObjectNameMessage(message);

            return null;
        }

        if(message instanceof RoomWidgetFurniActionMessage) 
        {
            this.processFurniActionMessage(message);

            return null;
        }

        if(message instanceof RoomWidgetGetBadgeDetailsMessage) 
        {
            this._container.habboGroupsManager?.showGroupBadgeInfo(message.own, message.groupId);

            return null;
        }

        if(message instanceof RoomWidgetOpenProfileMessage && message.type === RoomWidgetOpenProfileMessage.OPEN_USER_PROFILE) 
        {
            this.handleOpenProfileMessage(message);

            return null;
        }

        if(UNIMPLEMENTED_WIDGET_MESSAGES.has(message.type)) 
        {
            log.debug(`TODO(AS3): unimplemented widget message ${message.type}`);
        }

        return null;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IGetImageListener.as::imageReady()
    public imageReady(id: number, data: ImageBitmap | null): void 
    {
        const pending = this._pendingImageRequests.get(id);

        this._pendingImageRequests.delete(id);

        if(!pending || !this._widget || this._widget.furniData.id !== pending.furniId) return;

        if(pending.scale === 64 && (!data || data.width > 140 || data.height > 200)) 
        {
            this.retryFurniImageAtScaleOne(pending);

            return;
        }

        this._widget.furniView.furniImage = data;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IGetImageListener.as::imageFailed()
    public imageFailed(id: number): void 
    {
        const pending = this._pendingImageRequests.get(id);

        this._pendingImageRequests.delete(id);

        if(pending && pending.scale === 64 && this._widget && this._widget.furniData.id === pending.furniId) 
        {
            this.retryFurniImageAtScaleOne(pending);
        }
    }

    // same ad-furni branding feature as RWFAM_SAVE_STUFF_DATA above.
    public setObjectData(_data: Map<string, string>): void 
    {
        log.debug('TODO(AS3): setObjectData not wired yet');
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetObjectNameMessage()
    // TODO(AS3): category 100 (user) branch dispatches RoomWidgetRoomObjectNameEvent —

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[] 
    {
        return ['RSUBE_BADGES'];
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::processEvent()
    public processEvent(event: { type: string; userId: number; badges: string[] }): void 
    {
        if(event.type === 'RSUBE_BADGES' && this._widget) 
        {
            this._widget.refreshBadges(event.userId, event.badges);
        }
    }

    // deferred with the pet view (stub).
    public update(): void 
    {
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::onGroupDetails()
    private onGroupDetails = (event: IMessageEvent): void => 
    {
        const data = (event as HabboGroupDetailsMessageEvent).data;

        if(!data || !this._widget || this._widget.furniData.groupId !== data.groupId) return;

        this._widget.furniView.groupBadgeId = data.badgeCode;
        this._widget.furniView.groupName = data.groupName;
    };

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::processWidgetMessage() (RWFAM_* cases)
    private processFurniActionMessage(message: RoomWidgetFurniActionMessage): void 
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        switch(message.type) 
        {
            case RoomWidgetFurniActionMessage.ROTATE:
                container.roomEngine.modifyRoomObject(message.furniId, message.furniCategory, 'OBJECT_ROTATE_POSITIVE');
                break;
            case RoomWidgetFurniActionMessage.MOVE:
                container.roomEngine.modifyRoomObject(message.furniId, message.furniCategory, 'OBJECT_MOVE');
                break;
            case RoomWidgetFurniActionMessage.PICKUP:
                this.pickupObjectWithConfirmation(message.furniId, message.furniCategory);
                break;
            case RoomWidgetFurniActionMessage.EJECT:
                container.roomEngine.modifyRoomObject(message.furniId, message.furniCategory, 'OBJECT_EJECT');
                break;
            case RoomWidgetFurniActionMessage.USE:
                container.roomEngine.useRoomObjectInActiveRoom(message.furniId, message.furniCategory);
                break;
            case RoomWidgetFurniActionMessage.WIRED_INSPECT:
                // TODO(AS3): opens the wired-inspection menu via a room-engine link event;
                // IRoomEngine doesn't expose a link-event/context accessor yet.
                log.debug('TODO(AS3): RWFAM_WIRED_INSPECT not wired yet');
                break;
            case RoomWidgetFurniActionMessage.SAVE_STUFF_DATA:
                // TODO(AS3): ad-furni branding save — needs SetObjectDataMessageComposer,
                // which doesn't exist yet. Low value without the branding widget itself.
                log.debug('TODO(AS3): RWFAM_SAVE_STUFF_DATA not wired yet');
                break;
        }
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::pickupObjectWithConfirmation()
    private pickupObjectWithConfirmation(furniId: number, furniCategory: number): void 
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        // TODO(AS3): the Builder's Club "not in warehouse" confirmation dialog branch
        // (isBuilderClubId + buildersClubEnabled + availableForBuildersClub check) is
        // deferred — falls through to a direct pickup, matching the non-BC AS3 path.
        container.roomEngine.modifyRoomObject(furniId, furniCategory, 'OBJECT_PICKUP');
    }

    // not ported (user view is a stub).
    private handleGetObjectNameMessage(_message: RoomWidgetRoomObjectMessage): void 
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetFurniInfoMessage() (image portion)
    // Renders the *live placed object* (real colors/extras/state, read straight off the room
    // object's own model) via RoomEngine.getRoomObjectImage() at scale 64 - matches AS3's first
    // attempt. AS3 reads the result synchronously and re-requests at scale 1 if the image is
    // null or larger than the panel's 140x200 slot; ImageBitmap conversion is always async in
    // the browser (see ImageResult.ts), so that same fallback check happens in imageReady()/

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetObjectInfoMessage()
    private handleGetObjectInfoMessage(message: RoomWidgetRoomObjectMessage): void 
    {
        const roomId = this._container?.roomSession.roomId;

        if(roomId === undefined) return;

        switch(message.category) 
        {
            case 10:
            case 20:
                this.handleGetFurniInfoMessage(message, roomId);
                break;
            case 100:
                this.handleGetUserObjectInfoMessage(message, roomId);
                break;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetFurniInfoMessage()

    /**
     * AS3's category-100 branch of handleGetObjectInfoMessage(): looks up the
     * clicked room object's user data and dispatches to the user/pet/bot/
     * rentable-bot handler by type.
     *
     * Phase 1 scope (identity only): user + bot are ported. Pet routes through
     * a separate composer/request flow (handleGetPetInfoMessage(), deferred
     * with the pet view — InfoStandPetView.ts is also a stub). Rentable bot is
     * deferred too — its AS3 event (RoomWidgetRentableBotInfoUpdateEvent) has
     * no TS port yet.
     */
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetObjectInfoMessage() (case 100)
    private handleGetUserObjectInfoMessage(message: RoomWidgetRoomObjectMessage, roomId: number): void 
    {
        const container = this._container;

        if(!container?.roomSession || !container.sessionDataManager || !container.roomEngine) return;

        const userData = container.roomSession.userDataManager.getUserDataByIndex(message.id);

        if(!userData) return;

        switch(userData.type) 
        {
            case 1:
                this.handleGetUserInfoMessage(roomId, message.id, message.category, userData);
                break;
            case 3:
                this.handleGetBotInfoMessage(roomId, message.id, message.category, userData);
                break;
            case 2:
                // TODO(AS3): handleGetPetInfoMessage() — sends a pet-select composer and
                // requestPetInfo(); deferred with the pet view (InfoStandPetView.ts stub).
                break;
            case 4:
                // TODO(AS3): handleGetRentableBotInfoMessage() — needs a
                // RoomWidgetRentableBotInfoUpdateEvent port, not created yet.
                break;
        }

        // TODO(AS3): container.userDefinedRoomEvents.userSelected(message.id) —
        // IHabboUserDefinedRoomEvents has no concrete implementation yet (always
        // null on the container), so this is a no-op either way right now.
        container.userDefinedRoomEvents?.userSelected(message.id);
    }

    /**
     * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetUserInfoMessage()
     *
     * Phase 1 (identity only) — deferred, matching the AS3 method lines ~891-967:
     * canBeMuted/canBeKicked/canBeBanned (moderation permission checks, needs
     * IRoomSession.roomModerationSettings), canTrade/canTradeReason (trade
     * eligibility), groupId/groupBadgeId/groupName, respectLeft/
     * respectReplenishesLeft, isIgnored, targetRoomControllerLevel (from the
     * room object's figure_flat_control model number). Badges use the existing
     * synchronous userDataManager.getUserBadges() instead of AS3's separate
     * requestUserSelectedBadges()/getUserSelectedBadges() network round-trip.
     * habboGroupsManager.updateVisibleExtendedProfile() and the trailing
     * composer send are deferred with the group/respect fields.
     */
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetUserInfoMessage()
    private handleGetUserInfoMessage(roomId: number, roomIndex: number, category: number, userData: IUserData): void 
    {
        const container = this._container;

        if(!container?.sessionDataManager || !container.roomEngine) return;

        const isOwnUser = userData.webID === container.sessionDataManager.userId;
        const event = new RoomWidgetUserInfoUpdateEvent(
            isOwnUser ? RoomWidgetUserInfoUpdateEvent.OWN_USER : RoomWidgetUserInfoUpdateEvent.PEER
        );

        event.isSpectatorMode = container.roomSession.isSpectatorMode;
        event.name = userData.name;
        event.motto = userData.custom;

        if(this.isActivityDisplayEnabled) 
        {
            event.achievementScore = userData.achievementScore;
        }

        event.webID = userData.webID;
        event.userRoomId = roomIndex;
        event.userType = 1;

        const object = container.roomEngine.getRoomObject(roomId, roomIndex, category);

        if(object) 
        {
            event.carryItem = object.getModel().getNumber(RoomObjectVariableEnum.AVATAR_CARRY_OBJECT);
        }

        if(isOwnUser) 
        {
            event.realName = container.sessionDataManager.realName;
            event.allowNameChange = container.sessionDataManager.nameChangeAllowed;
        }

        event.amIOwner = container.roomSession.isRoomOwner;
        event.isGuildRoom = container.roomSession.isGuildRoom;
        event.myRoomControllerLevel = container.roomSession.roomControllerLevel;
        event.amIAnyRoomController = container.sessionDataManager.isAnyRoomController;
        event.amIAnAmbassador = container.sessionDataManager.isAmbassador;

        if(!isOwnUser) 
        {
            event.isBlocked = container.sessionDataManager.isBlocked(userData.webID);
            event.canBeAskedAsFriend = container.friendList?.canBeAskedForAFriend(userData.webID) ?? false;

            const friend = container.friendList?.getFriendById(userData.webID) ?? null;

            if(friend) 
            {
                event.realName = friend.realName;
                event.isFriend = true;
            }
        }

        event.badges = container.roomSession.userDataManager.getUserBadges(userData.webID);
        event.figure = userData.figure;

        container.desktopEvents.emit(event.type, event);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetBotInfoMessage()
    private handleGetBotInfoMessage(roomId: number, roomIndex: number, category: number, userData: IUserData): void 
    {
        const container = this._container;

        if(!container?.sessionDataManager || !container.roomEngine) return;

        const event = new RoomWidgetUserInfoUpdateEvent(RoomWidgetUserInfoUpdateEvent.BOT);

        event.name = userData.name;
        event.motto = userData.custom;
        event.webID = userData.webID;
        event.userRoomId = roomIndex;
        event.userType = userData.type;

        const object = container.roomEngine.getRoomObject(roomId, roomIndex, category);

        if(object) 
        {
            event.carryItem = object.getModel().getNumber(RoomObjectVariableEnum.AVATAR_CARRY_OBJECT);
        }

        event.amIOwner = container.roomSession.isRoomOwner;
        event.isGuildRoom = container.roomSession.isGuildRoom;
        event.myRoomControllerLevel = container.roomSession.roomControllerLevel;
        event.amIAnyRoomController = container.sessionDataManager.isAnyRoomController;
        event.canBeKicked = container.roomSession.isRoomOwner;
        event.badges = [RoomWidgetUserInfoUpdateEvent.DEFAULT_BOT_BADGE_ID];
        event.figure = userData.figure;

        container.desktopEvents.emit(event.type, event);
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::setObjectData()
    // TODO(AS3): sends SetObjectDataMessageComposer, which doesn't exist yet —

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::processWidgetMessage() (RWOPEM_OPEN_USER_PROFILE case)
    private handleOpenProfileMessage(message: RoomWidgetOpenProfileMessage): void 
    {
        const container = this._container;

        if(!container?.connection) return;

        container.habboTracking?.trackGoogle('extendedProfile', message.trackingLocation);

        const sent = container.connection.send(new GetExtendedProfileMessageComposer(message.userId));

        log.debug(`handleOpenProfileMessage: sent GetExtendedProfileMessageComposer(${message.userId}) -> ${sent}`);
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetFurniInfoMessage()
    private handleGetFurniInfoMessage(message: RoomWidgetRoomObjectMessage, roomId: number): void 
    {
        const container = this._container;

        if(!container?.roomEngine || message.id < 0) return;

        const event = new RoomWidgetFurniInfoUpdateEvent(RoomWidgetFurniInfoUpdateEvent.FURNI);

        event.id = message.id;
        event.category = message.category;

        const object = container.roomEngine.getRoomObject(roomId, message.id, message.category);

        if(!object) return;

        const model = object.getModel();
        const extraParam = model.getString(RoomWidgetInfostandExtraParamEnum.INFOSTAND_EXTRAPARAM);

        if(extraParam) event.extraParam = extraParam;

        const dataFormat = model.getNumber(RoomObjectVariableEnum.FURNITURE_DATA_FORMAT);
        const stuffData = StuffDataFactory.getStuffDataForType(dataFormat);

        stuffData?.initializeFromRoomObjectModel(model);
        event.stuffData = stuffData;

        const type = object.getType();

        if(type.indexOf('poster') === 0) 
        {
            const posterId = parseInt(type.replace('poster', ''), 10);

            event.name = `\${poster_${posterId}_name}`;
            event.description = `\${poster_${posterId}_desc}`;
        }
        else 
        {
            const typeId = model.getNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID);
            const furnitureData = message.category === 10
                ? container.sessionDataManager?.getFloorItemData(typeId)
                : container.sessionDataManager?.getWallItemData(typeId);

            if(furnitureData) 
            {
                event.name = furnitureData.localizedName;
                event.isNft = furnitureData.className.indexOf('nft_') === 0;
                event.description = furnitureData.description;
                event.purchaseOfferId = furnitureData.purchaseOfferId;
                event.bcOfferId = furnitureData.bcOfferId;
                event.purchaseCouldBeUsedForBuyout = furnitureData.purchaseCouldBeUsedForBuyout;
                event.rentOfferId = furnitureData.rentOfferId;
                event.rentCouldBeUsedForBuyout = furnitureData.rentCouldBeUsedForBuyout;
                event.availableForBuildersClub = furnitureData.availableForBuildersClub;
                event.classId = typeId;
            }
        }

        container.userDefinedRoomEvents?.stuffSelected(message.category === 10 ? object.getId() : -object.getId());

        if(type.indexOf('post_it') > -1) event.isStickie = true;

        const expiryTime = model.getNumber(RoomObjectVariableEnum.FURNITURE_EXPIRY_TIME);
        const expiryTimestamp = model.getNumber(RoomObjectVariableEnum.FURNITURE_EXPIRY_TIMESTAMP);

        event.expiration = expiryTime < 0 ? expiryTime : Math.max(0, expiryTime - (Date.now() - expiryTimestamp) / 1000);
        event.isWallItem = message.category === 20;
        event.isRoomOwner = container.roomSession.isRoomOwner;
        event.roomControllerLevel = container.roomSession.roomControllerLevel;
        event.isAnyRoomController = container.sessionDataManager?.isAnyRoomController ?? false;
        event.ownerId = model.getNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID);
        event.ownerName = model.getString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME);
        event.usagePolicy = model.getNumber(RoomObjectVariableEnum.FURNITURE_USAGE_POLICY);

        const groupId = model.getNumber(RoomObjectVariableEnum.FURNITURE_GUILD_CUSTOMIZED_GUILD_ID);

        if(groupId !== 0) 
        {
            event.groupId = groupId;
            container.connection?.send(new GetHabboGroupDetailsMessageComposer(groupId, false));
        }

        if(container.isOwnerOfFurniture?.(object)) 
        {
            event.isOwner = true;
        }

        this.requestFurniImage(event, roomId);

        container.desktopEvents.emit(event.type, event);
    }

    // imageFailed() below instead, once the scale-64 render actually comes back.
    private requestFurniImage(event: RoomWidgetFurniInfoUpdateEvent, roomId: number): void 
    {
        const roomEngine = this._container?.roomEngine;

        if(!roomEngine) return;

        const result = roomEngine.getRoomObjectImage(roomId, event.id, event.category, new Vector3d(180), 64, this);

        if(result.id > 0) 
        {
            this._pendingImageRequests.set(result.id, {furniId: event.id, category: event.category, roomId, scale: 64});
        }
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::update()
    // TODO(AS3): drives pet-command-tool countdowns and the pet update timer — both

    // (the "re-request at scale 1" fallback branch)
    private retryFurniImageAtScaleOne(pending: {
        furniId: number;
        category: number;
        roomId: number;
        scale: number
    }): void 
    {
        const roomEngine = this._container?.roomEngine;
        const result = roomEngine?.getRoomObjectImage(pending.roomId, pending.furniId, pending.category, new Vector3d(180), 1, this);

        if(result && result.id > 0) 
        {
            this._pendingImageRequests.set(result.id, {...pending, scale: 1});
        }
    }
}
