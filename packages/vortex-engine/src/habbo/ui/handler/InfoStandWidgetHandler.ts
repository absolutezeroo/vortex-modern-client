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
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
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
import {RoomWidgetUserActionMessage} from '@habbo/ui/widget/messages/RoomWidgetUserActionMessage';
import {RoomWidgetPetCommandMessage} from '@habbo/ui/widget/messages/RoomWidgetPetCommandMessage';
import {
    RespectPetMessageComposer
} from '@habbo/communication/messages/outgoing/room/RespectPetMessageComposer';
import {
    GiveSupplementToPetMessageComposer
} from '@habbo/communication/messages/outgoing/room/pet/GiveSupplementToPetMessageComposer';
import {
    PassCarryItemToPetMessageComposer
} from '@habbo/communication/messages/outgoing/room/avatar/PassCarryItemToPetMessageComposer';
import {PassCarryItemMessageComposer} from '@habbo/communication/messages/outgoing/room/avatar/PassCarryItemMessageComposer';
import {DropCarryItemMessageComposer} from '@habbo/communication/messages/outgoing/room/avatar/DropCarryItemMessageComposer';
import {
    GetExtendedProfileMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {RoomWidgetFurniInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent';
import {RoomWidgetUserInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent';
import {RoomWidgetRentableBotInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetRentableBotInfoUpdateEvent';
import {RoomWidgetPetInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetInfoUpdateEvent';
import {RoomSessionPetInfoUpdateEvent} from '@habbo/session/events/RoomSessionPetInfoUpdateEvent';
import {RoomSessionPetCommandsUpdateEvent} from '@habbo/session/events/RoomSessionPetCommandsUpdateEvent';
import {RoomSessionPetFigureUpdateEvent} from '@habbo/session/events/RoomSessionPetFigureUpdateEvent';
import {RoomSessionPetBreedingEvent} from '@habbo/session/events/RoomSessionPetBreedingEvent';
import {RoomSessionPetBreedingResultEvent} from '@habbo/session/events/RoomSessionPetBreedingResultEvent';
import {RoomSessionConfirmPetBreedingEvent} from '@habbo/session/events/RoomSessionConfirmPetBreedingEvent';
import {
    RoomSessionConfirmPetBreedingResultEvent
} from '@habbo/session/events/RoomSessionConfirmPetBreedingResultEvent';
import {RoomWidgetPetCommandsUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetCommandsUpdateEvent';
import {RoomWidgetPetFigureUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetFigureUpdateEvent';
import {RoomWidgetPetBreedingEvent} from '@habbo/ui/widget/events/RoomWidgetPetBreedingEvent';
import {RoomWidgetPetBreedingResultEvent} from '@habbo/ui/widget/events/RoomWidgetPetBreedingResultEvent';
import {RoomWidgetConfirmPetBreedingEvent} from '@habbo/ui/widget/events/RoomWidgetConfirmPetBreedingEvent';
import {
    RoomWidgetConfirmPetBreedingResultEvent
} from '@habbo/ui/widget/events/RoomWidgetConfirmPetBreedingResultEvent';
import {PetBreedingResultEventData} from '@habbo/ui/widget/events/PetBreedingResultEventData';
import {ConfirmPetBreedingPetData} from '@habbo/ui/widget/events/ConfirmPetBreedingPetData';
import {BreedingRarityCategoryData} from '@habbo/ui/widget/events/BreedingRarityCategoryData';
import type {PetBreedingResultData} from '@habbo/communication/messages/incoming/room/pet/PetBreedingResultData';
import type {BreedingPetInfo} from '@habbo/communication/messages/incoming/room/pet/BreedingPetInfo';
import {PetFigureData} from '@habbo/avatar/pets/PetFigureData';
import {
    PetSelectedMessageComposer
} from '@habbo/communication/messages/outgoing/room/pet/PetSelectedMessageComposer';
import {
    SetObjectDataMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/SetObjectDataMessageComposer';
import {RoomWidgetInfostandExtraParamEnum} from '@habbo/ui/widget/enums/RoomWidgetInfostandExtraParamEnum';
import {Vector3d} from '@room/utils/Vector3d';
import type {IUserData} from '@habbo/session/IUserData';
import type {InfoStandWidget} from '@habbo/ui/widget/infostand/InfoStandWidget';

const log = Logger.getLogger('habbo.ui.handler.InfoStandWidgetHandler');

// Every message type from getWidgetMessages() that processWidgetMessage() doesn't
// yet implement — kept as one list so the switch's default branch can log which
// unimplemented AS3 case fired, instead of a silent no-op.
const UNIMPLEMENTED_WIDGET_MESSAGES = new Set<string>([
    'RWUAM_SEND_FRIEND_REQUEST', 'RWUAM_RESPECT_USER', 'RWUAM_REPLENISH_RESPECT_USER',
    'RWUAM_OPEN_PROFILE', ' RWUAM_RESPECT_PET', 'RWUAM_WHISPER_USER', 'RWUAM_IGNORE_USER',
    'RWUAM_UNIGNORE_USER', 'RWUAM_KICK_USER', 'RWUAM_BAN_USER_DAY', 'RWUAM_BAN_USER_HOUR',
    'RWUAM_BAN_USER_PERM', 'RWUAM_MUTE_USER_2MIN', 'RWUAM_MUTE_USER_5MIN', 'RWUAM_MUTE_USER_10MIN',
    'RWUAM_GIVE_RIGHTS', 'RWUAM_TAKE_RIGHTS', 'RWUAM_START_TRADING', 'RWUAM_OPEN_HOME_PAGE',
    'RWUAM_PASS_CARRY_ITEM', 'RWUAM_DROP_CARRY_ITEM',
    // AS3 handles all three wired-inspect variants together via
    // roomEngine.context.createLinkEvent("wiredmenu/open/inspection/..."), which this
    // port cannot reach yet (IRoomEngine exposes no link-event/context accessor). The
    // base RWUAM_WIRED_INSPECT was declared in getWidgetMessages() but missing here, so
    // it fell through silently while its BOT/PET siblings logged a TODO.
    'RWUAM_WIRED_INSPECT', 'RWUAM_WIRED_INSPECT_BOT', 'RWUAM_WIRED_INSPECT_PET', 'RWRTSM_ROOM_TAG_SEARCH',
    'RWGOI_MESSAGE_GET_BADGE_IMAGE', 'RWUAM_REPORT', 'RWUAM_PICKUP_PET', 'RWUAM_MOUNT_PET',
    'RWUAM_TOGGLE_PET_RIDING_PERMISSION', 'RWUAM_TOGGLE_PET_BREEDING_PERMISSION', 'RWUAM_DISMOUNT_PET',
    'RWUAM_SADDLE_OFF', 'RWUAM_TRAIN_PET', 'RWUAM_REQUEST_PET_UPDATE', 'RWVM_CHANGE_MOTTO_MESSAGE',
    'RWPOM_OPEN_PRESENT',
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::_cachedPetImages
    private _cachedPetImages: Map<string, ImageBitmap | null> | null = new Map();

    // onSongInfoReceivedEvent — deferred with the jukebox/song-disk views (both stubs).
    constructor(_musicController: unknown = null) 
    {
    }

    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::get disposed()
    public get disposed(): boolean 
    {
        return this._disposed;
    }

    // AS3: sources/win63_version/habbo/ui/handler/InfoStandWidgetHandler.as::InfoStandWidgetHandler()
    // TODO(AS3): constructor takes the jukebox/music controller for onNowPlayingChanged /

    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null 
    {
        return this._container;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::set container()
    // AS3 registers nine roomSessionManager listeners here. Seven of the pet ones are wired below;
    // the two still missing are the non-pet RSUBE_FIGURE (onFigureUpdate) and
    // rsfgue_favourite_group_update (onFavouriteGroupUpdated).
    // TODO(AS3): InfoStandWidgetHandler.as::onFigureUpdate()/onFavouriteGroupUpdated() — subscribe
    // to "RSUBE_FIGURE" and "rsfgue_favourite_group_update" and re-dispatch as their RoomWidget*
    // events, exactly as the pet handlers below do.
    //
    // AS3 dispatches these on `roomSessionManager.events`; this port routes session events
    // through `sessionEvents` instead (see .claude/rules/20-architecture.md #4 — `events` is
    // reserved by the DI Component base). RoomUsersHandler emits PET_INFO on exactly that
    // emitter, so it is the correct subscription point.
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        if(this._container?.connection && this._groupDetailsEvent)
        {
            this._container.connection.removeMessageEvent(this._groupDetailsEvent);
            this._groupDetailsEvent.dispose();
            this._groupDetailsEvent = null;
        }

        const previousEvents = this._container?.roomSessionManager?.sessionEvents;

        if(previousEvents)
        {
            previousEvents.off(RoomSessionPetInfoUpdateEvent.PET_INFO, this.onPetInfo);
            previousEvents.off(RoomSessionPetCommandsUpdateEvent.PET_COMMANDS, this.onPetCommands);
            previousEvents.off(RoomSessionPetFigureUpdateEvent.PET_FIGURE_UPDATE, this.onPetFigureUpdate);
            previousEvents.off(RoomSessionPetBreedingResultEvent.PET_BREEDING_RESULT, this.onPetBreedingResult);
            previousEvents.off(RoomSessionPetBreedingEvent.PET_BREEDING, this.onPetBreedingEvent);
            previousEvents.off(RoomSessionConfirmPetBreedingEvent.CONFIRM_PET_BREEDING, this.onConfirmPetBreedingEvent);
            previousEvents.off(
                RoomSessionConfirmPetBreedingResultEvent.CONFIRM_PET_BREEDING_RESULT,
                this.onConfirmPetBreedingResultEvent
            );
        }

        this._container = value;

        if(!value) return;

        const sessionEvents = value.roomSessionManager?.sessionEvents;

        if(sessionEvents)
        {
            sessionEvents.on(RoomSessionPetInfoUpdateEvent.PET_INFO, this.onPetInfo);
            sessionEvents.on(RoomSessionPetCommandsUpdateEvent.PET_COMMANDS, this.onPetCommands);
            sessionEvents.on(RoomSessionPetFigureUpdateEvent.PET_FIGURE_UPDATE, this.onPetFigureUpdate);
            sessionEvents.on(RoomSessionPetBreedingResultEvent.PET_BREEDING_RESULT, this.onPetBreedingResult);
            sessionEvents.on(RoomSessionPetBreedingEvent.PET_BREEDING, this.onPetBreedingEvent);
            sessionEvents.on(RoomSessionConfirmPetBreedingEvent.CONFIRM_PET_BREEDING, this.onConfirmPetBreedingEvent);
            sessionEvents.on(
                RoomSessionConfirmPetBreedingResultEvent.CONFIRM_PET_BREEDING_RESULT,
                this.onConfirmPetBreedingResultEvent
            );
        }

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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::get isActivityDisplayEnabled()
    public get isActivityDisplayEnabled(): boolean
    {
        return this._container?.config?.getBoolean('activity.point.display.enabled') ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::dispose()
    // AS3 walks _cachedPetImages and calls BitmapData.dispose() on each entry before
    // dropping the map; ImageBitmap.close() is this port's equivalent (same convention as
    // BundleProductContainer / BitmapWrapperController).
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._cachedPetImages)
        {
            for(const image of this._cachedPetImages.values()) image?.close();

            this._cachedPetImages.clear();
            this._cachedPetImages = null;
        }

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
            'RWUAM_REPORT_CFH_OTHER', 'RWUAM_AMBASSADOR_ALERT_USER',
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

        if(message instanceof RoomWidgetUserActionMessage)
        {
            this.processUserActionMessage(message);

            return null;
        }

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::processWidgetMessage()
        // ("RWPCM_REQUEST_PET_COMMANDS" / "RWPCM_PET_COMMAND"). Issuing a command is a chat line,
        // not a packet of its own — `value` already holds "<pet name> <command>".
        if(message instanceof RoomWidgetPetCommandMessage)
        {
            if(message.type === RoomWidgetPetCommandMessage.REQUEST_COMMANDS)
            {
                this._container.roomSession?.requestPetCommands(message.petId);
            }
            else if(message.type === RoomWidgetPetCommandMessage.PET_COMMAND && message.value !== null)
            {
                this._container.roomSession?.sendChatMessage(message.value);
            }

            return null;
        }

        if(UNIMPLEMENTED_WIDGET_MESSAGES.has(message.type))
        {
            log.debug(`TODO(AS3): unimplemented widget message ${message.type}`);
        }

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::processWidgetMessage() (RWUAM_* pet cases)
    //
    // The AS3 resolves the addressed entity up front — for every pet-scoped action it looks the
    // target up via userDataManager.getPetUserData(userId) and bails when that returns null (the
    // pet left the room mid-click). The user-scoped RWUAM cases (whisper/ignore/kick/ban/mute/
    // rights/trading/friend-request/respect-user/open-profile) live in the InfoStandUserView path
    // and are not emitted by the pet view; they stay in UNIMPLEMENTED_WIDGET_MESSAGES until that
    // view is wired.
    private processUserActionMessage(message: RoomWidgetUserActionMessage): void
    {
        const container = this._container;

        if(!container?.roomSession) return;

        const petId = message.userId;

        // AS3 pre-resolves the pet's user data and returns null (drops the message) if the pet is
        // no longer in the room. Same guard here so a stale click can't fire a composer.
        if(container.roomSession.userDataManager.getPetUserData(petId) === null) return;

        switch(message.type)
        {
            case RoomWidgetUserActionMessage.PICK_UP_PET:
                container.roomSession.pickUpPet(petId);
                break;
            case RoomWidgetUserActionMessage.MOUNT_PET:
                container.roomSession.mountPet(petId);
                break;
            case RoomWidgetUserActionMessage.DISMOUNT_PET:
                container.roomSession.dismountPet(petId);
                break;
            case RoomWidgetUserActionMessage.TOGGLE_PET_RIDING_PERMISSION:
                container.roomSession.togglePetRidingPermission(petId);
                break;
            case RoomWidgetUserActionMessage.TOGGLE_PET_BREEDING_PERMISSION:
                container.roomSession.togglePetBreedingPermission(petId);
                break;
            case RoomWidgetUserActionMessage.SADDLE_OFF:
                container.roomSession.removeSaddleFromPet(petId);
                break;
            case RoomWidgetUserActionMessage.RESPECT_PET:
                container.sessionDataManager?.givePetRespect(petId);
                break;
            // AS3 sends the care composers straight down the connection here, not through
            // sessionDataManager — so TREAT_PET reuses RespectPetMessageComposer without touching
            // the respect counter that givePetRespect() maintains.
            case RoomWidgetUserActionMessage.TREAT_PET:
                container.connection?.send(new RespectPetMessageComposer(petId));
                break;
            case RoomWidgetUserActionMessage.GIVE_WATER_TO_PET:
                container.connection?.send(new GiveSupplementToPetMessageComposer(petId, 0));
                break;
            case RoomWidgetUserActionMessage.GIVE_LIGHT_TO_PET:
                container.connection?.send(new GiveSupplementToPetMessageComposer(petId, 1));
                break;
            case RoomWidgetUserActionMessage.GIVE_CARRY_ITEM_TO_PET:
                container.connection?.send(new PassCarryItemToPetMessageComposer(petId));
                break;
            // The avatar-to-avatar hand-off. AS3 passes the same id every other user action in this
            // switch uses, so a pet target would be a pet id here — that is what the separate
            // GIVE_CARRY_ITEM_TO_PET case above is for.
            case RoomWidgetUserActionMessage.PASS_CARRY_ITEM:
                container.connection?.send(new PassCarryItemMessageComposer(petId));
                break;
            // No target and no body: the server knows what you are holding.
            case RoomWidgetUserActionMessage.DROP_CARRY_ITEM:
                container.connection?.send(new DropCarryItemMessageComposer());
                break;
            default:
                log.debug(`TODO(AS3): unimplemented user-action message ${message.type}`);
                break;
        }
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

    /**
	 * Write the currently-inspected furni's stuff data — the same ad-furni branding feature as
	 * RWFAM_SAVE_STUFF_DATA above, entered from InfoStandFurniView instead of a widget message.
	 *
	 * Staff-only: AS3 gates the whole body on `hasSecurity(5)` and silently does nothing
	 * otherwise.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::setObjectData()
    public setObjectData(data: Map<string, string>): void
    {
        const container = this._container;

        if(!container?.connection || !container.sessionDataManager || !this._widget) return;

        if(container.sessionDataManager.hasSecurity(5))
        {
            container.connection.send(new SetObjectDataMessageComposer(this._widget.furniData.id, data));
        }
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
    // AS3: .../src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::update()
    public update(): void 
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::onPetCommands()
    private onPetCommands = (event: RoomSessionPetCommandsUpdateEvent): void =>
    {
        const container = this._container;

        if(!container) return;

        const widgetEvent = new RoomWidgetPetCommandsUpdateEvent(event.petId, event.allCommands, event.enabledCommands);

        container.desktopEvents.emit(widgetEvent.type, widgetEvent);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::onPetFigureUpdate()
    // AS3 renders the new figure to a BitmapData here and caches it in _cachedPetImages before
    // dispatching. This port's RoomWidgetPetFigureUpdateEvent carries the figure string instead —
    // the infostand's pet image is produced from the figure downstream — so there is nothing to
    // rasterise at this point.
    private onPetFigureUpdate = (event: RoomSessionPetFigureUpdateEvent): void =>
    {
        const container = this._container;

        if(!container) return;

        const widgetEvent = new RoomWidgetPetFigureUpdateEvent(event.petId, event.figure);

        container.desktopEvents.emit(widgetEvent.type, widgetEvent);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::onPetBreedingResult()
    private onPetBreedingResult = (event: RoomSessionPetBreedingResultEvent): void =>
    {
        const container = this._container;

        if(!container) return;

        const resultData = event.resultData;
        const otherResultData = event.otherResultData;

        if(!resultData || !otherResultData) return;

        const widgetEvent = new RoomWidgetPetBreedingResultEvent(
            InfoStandWidgetHandler.toBreedingResultEventData(resultData),
            InfoStandWidgetHandler.toBreedingResultEventData(otherResultData)
        );

        container.desktopEvents.emit(widgetEvent.type, widgetEvent);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::onPetBreedingEvent()
    private onPetBreedingEvent = (event: RoomSessionPetBreedingEvent): void =>
    {
        const container = this._container;

        if(!container) return;

        const widgetEvent = new RoomWidgetPetBreedingEvent();

        widgetEvent.state = event.state;
        widgetEvent.ownPetId = event.ownPetId;
        widgetEvent.otherPetId = event.otherPetId;

        container.desktopEvents.emit(widgetEvent.type, widgetEvent);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::onConfirmPetBreedingEvent()
    private onConfirmPetBreedingEvent = (event: RoomSessionConfirmPetBreedingEvent): void =>
    {
        const container = this._container;

        if(!container) return;

        const pet1 = event.pet1;
        const pet2 = event.pet2;

        if(!pet1 || !pet2) return;

        const rarityCategories: BreedingRarityCategoryData[] = [];

        for(const category of event.rarityCategories)
        {
            const data = new BreedingRarityCategoryData();

            data.chance = category.chance;
            // AS3 copies the array with concat(); slice() is the TS equivalent.
            data.breeds = category.breeds.slice();

            rarityCategories.push(data);
        }

        const widgetEvent = new RoomWidgetConfirmPetBreedingEvent(
            event.nestId,
            InfoStandWidgetHandler.toConfirmPetBreedingPetData(pet1),
            InfoStandWidgetHandler.toConfirmPetBreedingPetData(pet2),
            rarityCategories,
            event.resultPetTypeId
        );

        container.desktopEvents.emit(widgetEvent.type, widgetEvent);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::onConfirmPetBreedingResultEvent()
    private onConfirmPetBreedingResultEvent = (event: RoomSessionConfirmPetBreedingResultEvent): void =>
    {
        const container = this._container;

        if(!container) return;

        const widgetEvent = new RoomWidgetConfirmPetBreedingResultEvent(event.breedingNestStuffId, event.result);

        container.desktopEvents.emit(widgetEvent.type, widgetEvent);
    };

    // TS-only: no AS3 counterpart; AS3 inlines this copy field by field inside
    // onPetBreedingResult(), twice. Factored out only because it is done twice.
    private static toBreedingResultEventData(source: PetBreedingResultData): PetBreedingResultEventData
    {
        const data = new PetBreedingResultEventData();

        data.stuffId = source.stuffId;
        data.classId = source.classId;
        data.productCode = source.productCode;
        data.userId = source.userId;
        data.userName = source.userName;
        data.rarityLevel = source.rarityLevel;
        data.hasMutation = source.hasMutation;

        return data;
    }

    // TS-only: no AS3 counterpart; AS3 inlines this copy field by field inside
    // onConfirmPetBreedingEvent(), once per parent.
    private static toConfirmPetBreedingPetData(source: BreedingPetInfo): ConfirmPetBreedingPetData
    {
        const data = new ConfirmPetBreedingPetData();

        data.webId = source.webId;
        data.name = source.name;
        data.level = source.level;
        data.figure = source.figure;
        data.owner = source.owner;

        return data;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::onPetInfo()
    private onPetInfo = (event: RoomSessionPetInfoUpdateEvent): void =>
    {
        const petInfo = event.petInfo;

        if(!petInfo) return;

        const container = this._container;

        if(!container?.sessionDataManager) return;

        const petData = container.roomSession.userDataManager.getPetUserData(petInfo.petId);

        if(!petData) return;

        const figure = petData.figure;
        const petType = this.getPetType(figure);
        const petRace = this.getPetRace(figure);

        // Only the monsterplant (pet type 16) renders a growth-stage posture; every other
        // type passes a null posture through to getPetImage().
        let posture: string | null = null;

        if(petType === 16)
        {
            posture = petInfo.level >= petInfo.adultLevel ? 'std' : `grw${petInfo.level}`;
        }

        // The cache key folds in the posture, so a growing monsterplant does not keep
        // serving the image it was first seen with. The win63_version decompile corrupts
        // this line to `figure + ""` and the getPetImage() call below to a null posture,
        // which would collapse every growth stage onto one cache entry — the primary is
        // clean and is what this follows.
        const cacheKey = figure + (posture !== null ? `/posture=${posture}` : '');
        let image = this._cachedPetImages?.get(cacheKey) ?? null;

        if(!image)
        {
            image = this.getPetImage(figure, posture);
            this._cachedPetImages?.set(cacheKey, image);
        }

        const isOwnPet = petInfo.ownerId === container.sessionDataManager.userId;
        const infoEvent = new RoomWidgetPetInfoUpdateEvent(
            petType, petRace, petData.name, petInfo.petId, image, isOwnPet,
            petInfo.ownerId, petInfo.ownerName, petData.roomObjectId, petInfo.breedId
        );

        infoEvent.level = petInfo.level;
        infoEvent.levelMax = petInfo.levelMax;
        infoEvent.experience = petInfo.experience;
        infoEvent.experienceMax = petInfo.experienceMax;
        infoEvent.energy = petInfo.energy;
        infoEvent.energyMax = petInfo.energyMax;
        infoEvent.nutrition = petInfo.nutrition;
        infoEvent.nutritionMax = petInfo.nutritionMax;
        infoEvent.petRespect = petInfo.respect;
        infoEvent.petRespectLeft = container.sessionDataManager.petRespectLeft;
        infoEvent.age = petInfo.age;
        infoEvent.hasFreeSaddle = petInfo.hasFreeSaddle;
        infoEvent.isRiding = petInfo.isRiding;
        infoEvent.canBreed = petInfo.canBreed;
        infoEvent.canHarvest = petInfo.canHarvest;
        infoEvent.canRevive = petInfo.canRevive;
        infoEvent.rarityLevel = petInfo.rarityLevel;
        infoEvent.skillTresholds = petInfo.skillTresholds;
        infoEvent.canRemovePet = false;
        infoEvent.accessRights = petInfo.accessRights;
        infoEvent.maxWellBeingSeconds = petInfo.maxWellBeingSeconds;
        infoEvent.remainingWellBeingSeconds = petInfo.remainingWellBeingSeconds;
        infoEvent.remainingGrowingSeconds = petInfo.remainingGrowingSeconds;
        infoEvent.hasBreedingPermission = petInfo.hasBreedingPermission;

        const roomSession = container.roomSession;

        if(isOwnPet)
        {
            infoEvent.canRemovePet = true;
        }
        else if(roomSession.isRoomOwner || container.sessionDataManager.isAnyRoomController || roomSession.roomControllerLevel >= 1)
        {
            infoEvent.canRemovePet = true;
        }

        container.desktopEvents.emit(infoEvent.type, infoEvent);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::getPetImage()
    // AS3 passes a null listener — getPetImage() is a synchronous read for it, and a miss
    // falls straight through to the grey placeholder. `this` goes in instead, which is inert:
    // imageReady()/imageFailed() only act on ids registered in _pendingImageRequests and
    // pet requests are never registered there.
    // Public (AS3 has it private) because this port's RWPIUE_PET_FIGURE_UPDATE carries the
    // figure string rather than AS3's already-rendered BitmapData, so InfoStandWidget has to
    // do the render itself — see InfoStandWidget.onPetFigureUpdate(). RoomEngine.getPetImage() honours AS3's
    // synchronous-hit contract (result.data set, result.id 0) once the pet content is
    // loaded, so the placeholder branch is the not-yet-loaded case — same as AS3.
    public getPetImage(figure: string, posture: string | null = null): ImageBitmap | null
    {
        const roomEngine = this._container?.roomEngine;

        if(!roomEngine) return null;

        const figureData = new PetFigureData(figure);
        const result = roomEngine.getPetImage(
            figureData.typeId, figureData.paletteId, figureData.color,
            new Vector3d(90), 64, this, true, 0, figureData.customParts, posture
        );

        return result?.data ?? this.createPlaceholderPetImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::getPetImage()
    // (the `new BitmapData(30,30,false,4289374890)` fallback — 4289374890 is opaque #AAAAAA)
    private createPlaceholderPetImage(): ImageBitmap | null
    {
        const canvas = new OffscreenCanvas(30, 30);
        const context = canvas.getContext('2d');

        if(!context) return null;

        context.fillStyle = '#AAAAAA';
        context.fillRect(0, 0, 30, 30);

        return canvas.transferToImageBitmap();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::getPetType()
    private getPetType(figure: string): number
    {
        return this.getSpaceSeparatedInteger(figure, 0);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::getPetRace()
    private getPetRace(figure: string): number
    {
        return this.getSpaceSeparatedInteger(figure, 1);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::getSpaceSeparatedInteger()
    private getSpaceSeparatedInteger(figure: string, index: number): number
    {
        if(figure)
        {
            const parts = figure.split(' ');

            if(parts.length > index) return parseInt(parts[index], 10);
        }

        return -1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetPetInfoMessage()
    // requestPetInfo() is the call that actually fetches the info (GetPetInfoMessageComposer, 3899);
    // the petSelect branch is a fire-and-forget notification with no reply.
    private handleGetPetInfoMessage(petId: number): void
    {
        const container = this._container;

        if(!container) return;

        if(container.config?.getBoolean('petSelect.enabled'))
        {
            container.connection?.send(new PetSelectedMessageComposer(petId));
        }

        container.roomSession?.userDataManager.requestPetInfo(petId);
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
            // AS3: InfoStandWidgetHandler.as::processWidgetMessage() "RWFAM_WIRED_INSPECT" — the
            // wired menu keys a wall item by the *negated* furni id, which is how one link format
            // addresses both object spaces. Any other category falls through without a link.
            case RoomWidgetFurniActionMessage.WIRED_INSPECT: {
                let link = 'wiredmenu/open/inspection/0/';

                if(message.furniCategory === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
                {
                    link += String(message.furniId);
                }
                else if(message.furniCategory === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
                {
                    link += String(-message.furniId);
                }
                else
                {
                    break;
                }

                container.roomEngine.createLinkEvent(link);

                break;
            }
            // AS3: InfoStandWidgetHandler.as::processWidgetMessage() "RWFAM_SAVE_STUFF_DATA" —
            // objectData arrives as a flat "key=value" list joined by tabs and is rebuilt into the
            // map the composer serialises. `split('=', 2)` is AS3's own limit: a value containing
            // '=' is truncated there too, so it is kept rather than "fixed".
            case RoomWidgetFurniActionMessage.SAVE_STUFF_DATA: {
                const objectData = message.objectData;

                if(objectData === null) break;

                const data = new Map<string, string>();

                for(const entry of objectData.split('\t'))
                {
                    const pair = entry.split('=', 2);

                    if(pair.length === 2) data.set(pair[0], pair[1]);
                }

                container.roomEngine.modifyRoomObjectDataWithMap(
                    message.furniId, message.furniCategory, 'OBJECT_SAVE_STUFF_DATA', data
                );
                break;
            }
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
    // AS3: .../src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetObjectNameMessage()
    private handleGetObjectNameMessage(_message: RoomWidgetRoomObjectMessage): void 
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetFurniInfoMessage() (image portion)
    // Renders the *live placed object* (real colors/extras/state, read straight off the room
    // object's own model) via RoomEngine.getRoomObjectImage() at scale 64 - matches AS3's first
    // attempt. AS3 reads the result synchronously and re-requests at scale 1 if the image is
    // null or larger than the panel's 140x200 slot; ImageBitmap conversion is always async in
    // the browser (see ImageResult.ts), so that same fallback check happens in imageReady()/

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetObjectInfoMessage()
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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetObjectInfoMessage() (case 100)
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
                // AS3 passes the pet's webID here, not the room index it passes to the
                // user/bot handlers — requestPetInfo() keys on webID.
                this.handleGetPetInfoMessage(userData.webID);
                break;
            case 4:
                this.handleGetRentableBotInfoMessage(roomId, message.id, message.category, userData);
                break;
        }

        // AS3: InfoStandWidgetHandler.as::handleGetUserInfoMessage() — tells the wired menu which
        // user is selected, so its inspection tab follows the infostand.
        container.userDefinedRoomEvents?.userSelected(message.id);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetUserInfoMessage()
     *
     * Phase 1 (identity only) — deferred, matching the AS3 method lines ~891-967:
     * canBeMuted/canBeKicked/canBeBanned (moderation permission checks, needs
     * IRoomSession.roomModerationSettings), canTrade/canTradeReason (trade
     * eligibility), groupId/groupBadgeId/groupName, respectLeft/
     * respectReplenishesLeft, isIgnored, targetRoomControllerLevel (from the
     * room object's figure_flat_control model number). Badges read whatever is
     * already cached via getUserSelectedBadges() and fire requestUserSelectedBadges()
     * alongside it (AS3's own two methods), rather than awaiting the server's
     * response before emitting this event - a full request/response round-trip
     * for this one field is deferred with the group/respect fields below.
     * habboGroupsManager.updateVisibleExtendedProfile() and the trailing
     * composer send are deferred with the group/respect fields.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetUserInfoMessage()
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

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetUserInfoMessage()
        // Unlike achievementScore, badgesRank is not gated by isActivityDisplayEnabled.
        event.badgesRank = userData.badgesRank;

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

        // getUserSelectedBadges() is a pure cache read; requestUserSelectedBadges() is the
        // one that sends the composer - kept as two calls (matching AS3's own split) instead
        // of the old fused getUserBadges(), which fired a request on every read.
        event.badges = container.roomSession.userDataManager.getUserSelectedBadges(userData.webID);
        container.roomSession.userDataManager.requestUserSelectedBadges(userData.webID);
        event.figure = userData.figure;

        container.desktopEvents.emit(event.type, event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetBotInfoMessage()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::handleGetRentableBotInfoMessage()
    // The rentable-bot sibling of handleGetBotInfoMessage() above. Two payload differences that
    // matter: it carries the bot's owner (id and name, which the panel renders as a line of text)
    // and its skill list, and it has no kick/guild-room fields — a bot is not a peer.
    private handleGetRentableBotInfoMessage(roomId: number, roomIndex: number, category: number, userData: IUserData): void
    {
        const container = this._container;

        if(!container?.sessionDataManager || !container.roomEngine) return;

        const event = new RoomWidgetRentableBotInfoUpdateEvent();

        event.name = userData.name;
        event.motto = userData.custom;
        event.webID = userData.webID;
        event.userRoomId = roomIndex;
        event.ownerId = userData.ownerId;
        event.ownerName = userData.ownerName;
        event.botSkills = userData.botSkills;

        const object = container.roomEngine.getRoomObject(roomId, roomIndex, category);

        if(object)
        {
            event.carryItem = object.getModel().getNumber(RoomObjectVariableEnum.AVATAR_CARRY_OBJECT);
        }

        event.amIOwner = container.roomSession.isRoomOwner;
        event.myRoomControllerLevel = container.roomSession.roomControllerLevel;
        event.amIAnyRoomController = container.sessionDataManager.isAnyRoomController;
        event.badges = [RoomWidgetRentableBotInfoUpdateEvent.DEFAULT_BOT_BADGE_ID];
        event.figure = userData.figure;

        container.desktopEvents.emit(event.type, event);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/InfoStandWidgetHandler.as::processWidgetMessage() (RWOPEM_OPEN_USER_PROFILE case)
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
                event.tradeable = furnitureData.tradeable;
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

        // Publish the furni data before asking for its image, not after. imageReady() drops any
        // image whose pending.furniId does not match the widget's current furniData.id, and the
        // image request can now come back synchronously (see deliverFurniImage()) - which lands
        // here, mid-call, while the widget still holds the *previous* furni. AS3 gets away with the
        // opposite order only because its request is always deferred. Emitting first is safe for the
        // async path too: the widget is populated by then either way.
        container.desktopEvents.emit(event.type, event);

        this.requestFurniImage(event, roomId);
    }

    // imageFailed() below instead, once the scale-64 render actually comes back.
    private requestFurniImage(event: RoomWidgetFurniInfoUpdateEvent, roomId: number): void
    {
        const roomEngine = this._container?.roomEngine;

        if(!roomEngine) return;

        const result = roomEngine.getRoomObjectImage(roomId, event.id, event.category, new Vector3d(180), 64, this);

        this.deliverFurniImage(result, {furniId: event.id, category: event.category, roomId, scale: 64});
    }

    // Deliver an ImageResult on whichever contract it came back on. ImageResult's own header spells
    // the three out: id > 0 means the content is still loading and imageReady()/imageFailed() will
    // fire later; id === 0 is AS3's "synchronous hit" - the image is already on result.data and no
    // callback is ever coming; id < 0 means the request never started.
    //
    // Only the id > 0 branch used to be handled, so any furni whose content was already loaded -
    // that is, every furni actually visible in the room - had its image dropped on the floor and the
    // infostand stayed permanently blank, with nothing logged. The synchronous contract is not
    // hypothetical: getGenericRoomObjectImage() takes that branch precisely when the content is
    // available, which is the normal case here.
    //
    // Registering the pending entry before dispatching lets the id === 0 case reuse imageReady()'s
    // own oversize check, scale-1 retry and delivery rather than duplicating them. The retry cannot
    // recurse: it re-enters with scale 1, and the retry branch only triggers on scale 64.
    private deliverFurniImage(
        result: ImageResult | null,
        pending: {furniId: number; category: number; roomId: number; scale: number}
    ): void
    {
        if(!result || result.id < 0) return;

        this._pendingImageRequests.set(result.id, pending);

        if(result.id === 0) this.imageReady(result.id, result.data);
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

        if(!roomEngine) return;

        const result = roomEngine.getRoomObjectImage(pending.roomId, pending.furniId, pending.category, new Vector3d(180), 1, this);

        this.deliverFurniImage(result, {...pending, scale: 1});
    }
}
