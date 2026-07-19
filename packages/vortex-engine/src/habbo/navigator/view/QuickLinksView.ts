import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboNewNavigator} from '../HabboNewNavigator';
import type {NavigatorSavedSearch} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSavedSearch';
import {SearchContext} from '../context';

/**
 * Quick links view displaying saved searches in the navigator left pane.
 *
 * Each quick link corresponds to a saved search that can be clicked to
 * perform that search directly.
 *
 * @see sources/win63_version/habbo/navigator/view/QuickLinksView.as
 */
export class QuickLinksView
{
    private _navigator: HabboNewNavigator;
    private _searchContexts: SearchContext[] = [];
    private _searchIds: number[] = [];

    constructor(navigator: HabboNewNavigator)
    {
        this._navigator = navigator;
    }

    private _template: IWindowContainer | null = null;

    set template(value: IWindowContainer)
    {
        this._template = value;
    }

    private _itemList: IItemListWindow | null = null;

    set itemList(value: IItemListWindow)
    {
        this._itemList = value;
    }

    /**
	 * Populate quick links from saved searches.
	 *
	 * @param savedSearches - The list of saved searches from the server
	 *
	 * @see sources/win63_version/habbo/navigator/view/QuickLinksView.as setQuickLinks()
	 */
    setQuickLinks(savedSearches: NavigatorSavedSearch[]): void
    {
        if(!this._itemList || !this._template) return;

        this._itemList.removeListItems();
        this._searchContexts = [];
        this._searchIds = [];

        for(let i = 0; i < savedSearches.length; i++)
        {
            const savedSearch = savedSearches[i];
            const link = this._template.clone() as IWindowContainer;

            link.id = i;

            const textEl = link.findChildByName('quick_link_text');

            if(textEl)
            {
                let caption = this._navigator.getLocalization(
                    'navigator.searchcode.title.' + savedSearch.searchCode,
                    savedSearch.searchCode
                );

                if(savedSearch.filter !== '')
                {
                    caption += ' - ' + savedSearch.filter;
                }

                if(savedSearch.searchCode.indexOf('category__') === 0)
                {
                    caption = savedSearch.searchCode.substr('category__'.length);

                    if(savedSearch.filter !== '')
                    {
                        caption += ' - ' + savedSearch.filter;
                    }
                }

                textEl.caption = caption;
            }

            link.procedure = this.listItemProcedure;

            const removeQuickLink = link.findChildByName('remove_quick_link');

            if(removeQuickLink)
            {
                removeQuickLink.procedure = this.listItemProcedure;
            }

            this._searchContexts.push(new SearchContext(savedSearch.searchCode, savedSearch.filter));
            this._searchIds.push(savedSearch.id);

            this._itemList.addListItem(link as unknown as IWindow);
        }
    }

    private listItemProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            if(window.name === 'remove_quick_link')
            {
                const parent = window.parent;

                if(!parent)
                {
                    return;
                }

                const parentId = parent.id;

                if(parentId >= 0 && parentId < this._searchIds.length)
                {
                    this._navigator.deleteSavedSearch(this._searchIds[parentId]);
                }
            }
            else if(window.name === 'quick_link')
            {
                const id = window.id;

                if(id >= 0 && id < this._searchContexts.length)
                {
                    const context = this._searchContexts[id];

                    this._navigator.performSearchByContext(context);
                    this._navigator.trackEventLog(
                        'savedsearch.execute',
                        'SavedSearch',
                        context.searchCode + (context.filtering === '' ? '' : ':' + context.filtering)
                    );
                }
            }
        }
        else if(event.type === 'WME_OVER')
        {
            const containerWindow = window.name === 'remove_quick_link' ? window.parent : window;

            if(!containerWindow)
            {
                return;
            }

            const container = containerWindow as unknown as IWindowContainer;

            const closeBtn = container.findChildByName?.('remove_quick_link') ?? container.getChildAt?.(1);

            if(closeBtn)
            {
                closeBtn.visible = true;
            }
        }
        else if(event.type === 'WME_OUT')
        {
            const container = window as unknown as IWindowContainer;
            const closeBtn = container.findChildByName?.('remove_quick_link') ?? container.getChildAt?.(1);

            if(closeBtn)
            {
                closeBtn.visible = false;
            }
        }
    };
}
