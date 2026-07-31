import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import {PlacePetComposer} from '@habbo/communication/messages/outgoing/room/pet/PlacePetComposer';

import type {HabboInventory} from '../HabboInventory';
import type {IPetsModel} from './IPetsModel';
import type {Pet} from './Pet';
import {PetsView} from './PetsView';

// AS3: PetsModel.as::placePetToRoom() compares against these literals directly (16 and 7).
const PET_TYPE_MONSTERPLANT = 16;
const MONSTERPLANT_FULLY_GROWN_LEVEL = 7;

// Unseen-item tracker category for pets (AS3 uses category 3).
const UNSEEN_CATEGORY_PETS = 3;

/**
 * PetsModel — the pets-inventory tab controller (an IInventoryModel).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/pets/PetsModel.as
 *
 * Owns the `Map<number, Pet>` store AND a PetsView, forwarding every mutation into the view. This
 * replaces the earlier data-only stub that had no view integration.
 */
export class PetsModel implements IPetsModel
{
    private _controller: HabboInventory;
    private _communication: IHabboCommunicationManager;
    private _roomEngine: IRoomEngine;
    private _localization: IHabboLocalizationManager;
    private _view: PetsView;

    private _pets: Map<number, Pet> = new Map<number, Pet>();
    private _listInitialized: boolean = false;
    private _placementPending: boolean = false;
    private _disposed: boolean = false;

    constructor(
        controller: HabboInventory,
        windowManager: IHabboWindowManager,
        communication: IHabboCommunicationManager,
        roomEngine: IRoomEngine,
        localization: IHabboLocalizationManager
    )
    {
        this._controller = controller;
        this._communication = communication;
        this._roomEngine = roomEngine;
        this._localization = localization;
        this._view = new PetsView(this, windowManager, roomEngine);
        this._roomEngine.events.on('REOE_PLACED', this.onObjectPlaced);
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: PetsModel.as::get controller()
    get controller(): HabboInventory
    {
        return this._controller;
    }

    // AS3: PetsModel.as::get roomSession()
    get roomSession(): IRoomSession | null
    {
        return this._controller.roomSession;
    }

    get localization(): IHabboLocalizationManager
    {
        return this._localization;
    }

    // AS3: PetsModel.as::get pets()
    get pets(): Map<number, Pet>
    {
        return this._pets;
    }

    // AS3: PetsModel.as::isListInitialized()
    isListInitialized(): boolean
    {
        return this._listInitialized;
    }

    // AS3: PetsModel.as::setListInitialized()
    setListInitialized(): void
    {
        this._listInitialized = true;
        this._view.updateState();
    }

    // AS3: PetsModel.as::requestPetInventory() — the request itself already lives in
    // HabboInventory.requestPets(); kept for the IInventoryModel contract.
    requestInitialization(): void
    {
        this._controller.requestPets();
    }

    // AS3: PetsModel.as::addPet()
    addPet(pet: Pet): void
    {
        if(!this._pets.has(pet.id))
        {
            this._pets.set(pet.id, pet);
            this._view.addPet(pet);
        }

        this._view.updateState();
    }

    // AS3: PetsModel.as::updatePets() — reconcile the store against a fresh set, forwarding each
    // add/remove into the view, then flag the list initialized (which renders it).
    updatePets(pets: Map<number, Pet>): void
    {
        const incoming = new Set(pets.keys());

        for(const id of Array.from(this._pets.keys()))
        {
            if(!incoming.has(id))
            {
                this._pets.delete(id);
                this._view.removePet(id);
            }
        }

        for(const [id, pet] of pets)
        {
            if(!this._pets.has(id))
            {
                this._pets.set(id, pet);
                this._view.addPet(pet);
            }
        }

        this.setListInitialized();
    }

    // AS3: PetsModel.as::removePet()
    removePet(id: number): void
    {
        this._pets.delete(id);
        this._view.removePet(id);
        this._view.updateState();
    }

    // AS3: PetsModel.as::categorySwitch()
    categorySwitch(category: string): void
    {
        if(category === 'pets' && this._controller.isVisible)
        {
            this._controller.events.emit('HABBO_INVENTORY_TRACKING_EVENT_PETS');
        }
    }

    // AS3: PetsModel.as::getWindowContainer()
    getWindowContainer(): unknown
    {
        return this._view.getWindowContainer();
    }

    // AS3: PetsModel.as::closingInventoryView()
    closingInventoryView(): void
    {
        if(this._view.isVisible)
        {
            this.resetUnseenItems();
        }
    }

    // AS3: PetsModel.as::updateView()
    updateView(): void
    {
        this._view.update();
    }

    // AS3: PetsModel.as::placePetToRoom()
    placePetToRoom(id: number, skipServer: boolean = false): boolean
    {
        const pet = this._pets.get(id);

        if(pet === undefined) return false;

        const roomSession = this._controller.roomSession;

        // AS3: PetsModel.as::placePetToRoom() — the monster plant (typeId 16) previews at its growth
        // stage rather than full grown, so the ghost is given a posture.
        let posture: string | null = null;

        if(pet.typeId === PET_TYPE_MONSTERPLANT)
        {
            posture = pet.level >= MONSTERPLANT_FULLY_GROWN_LEVEL ? 'std' : `grw${pet.level}`;
        }

        if(roomSession !== null && roomSession.isRoomOwner)
        {
            this._placementPending = this._roomEngine.initializeRoomObjectInsert(
                'inventory',
                id * -1,
                100,
                2,
                pet.figureString,
                null,
                -1,
                -1,
                posture
            );
            this._controller.closeView();

            return this._placementPending;
        }

        if(roomSession === null || !roomSession.arePetsAllowed)
        {
            return false;
        }

        if(!skipServer)
        {
            // AS3: PetsModel.placePetToRoom() guest branch — `new _SafeCls_2777(pet.id, 0, 0)`.
            // The server resolves the actual drop tile, so x/y are always 0.
            this._communication.connection?.send(new PlacePetComposer(id, 0, 0));
        }

        return true;
    }

    // AS3: PetsModel.as::onObjectPlaced()
    private onObjectPlaced = (event: {type?: string}): void =>
    {
        if(this._placementPending && event.type === 'REOE_PLACED')
        {
            this._controller.showView();
            this._placementPending = false;
        }
    };

    // AS3: PetsModel.as::resetUnseenItems()
    resetUnseenItems(): void
    {
        this._controller.unseenItemTracker.resetCategory(UNSEEN_CATEGORY_PETS);
        this._controller.updateUnseenItemCounts();
        this._view.update();
    }

    // AS3: PetsModel.as::isUnseen()
    isUnseen(id: number): boolean
    {
        return this._controller.unseenItemTracker.isUnseen(UNSEEN_CATEGORY_PETS, id);
    }

    // AS3: PetsModel.as::selectItemById()
    selectItemById(id: number): void
    {
        this._view.selectById(id);
    }

    getPetById(id: number): Pet | null
    {
        return this._pets.get(id) ?? null;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._roomEngine.events.off('REOE_PLACED', this.onObjectPlaced);
        this._view.dispose();

        for(const pet of this._pets.values())
        {
            pet.dispose();
        }

        this._pets.clear();
    }
}
