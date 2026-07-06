import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ITabButtonWindow} from '@core/window/components/ITabButtonWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {CatalogNavigator} from './navigation/CatalogNavigator';
import type {ICatalogNode} from './navigation/ICatalogNode';

/**
 * Manages the top tab bar of the (tabbed) catalog navigator: one tab per top-level category.
 *
 * @see sources/win63_version/habbo/catalog/TopViewSelector.as
 */
export class TopViewSelector
{
    private _catalog: CatalogNavigator;

    private _tabTemplate: ITabButtonWindow;

    private _tabContext: ITabContextWindow;

    constructor(catalog: CatalogNavigator, tabContext: ITabContextWindow)
    {
        this._catalog = catalog;
        this._tabContext = tabContext;

        const template = tabContext.getTabItemAt(0)!.clone() as ITabButtonWindow;

        this._tabTemplate = template;
        this._tabContext.removeTabItem(template);
    }

    addTabItem(node: ICatalogNode): void
    {
        const tab = this._tabTemplate.clone() as ITabButtonWindow;

        tab.caption = node.localization;
        tab.name = node.pageName;
        tab.procedure = this.topViewSelectorButtonProcedure.bind(this);
        this._tabContext.addTabItem(tab);
        this.alignTabs();
    }

    private alignTabs(): void
    {
        for(let i = 0; i < this._tabContext.numTabItems; i++)
        {
            const tab = this._tabContext.getTabItemAt(i)!;

            tab.width = tab.parent!.width / this._tabContext.numTabItems;
        }
    }

    clearTabs(): void
    {
        while(this._tabContext.numTabItems > 0)
        {
            this._tabContext.removeTabItem(this._tabContext.getTabItemAt(0)!);
        }
    }

    selectTabByIndex(index: number): void
    {
        const tab = this._tabContext.getTabItemAt(index);

        if(!tab) return;

        this._tabContext.selector?.setSelected(tab);
        this.selectTabButton(tab);
    }

    private topViewSelectorButtonProcedure(event: WindowEvent, window: IWindow): void
    {
        if(event.type === 'WME_CLICK')
        {
            const tab = window as ITabButtonWindow;

            if(tab)
            {
                this.selectTabButton(tab);
            }
        }
    }

    private selectTabButton(tab: ITabButtonWindow | null): void
    {
        if(!tab) return;

        const node = this._catalog.getNodeByName(tab.name);

        if(node != null)
        {
            this._catalog.showNodeContent(node);
        }
    }
}
