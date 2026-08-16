import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {ITabButtonWindow} from '@core/window/components/ITabButtonWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';

import {HabbiconTabMode} from './HabbiconTabMode';

/**
 * The three tabs at the top of the hub.
 *
 * **`select()` and `onTabSelected()` guard on the same field from opposite directions**, which is
 * what stops a programmatic selection from bouncing back through the callback: `select()` writes
 * `_activeMode` *before* touching the selector, so the WE_SELECTED it triggers finds the mode
 * unchanged and returns.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconTabView.as
 */
export class HabbiconTabView implements IDisposable
{
    // AS3: HabbiconTabView.as::_window
    private _window: IWindowContainer | null;

    // AS3: HabbiconTabView.as::_SafeStr_7980 (name derived: the tab-changed callback)
    private _onTabChanged: ((mode: string) => void) | null;

    // AS3: HabbiconTabView.as::_activeMode
    private _activeMode: string | null = null;

    // AS3: HabbiconTabView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconTabView.as::HabbiconTabView()
    constructor(window: IWindowContainer | null, onTabChanged: (mode: string) => void)
    {
        this._window = window;
        this._onTabChanged = onTabChanged;

        this.tabAllSets?.addEventListener('WE_SELECTED', this.onTabSelected);
        this.tabOwned?.addEventListener('WE_SELECTED', this.onTabSelected);
        this.tabFavourited?.addEventListener('WE_SELECTED', this.onTabSelected);
    }

    // AS3: HabbiconTabView.as::select()
    select(mode: string): void
    {
        const tab = this.getTabByMode(mode);

        if(tab === null) return;

        if(mode === this._activeMode) return;

        this._activeMode = mode;

        const selector = this.tabContext?.selector ?? null;

        if(selector !== null && selector.getSelected() !== (tab as unknown as IWindow))
        {
            selector.setSelected(tab as unknown as ISelectableWindow);
        }
    }

    // AS3: HabbiconTabView.as::onTabSelected()
    private onTabSelected = (event: WindowEvent): void =>
    {
        const mode = HabbiconTabView.getModeByTab(event.target as IWindow | null);

        if(mode === null || mode === this._activeMode) return;

        this._activeMode = mode;
        this._onTabChanged?.(mode);
    };

    // AS3: HabbiconTabView.as::getModeByTab()
    private static getModeByTab(tab: IWindow | null): string | null
    {
        switch(tab?.name)
        {
            case 'tab_all_sets': return HabbiconTabMode.ALL_SETS;
            case 'tab_owned': return HabbiconTabMode.OWNED;
            case 'tab_favourited': return HabbiconTabMode.FAVOURITED;
            default: return null;
        }
    }

    // AS3: HabbiconTabView.as::getTabByMode()
    private getTabByMode(mode: string): ITabButtonWindow | null
    {
        switch(mode)
        {
            case HabbiconTabMode.ALL_SETS: return this.tabAllSets;
            case HabbiconTabMode.OWNED: return this.tabOwned;
            case HabbiconTabMode.FAVOURITED: return this.tabFavourited;
            default: return null;
        }
    }

    // AS3: HabbiconTabView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconTabView.as::get tabContext()
    private get tabContext(): ITabContextWindow | null
    {
        return (this._window?.findChildByName('tab_context') as ITabContextWindow | null) ?? null;
    }

    // AS3: HabbiconTabView.as::get tabAllSets()
    private get tabAllSets(): ITabButtonWindow | null
    {
        return (this._window?.findChildByName('tab_all_sets') as ITabButtonWindow | null) ?? null;
    }

    // AS3: HabbiconTabView.as::get tabOwned()
    private get tabOwned(): ITabButtonWindow | null
    {
        return (this._window?.findChildByName('tab_owned') as ITabButtonWindow | null) ?? null;
    }

    // AS3: HabbiconTabView.as::get tabFavourited()
    private get tabFavourited(): ITabButtonWindow | null
    {
        return (this._window?.findChildByName('tab_favourited') as ITabButtonWindow | null) ?? null;
    }

    // AS3: HabbiconTabView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.tabAllSets?.removeEventListener('WE_SELECTED', this.onTabSelected);
        this.tabOwned?.removeEventListener('WE_SELECTED', this.onTabSelected);
        this.tabFavourited?.removeEventListener('WE_SELECTED', this.onTabSelected);

        this._onTabChanged = null;
        this._activeMode = null;
        this._window = null;
        this._disposed = true;
    }
}
