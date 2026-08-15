import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {
    WiredChestItemsUpdatedMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/chests/WiredChestItemsUpdatedMessageEvent';
import {
    WiredChestItemsChunkMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/chests/WiredChestItemsChunkMessageEvent';
import type {
    WiredChestItemsUpdatedMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestItemsUpdatedMessageParser';
import type {
    WiredChestItemsChunkMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestItemsChunkMessageParser';
import type {
    ChestStorage
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/ChestStorage';
import {
    WithdrawChestItemsByTypeComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/WithdrawChestItemsByTypeComposer';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import {ChestType} from '../ChestType';
import type {IWiredChestControllerHost} from '../IWiredChestControllerHost';
import {WiredChestController} from '../WiredChestController';
import {AbstractChestSubController} from './AbstractChestSubController';
import {FurniChestView} from './views/FurniChestView';

/**
 * The furniture tab of a wired chest: the grid of items, and the withdraw path.
 *
 * **Contents arrive fragmented and are assembled here.** Fragment 0 is the one that resets — it
 * clears the view, drops the accumulated list and moves the chest to *opening*; the last fragment
 * moves it to *open* and hands the whole list to the view at once. Everything between just
 * accumulates.
 *
 * The two guards differ on purpose: fragment 0 checks the **requested** chest id (the reply to a
 * request still in flight) while `onItemsUpdated` checks the **active** one (a delta on the chest
 * already on screen).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/subcontrollers/FurniChestSubController.as
 */
export class FurniChestSubController extends AbstractChestSubController
{
    // AS3: FurniChestSubController.as::_SafeStr_4550 (name derived: the grid view)
    private _view: FurniChestView | null;

    // AS3: FurniChestSubController.as::_storages
    private _storages: ChestStorage[] = [];

    // AS3: FurniChestSubController.as::FurniChestSubController()
    constructor(parentController: IWiredChestControllerHost)
    {
        super(parentController);

        this.addMessageEvent(new WiredChestItemsUpdatedMessageEvent((event) => this.onItemsUpdated(event)));
        this.addMessageEvent(new WiredChestItemsChunkMessageEvent((event) => this.onItemsChunk(event)));

        this._view = new FurniChestView(this);
    }

    /**
	 * A delta: some ids left, some records arrived.
	 *
	 * AS3 rebuilds the whole list rather than splicing, and **de-duplicates the additions against
	 * what survived** — an id already present is dropped from the "added" set, so the view is never
	 * told to insert a cell it already has. Removals are collected separately because the view needs
	 * both halves to animate.
	 */
    // AS3: FurniChestSubController.as::onItemsUpdated()
    private onItemsUpdated(event: IMessageEvent): void
    {
        const parser = event.parser as WiredChestItemsUpdatedMessageParser;
        const host = this.parentController;

        if(host === null
            || host.activeChestId !== parser.chestId
            || host.status !== WiredChestController.STATUS_OPEN)
        {
            return;
        }

        const removedIds = new Set<number>(parser.removedIds);
        const survivors: ChestStorage[] = [];
        const removed: ChestStorage[] = [];
        const added: ChestStorage[] = [];
        const present = new Set<number>();

        for(const storage of this._storages)
        {
            if(removedIds.has(storage.inventoryId))
            {
                removed.push(storage);
            }
            else
            {
                survivors.push(storage);
                present.add(storage.inventoryId);
            }
        }

        for(const storage of parser.addedStorage)
        {
            if(present.has(storage.inventoryId)) continue;

            added.push(storage);
            survivors.push(storage);
            present.add(storage.inventoryId);
        }

        this._storages = survivors;
        this._view?.itemsUpdated(removed, added);
    }

    // AS3: FurniChestSubController.as::onItemsChunk()
    private onItemsChunk(event: IMessageEvent): void
    {
        const parser = event.parser as WiredChestItemsChunkMessageParser;
        const host = this.parentController;

        if(host === null) return;

        const chestId = parser.chestId;

        if(parser.fragmentNo === 0)
        {
            // Only the first fragment is checked, and against the *requested* id — later fragments
            // of an accepted stream are taken on trust.
            if(host.requestedChestId !== chestId) return;

            this._view?.clear();
            this._storages = [];
            host.setOpeningStatus(chestId);
        }

        for(const storage of parser.storageChunk)
        {
            this._storages.push(storage);
        }

        if(parser.fragmentNo === parser.totalFragments - 1)
        {
            host.setOpenStatus(chestId, this);
            this._view?.itemsInitialize(this._storages);
        }
    }

    // AS3: FurniChestSubController.as::withdrawItemsWithType()
    withdrawItemsWithType(itemType: ChestItemType, amount: number): void
    {
        this.parentController?.send(new WithdrawChestItemsByTypeComposer(this.viewingChestId, itemType, amount));
    }

    /**
	 * Empty in AS3 too — the per-type log view was never built, and the button that would call this
	 * does not exist in the layout.
	 */
    // AS3: FurniChestSubController.as::viewLogsWithType()
    viewLogsWithType(_itemType: ChestItemType): void
    {
    }

    // AS3: FurniChestSubController.as::get type()
    override get type(): number
    {
        return ChestType.TYPE_FURNI;
    }

    // AS3: FurniChestSubController.as::get title()
    override get title(): string
    {
        return this.localize('wiredchests.furni_chest');
    }

    // AS3: FurniChestSubController.as::get view()
    override get view(): IWindowContainer | null
    {
        return this._view?.container ?? null;
    }

    // AS3: FurniChestSubController.as::get isEmpty()
    override get isEmpty(): boolean
    {
        return this._storages.length === 0;
    }

    // AS3: FurniChestSubController.as::get itemCount()
    override get itemCount(): number
    {
        return this._storages.length;
    }

    // AS3: FurniChestSubController.as::clear()
    override clear(): void
    {
        this._storages = [];
        this._view?.clear();

        super.clear();
    }

    // AS3: FurniChestSubController.as::updateUI()
    override updateUI(): void
    {
        this._view?.updateUI();
    }

    // AS3: FurniChestSubController.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._view?.dispose();
        this._view = null;

        super.dispose();
    }
}
