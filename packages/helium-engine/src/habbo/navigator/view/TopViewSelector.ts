import type {IWindow} from '@core/window/IWindow';
import type {ITabButtonWindow} from '@core/window/components/ITabButtonWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboNewNavigator} from '../HabboNewNavigator';

/**
 * Top-level view selector tabs in the navigator.
 *
 * Creates one tab per top-level search context (official, myworld, hotel, etc.)
 * and wires click handlers to perform searches.
 *
 * @see sources/win63_version/habbo/navigator/view/TopViewSelector.as
 */
export class TopViewSelector
{
    private _navigator: HabboNewNavigator;

    constructor(navigator: HabboNewNavigator)
    {
        this._navigator = navigator;
    }

    private _template: ITabButtonWindow | null = null;

    set template(value: ITabButtonWindow)
    {
        this._template = value;
    }

    private _tabContext: ITabContextWindow | null = null;

    set tabContext(value: ITabContextWindow)
    {
        this._tabContext = value;
    }

    /**
	 * Refresh tabs by clearing and recreating from top-level searches.
	 *
	 * @see sources/win63_version/habbo/navigator/view/TopViewSelector.as refresh()
	 */
    refresh(): void
    {
        if(!this._tabContext || !this._template) return;

        this.clearTabs();

        const topLevelSearches = this._navigator.contextContainer.getTopLevelSearches();

        for(let i = 0; i < topLevelSearches.length; i++)
        {
            const searchCode = topLevelSearches[i];
            const tab = this._template.clone() as ITabButtonWindow;

            tab.caption = '${navigator.toplevelview.' + searchCode + '}';
            tab.id = i;
            tab.procedure = this.topViewSelectorButtonProcedure;

            this._tabContext.addTabItem(tab);
        }
    }

    /**
	 * Select a tab by its index.
	 *
	 * @param index - The tab index to select
	 *
	 * @see sources/win63_version/habbo/navigator/view/TopViewSelector.as selectTabByIndex()
	 */
    selectTabByIndex(index: number): void
    {
        if(!this._tabContext || !this._tabContext.selector) return;

        const tab = this._tabContext.getTabItemAt(index);

        if(tab)
        {
            (this._tabContext.selector as { setSelected(item: IWindow): void }).setSelected(tab);
        }
    }

    private clearTabs(): void
    {
        if(!this._tabContext) return;

        const count = this._tabContext.numTabItems;

        for(let i = 0; i < count; i++)
        {
            const tab = this._tabContext.getTabItemAt(0);

            if(tab)
            {
                this._tabContext.removeTabItem(tab);
            }
        }
    }

    private topViewSelectorButtonProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            const topLevelSearches = this._navigator.contextContainer.getTopLevelSearches();

            if(topLevelSearches.length > window.id)
            {
                const filterText = this._navigator.view?.currentFilterText() ?? '';

                this._navigator.performSearch(topLevelSearches[window.id], '', filterText);
            }
        }
    };
}
