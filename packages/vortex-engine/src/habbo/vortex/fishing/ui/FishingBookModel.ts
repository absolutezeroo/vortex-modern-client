import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IInventoryModel} from '@habbo/inventory/IInventoryModel';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

import type {HabboFishing} from '../HabboFishing';
import {FishingBookView} from './FishingBookView';

/**
 * The fishing tab, as the inventory sees it.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §2.6.
 *
 * **This is the whole reason the tab needs almost no ported code touched.**
 * `HabboInventory.getCategoryWindowContainer()` looks a category up in a map of `IInventoryModel`,
 * so registering one under `'fishing'` is enough for the inventory to host it — no new branch in the
 * lookup, no special case in the view. The two lines that *are* needed are documented at their call
 * sites: one registration in `HabboInventory`, and the tab button in `InventoryMainView`.
 *
 * It holds no state. Everything drawn comes from `HabboFishing`, which holds what the server pushed.
 */
export class FishingBookModel implements IInventoryModel
{
    // TS-only: Vortex-only model — no AS3 counterpart for any member here.
    private readonly _view: FishingBookView;

    // TS-only: `IDisposable`, through `IInventoryModel`.
    private _disposed: boolean = false;

    // TS-only: Vortex-only model.
    constructor(
        fishing: HabboFishing,
        windowManager: IHabboWindowManager,
        localizations: IHabboLocalizationManager | null = null,
        assets: IAssetLibrary | null = null
    )
    {
        this._view = new FishingBookView(fishing, windowManager, localizations, assets);
    }

    // TS-only: `IInventoryModel` contract — the container the inventory parents and stretches.
    public getWindowContainer(): IWindowContainer | null
    {
        return this._view.getWindowContainer();
    }

    /**
     * Nothing to request. The definitions and the records are pushed, not fetched — an inventory
     * that asked for them would be asking for something it already has.
     */
    // TS-only: `IInventoryModel` contract.
    public requestInitialization(): void
    {
        this._view.update();
    }

    // TS-only: `IInventoryModel` contract.
    public categorySwitch(_category: string): void
    {
        this._view.update();
    }

    // TS-only: `IInventoryModel` contract — fishing has no sub-categories.
    public subCategorySwitch(_category: string): void
    {
    }

    // TS-only: `IInventoryModel` contract.
    public closingInventoryView(): void
    {
    }

    // TS-only: `IInventoryModel` contract — the inventory's own redraw hook.
    public updateView(): void
    {
        this._view.update();
    }

    /** No per-item selection: a species row is a record, not something you can pick up. */
    // TS-only: `IInventoryModel` contract.
    public selectItemById(_itemId: string): void
    {
    }

    // TS-only: `IDisposable`, through `IInventoryModel`.
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // TS-only: `IDisposable`, through `IInventoryModel`.
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._view.dispose();
    }
}
