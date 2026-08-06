/**
 * AvatarInfoWidgetHandler — handler for the RWE_AVATAR_INFO widget.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/AvatarInfoWidgetHandler.as
 *
 * Opens the own-avatar bubble on the toolbar MEMENU click, routes the bubble's
 * dance/expression/posture actions to roomSession.send* (consolidating what AS3 splits across
 * MeMenuWidgetHandler/InfoStandWidgetHandler), and owns the pet side of the widget: the
 * status/level/nest-breeding session events, the pet actions the bubbles raise (harvest, revive,
 * compost, use-product, request-breed) and the two room scans that build the per-pet
 * "use this product on…" / "breed with…" bubble sets.
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';
import {RoomWidgetDanceMessage} from '@habbo/ui/widget/messages/RoomWidgetDanceMessage';
import {RoomWidgetAvatarExpressionMessage} from '@habbo/ui/widget/messages/RoomWidgetAvatarExpressionMessage';
import {RoomWidgetChangePostureMessage} from '@habbo/ui/widget/messages/RoomWidgetChangePostureMessage';
import {RoomWidgetUserActionMessage} from '@habbo/ui/widget/messages/RoomWidgetUserActionMessage';
import {RoomWidgetUseProductMessage} from '@habbo/ui/widget/messages/RoomWidgetUseProductMessage';
import {RoomWidgetPetStatusUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetStatusUpdateEvent';
import {RoomWidgetPetLevelUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetLevelUpdateEvent';
import {UseProductItem} from '@habbo/ui/widget/events/UseProductItem';
import {RoomSessionPetStatusUpdateEvent} from '@habbo/session/events/RoomSessionPetStatusUpdateEvent';
import {RoomSessionPetLevelUpdateEvent} from '@habbo/session/events/RoomSessionPetLevelUpdateEvent';
import {RoomSessionNestBreedingSuccessEvent} from '@habbo/session/events/RoomSessionNestBreedingSuccessEvent';
import {RoomEngineUseProductEvent} from '@habbo/room/events/RoomEngineUseProductEvent';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {FurnitureCategory} from '@habbo/inventory/enum/FurnitureCategory';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '@habbo/toolbar/HabboToolbarIconEnum';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {IUserData} from '@habbo/session/IUserData';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {AvatarInfoWidget} from '@habbo/ui/widget/avatarinfo/AvatarInfoWidget';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {
    CustomUserNotificationMessageEvent
} from '@habbo/communication/messages/incoming/room/furniture/CustomUserNotificationMessageEvent';

const logger = Logger.getLogger('habbo.ui.handler.AvatarInfoWidgetHandler');

// IUserData.type for a pet — the literal AS3 passes to getUserDataByType()/its type checks.
const USER_TYPE_PET: number = 2;

// Monsterplant level at which the plant is fully grown; below it the rebreed product is refused
// and above it the fertilizer is (AvatarInfoWidgetHandler.as::activateUseProductMenuForPets()).
const MONSTERPLANT_GROWN_LEVEL: number = 7;

export class AvatarInfoWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../src/com/sulake/habbo/ui/handler/AvatarInfoWidgetHandler.as::_disposed
    private _disposed: boolean = false;
    // AS3: .../src/com/sulake/habbo/ui/handler/AvatarInfoWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;
    private _widget: AvatarInfoWidget | null = null;

    // AS3: AvatarInfoWidgetHandler.as::_SafeStr_5791
    private _customUserNotificationEvent: IMessageEvent | null = null;

    // AS3: AvatarInfoWidgetHandler.as::set widget()
    public set widget(value: AvatarInfoWidget | null)
    {
        this._widget = value;
    }

    // AS3: AvatarInfoWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_AVATAR_INFO';
    }

    // AS3: AvatarInfoWidgetHandler.as::get roomSession()
    public get roomSession()
    {
        return this._container?.roomSession ?? null;
    }

    // AS3: AvatarInfoWidgetHandler.as::get roomEngine()
    public get roomEngine()
    {
        return this._container?.roomEngine ?? null;
    }

    // AS3: AvatarInfoWidgetHandler.as::get friendList()
    public get friendList()
    {
        return this._container?.friendList ?? null;
    }

    // AS3: AvatarInfoWidgetHandler.as::set container() / get container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container?.toolbar?.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onToolbarClicked);

        // AS3 dispatches these on `roomSessionManager.events`; this port routes session events
        // through `sessionEvents` (see .claude/rules/20-architecture.md #4).
        const previousSessionEvents = this._container?.roomSessionManager?.sessionEvents;

        if(previousSessionEvents)
        {
            previousSessionEvents.off(RoomSessionPetStatusUpdateEvent.PET_STATUS_UPDATE, this.onPetStatusUpdate);
            previousSessionEvents.off(RoomSessionPetLevelUpdateEvent.PET_LEVEL_UPDATE, this.onPetLevelUpdate);
            previousSessionEvents.off(RoomSessionNestBreedingSuccessEvent.NEST_BREEDING_SUCCESS, this.onNestBreedingSuccessEvent);
        }

        this._container = value;

        if(!value) return;

        // AS3: AvatarInfoWidgetHandler.as::set container() — subscribed once, guarded on the
        // event field so a second container does not double-register.
        if(!this._customUserNotificationEvent && value.connection)
        {
            this._customUserNotificationEvent = new CustomUserNotificationMessageEvent(
                this.onCustomUserNotificationMessage.bind(this)
            );

            value.connection.addMessageEvent(this._customUserNotificationEvent);
        }

        value.toolbar?.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this.onToolbarClicked);

        const sessionEvents = value.roomSessionManager?.sessionEvents;

        if(sessionEvents)
        {
            sessionEvents.on(RoomSessionPetStatusUpdateEvent.PET_STATUS_UPDATE, this.onPetStatusUpdate);
            sessionEvents.on(RoomSessionPetLevelUpdateEvent.PET_LEVEL_UPDATE, this.onPetLevelUpdate);
            sessionEvents.on(RoomSessionNestBreedingSuccessEvent.NEST_BREEDING_SUCCESS, this.onNestBreedingSuccessEvent);
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/handler/AvatarInfoWidgetHandler.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    /**
     * AS3: AvatarInfoWidgetHandler.as::onCustomUserNotificationMessage()
     *
     * AS3 switches on `code - 4`, i.e. only the two respect-vote failures, and refunds the respect
     * the player just spent. The same message also opens a dialog in
     * `CustomUserNotificationWidgetHandler`; both handlers subscribe it independently.
     */
    // AS3: .../src/com/sulake/habbo/ui/handler/AvatarInfoWidgetHandler.as::onCustomUserNotificationMessage()
    private onCustomUserNotificationMessage(event: IMessageEvent): void
    {
        const parser = (event as CustomUserNotificationMessageEvent).customUserNotificationParser;

        if(!parser) return;

        switch(parser.code)
        {
            case 4:
            case 5:
                this._container?.sessionDataManager?.giveRespectFailed();
        }
    }

    // AS3: AvatarInfoWidgetHandler.as::onToolbarClicked()
    private onToolbarClicked = (event: HabboToolbarEvent): void =>
    {
        if(event.iconId === HabboToolbarIconEnum.MEMENU)
        {
            this._widget?.selectOwnAvatar();
        }
    };

    // AS3: AvatarInfoWidgetHandler.as::onPetStatusUpdate()
    // The session event carries the pet's webID; the widget event carries its room object id.
    private onPetStatusUpdate = (event: RoomSessionPetStatusUpdateEvent): void =>
    {
        const container = this._container;

        if(!container) return;

        const petData = this.findPetWithWebId(event.petId);

        if(!petData)
        {
            logger.warn(`Could not find pet with the id: ${event.petId} given by petStatusUpdate`);

            return;
        }

        container.desktopEvents.emit(
            RoomWidgetPetStatusUpdateEvent.PET_STATUS_UPDATE,
            new RoomWidgetPetStatusUpdateEvent(
                petData.roomObjectId, event.canBreed, event.canHarvest, event.canRevive, event.hasBreedingPermission
            )
        );
    };

    // AS3: AvatarInfoWidgetHandler.as::onPetLevelUpdate()
    private onPetLevelUpdate = (event: RoomSessionPetLevelUpdateEvent): void =>
    {
        const container = this._container;

        if(!container) return;

        const petData = this.findPetWithWebId(event.petId);

        // AS3 dereferences the result without a null check here (unlike onPetStatusUpdate);
        // guarded, since a level update for a pet that has left the room is reachable.
        if(!petData) return;

        container.desktopEvents.emit(
            RoomWidgetPetLevelUpdateEvent.PET_LEVEL_UPDATE,
            new RoomWidgetPetLevelUpdateEvent(petData.roomObjectId, event.level)
        );
    };

    // AS3: AvatarInfoWidgetHandler.as::onNestBreedingSuccessEvent()
    private onNestBreedingSuccessEvent = (event: RoomSessionNestBreedingSuccessEvent): void =>
    {
        this._widget?.showNestBreedingSuccess(event.petId, event.rarityCategory);
    };

    // AS3: AvatarInfoWidgetHandler.as::getWidgetMessages()
    // The dance/expression/posture types are the port's own consolidation of AS3's MeMenu handler.
    public getWidgetMessages(): string[]
    {
        return [
            RoomWidgetDanceMessage.DANCE,
            RoomWidgetAvatarExpressionMessage.AVATAR_EXPRESSION,
            RoomWidgetChangePostureMessage.CHANGE_POSTURE,
            RoomWidgetUserActionMessage.START_NAME_CHANGE,
            RoomWidgetUserActionMessage.REQUEST_PET_UPDATE,
            RoomWidgetUseProductMessage.PET_PRODUCT,
            RoomWidgetUserActionMessage.REQUEST_BREED_PET,
            RoomWidgetUserActionMessage.HARVEST_PET,
            RoomWidgetUserActionMessage.REVIVE_PET,
            RoomWidgetUserActionMessage.COMPOST_PLANT,
        ];
    }

    // AS3: AvatarInfoWidgetHandler.as::getProcessedEvents()
    // TODO(AS3): the two ROSM_USE_PRODUCT_FROM_* events are declared here as AS3 does, but the
    // room engine does not raise them yet (its pet-product use path — _SafeCls_90.as:4963 /
    // _SafeCls_1821.as:1479 — is unported), so the use-product bubbles have no trigger today.
    public getProcessedEvents(): string[]
    {
        return [
            RoomEngineUseProductEvent.USE_PRODUCT_FROM_INVENTORY,
            RoomEngineUseProductEvent.USE_PRODUCT_FROM_ROOM,
        ];
    }

    // AS3: AvatarInfoWidgetHandler.as::processWidgetMessage() (+ MeMenuWidgetHandler action cases)
    public processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(!message || !this._container) return null;

        const roomSession = this._container.roomSession;
        const userId = (message as RoomWidgetUserActionMessage).userId ?? 0;

        switch(message.type)
        {
            case RoomWidgetDanceMessage.DANCE:
            {
                const style = (message as RoomWidgetDanceMessage).style;

                roomSession.sendDanceMessage(style);
                // AS3 adaptation: derive isDancing optimistically from the sent style
                // (the RSDE_DANCE round-trip event isn't wired in this slice).
                if(this._widget) this._widget.isDancing = style !== RoomWidgetDanceMessage.STOP;
                break;
            }
            case RoomWidgetAvatarExpressionMessage.AVATAR_EXPRESSION:
                roomSession.sendAvatarExpressionMessage((message as RoomWidgetAvatarExpressionMessage).animation.ordinal);
                break;
            case RoomWidgetChangePostureMessage.CHANGE_POSTURE:
                roomSession.sendChangePostureMessage((message as RoomWidgetChangePostureMessage).posture);
                break;
            case RoomWidgetUserActionMessage.START_NAME_CHANGE:
                // AS3: AvatarInfoWidgetHandler.as::processWidgetMessage() → habboHelp.startNameChange()
                this._container.habboHelp?.startNameChange();
                break;
            case RoomWidgetUserActionMessage.REQUEST_PET_UPDATE:
                // The infostand asks the server for fresh pet info; the answer must not re-open
                // the bubble, so the widget stops handling RWPIUE_PET_INFO until the next select.
                if(this._widget) this._widget.handlePetInfo = false;
                break;
            case RoomWidgetUseProductMessage.PET_PRODUCT:
            {
                const useProductMessage = message as RoomWidgetUseProductMessage;

                roomSession.useProductForPet(useProductMessage.roomObjectId, useProductMessage.petId);
                break;
            }
            case RoomWidgetUserActionMessage.HARVEST_PET:
                roomSession.harvestPet(userId);
                break;
            case RoomWidgetUserActionMessage.COMPOST_PLANT:
                this.confirmCompost(userId);
                break;
            case RoomWidgetUserActionMessage.REQUEST_BREED_PET:
                this.requestBreedMenu(userId);
                break;
            case RoomWidgetUserActionMessage.REVIVE_PET:
                // AS3 falls through with no body — the revive itself is the catalog purchase the
                // bubble already opened.
                break;
        }

        return null;
    }

    // AS3: AvatarInfoWidgetHandler.as::processWidgetMessage() (RWUAM_COMPOST_PLANT case)
    private confirmCompost(petId: number): void
    {
        const localization = this._widget?.catalog?.localization ?? this._container?.localization ?? null;
        const windowManager = this._widget?.windowManager;

        if(!windowManager) return;

        windowManager.confirm(
            localization?.getLocalization('monsterplant.confirm.title.compost') ?? '',
            localization?.getLocalization('monsterplant.confirm.desc.compost') ?? '',
            0,
            (dialog: IDisposable, event: WindowEvent): void =>
            {
                dialog.dispose();

                if(event.type === 'WE_OK') this._container?.roomSession.compostPlant(petId);
            }
        );
    }

    // AS3: AvatarInfoWidgetHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        const useProductEvent = event as RoomEngineUseProductEvent | null;

        if(!useProductEvent) return;

        switch(useProductEvent.type)
        {
            case RoomEngineUseProductEvent.USE_PRODUCT_FROM_INVENTORY:
                this.handleUseProductMenuRequestInventoryItem(useProductEvent.inventoryStripId, useProductEvent.furnitureTypeId);
                break;
            case RoomEngineUseProductEvent.USE_PRODUCT_FROM_ROOM:
                this.handleUseProductMenuRequestRoomObject(useProductEvent.objectId);
                break;
        }
    }

    // AS3: AvatarInfoWidgetHandler.as::getFurniData()
    public getFurniData(object: IRoomObject | null): IFurnitureData | null
    {
        if(!object) return null;

        const typeId = object.getModel().getNumber('furniture_type_id');

        return this._container?.sessionDataManager?.getFloorItemData(typeId) ?? null;
    }

    // AS3: AvatarInfoWidgetHandler.as::requestBreedMenu()
    // The clicked plant's own species (the first token of its figure) decides which other plants
    // are offered as partners.
    private requestBreedMenu(petRoomIndex: number): void
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        const roomId = container.roomSession.roomId;
        const ownUserId = container.sessionDataManager?.userId ?? -1;
        const petData = container.roomSession.userDataManager.getUserDataByType(petRoomIndex, USER_TYPE_PET);

        if(!petData) return;

        this.activateBreedMenuForPets(roomId, petRoomIndex, this.getPetTypeId(petData), petData.roomObjectId, ownUserId);
    }

    // AS3: AvatarInfoWidgetHandler.as::handleUseProductMenuRequestInventoryItem()
    private handleUseProductMenuRequestInventoryItem(inventoryStripId: number, furnitureTypeId: number): void
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        const roomId = container.roomSession.roomId;
        const ownUserId = container.sessionDataManager?.userId ?? -1;
        const furniData = container.sessionDataManager?.getFloorItemData(furnitureTypeId) ?? null;

        if(!furniData) return;

        // The product's first custom param is the pet type it applies to; a product with none
        // targets nothing.
        if(this.getProductPetTypeId(furniData) === -1) return;

        this.activateUseProductMenuForPets(roomId, furnitureTypeId, -1, furniData.category, ownUserId, inventoryStripId);
    }

    // AS3: AvatarInfoWidgetHandler.as::handleUseProductMenuRequestRoomObject()
    private handleUseProductMenuRequestRoomObject(objectId: number): void
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        const roomId = container.roomSession.roomId;
        const roomObject = container.roomEngine.getRoomObject(roomId, objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

        if(!roomObject || !container.isOwnerOfFurniture(roomObject)) return;

        const ownerId = container.getFurnitureOwnerId(roomObject);
        const furniData = this.getFurniData(roomObject);

        if(!furniData || this.getProductPetTypeId(furniData) === -1) return;

        this.activateUseProductMenuForPets(roomId, objectId, -1, furniData.category, ownerId);
    }

    // AS3: AvatarInfoWidgetHandler.as::activateUseProductMenuForPets()
    // Scans every pet in the room and keeps the ones the product can actually be used on: same
    // owner, same species, and — for the three monsterplant products — the right growth state.
    private activateUseProductMenuForPets(
        roomId: number,
        requestRoomObjectId: number,
        petTypeId: number,
        category: number,
        ownerId: number,
        inventoryStripId: number = -1
    ): void
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        const items: UseProductItem[] = [];
        const count = container.roomEngine.getRoomObjectCount(roomId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

        for(let i = 0; i < count; i++)
        {
            const object = container.roomEngine.getRoomObjectWithIndex(roomId, i, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

            if(!object) continue;

            const userData = container.roomSession.userDataManager.getUserDataByIndex(object.getId());

            if(!userData || userData.type !== USER_TYPE_PET || userData.ownerId !== ownerId) continue;

            // A saddle offered to a pet that already wears one becomes a "replace".
            const replace = userData.hasSaddle && category === FurnitureCategory.PET_SADDLE;

            if(this.getPetTypeId(userData) !== petTypeId) continue;

            if(category === FurnitureCategory.MONSTERPLANT_REVIVAL && !userData.canRevive) continue;

            if(category === FurnitureCategory.MONSTERPLANT_REBREED
                && (userData.petLevel < MONSTERPLANT_GROWN_LEVEL || userData.canRevive || userData.canBreed)) continue;

            if(category === FurnitureCategory.MONSTERPLANT_FERTILIZE
                && (userData.petLevel >= MONSTERPLANT_GROWN_LEVEL || userData.canRevive)) continue;

            items.push(new UseProductItem(
                userData.roomObjectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER, userData.name,
                requestRoomObjectId, object.getId(), inventoryStripId, replace
            ));
        }

        this._widget?.showUseProductMenuForItems(items);
    }

    // AS3: AvatarInfoWidgetHandler.as::activateBreedMenuForPets()
    // The partner must be breedable, of the same species, not the plant that started the round,
    // and either yours or one whose owner allowed breeding.
    private activateBreedMenuForPets(
        roomId: number,
        _petRoomIndex: number,
        petTypeId: number,
        requestRoomObjectId: number,
        ownUserId: number
    ): void
    {
        const container = this._container;

        if(!container?.roomEngine) return;

        const items: UseProductItem[] = [];
        const count = container.roomEngine.getRoomObjectCount(roomId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

        for(let i = 0; i < count; i++)
        {
            const object = container.roomEngine.getRoomObjectWithIndex(roomId, i, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

            if(!object) continue;

            const userData = container.roomSession.userDataManager.getUserDataByIndex(object.getId());

            if(!userData || userData.type !== USER_TYPE_PET || !userData.canBreed) continue;

            if(!userData.hasBreedingPermission && userData.ownerId !== ownUserId) continue;

            // The partner's owner has to be in the room — AS3 looks their user data up and skips
            // the pet when it is missing.
            const ownerData = container.roomSession.userDataManager.getUserData(userData.ownerId);

            if(!ownerData) continue;

            if(this.getPetTypeId(userData) !== petTypeId || userData.roomObjectId === requestRoomObjectId) continue;

            items.push(new UseProductItem(
                userData.roomObjectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER, userData.name,
                requestRoomObjectId, object.getId()
            ));
        }

        this._widget?.showBreedPetMenuForItems(items);
    }

    // AS3: AvatarInfoWidgetHandler.as::findPetWithWebId()
    private findPetWithWebId(webId: number): IUserData | null
    {
        const container = this._container;

        if(!container?.roomEngine) return null;

        const roomId = container.roomSession.roomId;
        const count = container.roomEngine.getRoomObjectCount(roomId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

        for(let i = 0; i < count; i++)
        {
            const object = container.roomEngine.getRoomObjectWithIndex(roomId, i, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

            if(!object) continue;

            const userData = container.roomSession.userDataManager.getUserDataByIndex(object.getId());

            if(userData && userData.type === USER_TYPE_PET && userData.webID === webId) return userData;
        }

        return null;
    }

    // AS3: AvatarInfoWidgetHandler.as::activateBreedMenuForPets()/requestBreedMenu() — the
    // `figure.split(" ")[0]` both perform to read a pet's species.
    private getPetTypeId(userData: IUserData): number
    {
        const parts = (userData.figure ?? '').split(' ');

        return parts.length > 0 ? parseInt(parts[0], 10) : -1;
    }

    // AS3: AvatarInfoWidgetHandler.as::handleUseProductMenuRequestInventoryItem()/…RoomObject() —
    // the same split over the product's customParams.
    private getProductPetTypeId(furniData: IFurnitureData): number
    {
        const parts = (furniData.customParams ?? '').split(' ');
        const value = parts.length > 0 ? parseInt(parts[0], 10) : NaN;

        return Number.isNaN(value) ? -1 : value;
    }

    // AS3: AvatarInfoWidgetHandler.as::update()
    public update(): void
    {
    }

    // AS3: AvatarInfoWidgetHandler.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        // AS3 unsubscribes before nulling the container, because the setter drops the reference the
        // connection is reached through.
        if(this._customUserNotificationEvent && this._container?.connection)
        {
            this._container.connection.removeMessageEvent(this._customUserNotificationEvent);
        }

        this.container = null;
        this._widget = null;
        this._customUserNotificationEvent = null;
        this._disposed = true;
    }

    // AS3: AvatarInfoWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }
}
