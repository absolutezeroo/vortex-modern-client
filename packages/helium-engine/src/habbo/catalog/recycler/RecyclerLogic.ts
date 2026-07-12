import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {PrizeLevelMessageData} from '@habbo/communication/messages/incoming/catalog/PrizeLevelMessageData';
import type {HabboCatalog} from '../HabboCatalog';
import type {IRecycler} from './IRecycler';
import type {IRecyclerVisualization} from './IRecyclerVisualization';
import {FurniSlotItem} from './FurniSlotItem';
import {PrizeLevelContainer} from './PrizeLevelContainer';

const log = Logger.getLogger('RecyclerLogic');

/**
 * Recycler state machine: manages the slot pool, server status/timeout, and prize table cache.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as
 */
export class RecyclerLogic implements IRecycler
{
    private static readonly STATUS_OFF: number = 0;
    private static readonly STATUS_READY: number = 1;
    private static readonly STATUS_WAITING_FOR_SERVER: number = 2;

    private _localStatus: number = RecyclerLogic.STATUS_OFF;

    private _systemStatus: number = 0;

    private _nextRecycleAllowedTimestamp: number = 0;

    private _slots: (FurniSlotItem | null)[] = [];

    private _catalog: HabboCatalog | null;

    private _windowManager: IHabboWindowManager | null;

    private _visualization: IRecyclerVisualization | null = null;

    private _prizes: PrizeLevelContainer[] | null = null;

    private _pendingPrizeCallback: ((prizes: PrizeLevelContainer[]) => void) | null = null;

    private _numberOfSlots: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::RecyclerLogic()
    constructor(catalog: HabboCatalog, windowManager: IHabboWindowManager)
    {
        this._catalog = catalog;
        this._windowManager = windowManager;
        this._numberOfSlots = catalog.getInteger('recycler.number_of_slots', 5);
    }

    private get statusActive(): boolean
    {
        return this._localStatus !== RecyclerLogic.STATUS_OFF;
    }

    private get systemActive(): boolean
    {
        return this._systemStatus !== 2;
    }

    private get ready(): boolean
    {
        return this.active && this._localStatus === RecyclerLogic.STATUS_READY;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::get active()
    get active(): boolean
    {
        return this.statusActive && this.systemActive;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::get numberOfSlots()
    get numberOfSlots(): number
    {
        return this._numberOfSlots;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::dispose()
    dispose(): void
    {
        this._slots = [];
        this._catalog = null;
        this._windowManager = null;
        this._pendingPrizeCallback = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::init()
    init(visualization: IRecyclerVisualization | null = null): void
    {
        this._localStatus = RecyclerLogic.STATUS_WAITING_FOR_SERVER;
        this._slots = new Array<FurniSlotItem | null>(this._numberOfSlots).fill(null);

        if(visualization == null) return;

        this._visualization = visualization;
        this._catalog?.getRecyclerStatus();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::activate()
    activate(): void
    {
        if(this.systemActive) this._localStatus = RecyclerLogic.STATUS_READY;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::cancel()
    cancel(): void
    {
        this._catalog?.setupInventoryForRecycler(false);
        this.releaseAllSlots();
        this._localStatus = RecyclerLogic.STATUS_OFF;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::releaseAllSlots()
    releaseAllSlots(): void
    {
        if(!this.ready) return;

        for(let i = 0; i < this._numberOfSlots; i++)
        {
            const slot = this._slots[i];

            if(slot != null)
            {
                this._catalog?.returnInventoryFurniFromRecycler(slot.id);
                this._slots[i] = null;
            }
        }

        this.updateRecyclerSlots();
        this.updateRecyclerButton();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::empty()
    empty(): void
    {
        for(let i = 0; i < this._numberOfSlots; i++)
        {
            this.releaseSlot(i);
        }

        this.updateRecyclerSlots();
        this.updateRecyclerButton();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::secondsToWait()
    secondsToWait(): number
    {
        if(this._systemStatus === 3)
        {
            return Math.max(0, Math.ceil((this._nextRecycleAllowedTimestamp - performance.now()) / 1000));
        }

        return 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::setNextRecycleAllowedTimestamp()
    setNextRecycleAllowedTimestamp(timestamp: number): void
    {
        this._nextRecycleAllowedTimestamp = timestamp;

        if(this._nextRecycleAllowedTimestamp > performance.now()) this._systemStatus = 3;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::setSystemStatus()
    setSystemStatus(status: number, secondsUntilNext: number): void
    {
        this._systemStatus = status;
        this.setNextRecycleAllowedTimestamp(performance.now() + secondsUntilNext * 1000);

        if(!this.systemActive)
        {
            if(this._visualization == null || this._visualization.disposed) return;

            this._visualization.updateUI();

            return;
        }

        this._localStatus = RecyclerLogic.STATUS_READY;

        if(this._visualization == null || this._visualization.disposed) return;

        this._visualization.updateUI();
        this._catalog?.setupInventoryForRecycler(this._systemStatus !== 2);
        this.verifyRoomSessionStatus();
        this.updateRecyclerSlots();
        this.updateRecyclerButton();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::setFinished()
    setFinished(status: number, _prizeId: number): void
    {
        if(!this.statusActive) return;

        this._localStatus = RecyclerLogic.STATUS_READY;

        if(!this.systemActive) return;

        switch(status - 1)
        {
            case 0:
                this._visualization?.updateUI();
                break;
            case 1:
                log.info('* Recycler finished with FAILURE');
                this._windowManager?.alert('${generic.alert.title}', '${recycler.info.closed}', 0, (dialog) => dialog.dispose());
                this._visualization?.updateUI();
        }

        this.releaseAllSlots();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::getSlotContent()
    getSlotContent(slotId: number): FurniSlotItem | null
    {
        if(this._slots == null) return null;
        if(slotId >= this._slots.length) return null;

        return this._slots[slotId] ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::placeObjectAtSlot()
    placeObjectAtSlot(
        slotId: number,
        id: number,
        category: number,
        typeId: number,
        xxxExtra: string | null,
        findNewSlotId: boolean = false
    ): void
    {
        if(!this.ready) return;

        if(!findNewSlotId)
        {
            const oldObjectData = this._slots[slotId];

            if(oldObjectData != null) this.releaseSlot(slotId);
        }
        else if(this._slots.length > 0)
        {
            let newSlotId = 0;
            let oldObjectData: FurniSlotItem | null = this._slots[0] ?? null;

            while(oldObjectData !== null && newSlotId < this._numberOfSlots)
            {
                oldObjectData = this._slots[newSlotId] ?? null;

                if(oldObjectData !== null) newSlotId += 1;
            }

            if(oldObjectData !== null) return;

            slotId = newSlotId;
        }

        const itemId = this._catalog?.requestInventoryFurniToRecycler() ?? 0;

        if(itemId === 0)
        {
            this._windowManager?.alert('${generic.alert.title}', '${recycler.alert.non.recyclable}', 0, (dialog) => dialog.dispose());

            return;
        }

        this._slots[slotId] = new FurniSlotItem(itemId, category, typeId, xxxExtra);
        this.updateRecyclerSlots();
        this.updateRecyclerButton();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::releaseSlot()
    releaseSlot(slotId: number): void
    {
        if(!this.ready) return;

        const slot = this._slots[slotId];

        if(slot == null) return;

        if(!this._catalog?.returnInventoryFurniFromRecycler(slot.id)) return;

        this._slots[slotId] = null;
        this.updateRecyclerSlots();
        this.updateRecyclerButton();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::executeRecycler()
    executeRecycler(): void
    {
        if(!this.isReadyToRecycle()) return;

        this._localStatus = RecyclerLogic.STATUS_WAITING_FOR_SERVER;
        this.updateRecyclerButton();

        const itemIds: number[] = [];

        for(let i = 0; i < this._slots.length; i++)
        {
            const slot = this._slots[i];

            if(slot == null) return;

            itemIds.push(slot.id);
        }

        this._catalog?.sendRecycleItems(itemIds);
        this._visualization?.updateUI();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::isReadyToRecycle()
    isReadyToRecycle(): boolean
    {
        if(!this.ready || !this._catalog?.privateRoomSessionActive) return false;

        if(this.isTradingActive())
        {
            this._windowManager?.alert('${generic.alert.title}', '${recycler.alert.trading}', 0, (dialog) => dialog.dispose());

            return false;
        }

        return this.isPoolFull();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::get ducketCost()
    get ducketCost(): number
    {
        return this._catalog?.getInteger('recycler.ducket_cost', 0) ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::hasEnoughDuckets()
    hasEnoughDuckets(): boolean
    {
        return (this._catalog?.getPurse().getActivityPointsForType(0) ?? 0) >= this.ducketCost;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::get timeout()
    get timeout(): number
    {
        return this._catalog?.getInteger('recycler.timeout_seconds', 10) ?? 10;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::setRoomSessionActive()
    setRoomSessionActive(active: boolean): void
    {
        if(!active)
        {
            this.empty();
            this.verifyRoomSessionStatus();
        }

        this.updateRecyclerButton();
    }

    private verifyRoomSessionStatus(): void
    {
        if(!this._catalog?.privateRoomSessionActive && this.ready)
        {
            this._windowManager?.alert('${generic.alert.title}', '${recycler.alert.privateroom}', 0, (dialog) => dialog.dispose());
        }
    }

    private updateRecyclerSlots(): void
    {
        if(this._visualization == null || !this.statusActive) return;

        this._visualization.updateSlots();
    }

    private updateRecyclerButton(): void
    {
        if(this._visualization == null || !this.statusActive) return;

        this._visualization.updateRecycleButton();
    }

    private isPoolFull(): boolean
    {
        if(this._slots == null) return false;
        if(this._slots.length < this._numberOfSlots) return false;

        for(let i = 0; i < this._slots.length; i++)
        {
            if(this._slots[i] == null) return false;
        }

        return true;
    }

    private isTradingActive(): boolean
    {
        return this._catalog?.tradingActive ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::storePrizeTable()
    storePrizeTable(prizeLevels: PrizeLevelMessageData[]): void
    {
        if(!this._catalog) return;

        this._prizes = prizeLevels.map((level) => new PrizeLevelContainer(level, this._catalog!));

        if(this._pendingPrizeCallback != null)
        {
            this._pendingPrizeCallback(this._prizes);
            this._pendingPrizeCallback = null;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::getPrizeTable()
    getPrizeTable(callback: (prizes: PrizeLevelContainer[]) => void): PrizeLevelContainer[] | null
    {
        if(this._prizes == null)
        {
            this._pendingPrizeCallback = callback;
            this._catalog?.getRecyclerPrizes();

            return null;
        }

        return this._prizes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecyclerLogic.as::get recyclerDisabled()
    get recyclerDisabled(): boolean
    {
        return !this.systemActive;
    }
}
