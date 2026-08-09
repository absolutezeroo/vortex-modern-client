import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IDropMenuWindow } from '@core/window/components/IDropMenuWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { ITabPageDecorator } from './ITabPageDecorator';
import type { ITabNavigator } from '../../domain/Tab';
import { Logger } from '@core/utils/Logger';

const log = Logger.getLogger('habbo.navigator.mainview.tabpagedecorators.RoomsTabPageDecorator');

/**
 * Tab page decorator for the Rooms (popular/categories) tab.
 *
 * Populates a room-category dropdown with popular rooms, highest-score,
 * recommended rooms (if personalised navigator enabled) and visible flat categories.
 *
 * @see sources/win63_version/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as
 */
export class RoomsTabPageDecorator implements ITabPageDecorator
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::_navigator
    private _navigator: ITabNavigator;
    private _filter: IDropMenuWindow | null = null;
    private _personalized: boolean = false;

    constructor(navigator: ITabNavigator)
    {
        this._navigator = navigator;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::refreshCustomContent()
    refreshCustomContent(container: IWindowContainer): void
    {
        const header = container.findChildByName('rooms_header') as IWindowContainer | null;

        if(!header) return;

        if(this._filter === null || (this._filter as unknown as { disposed?: boolean }).disposed)
        {
            this._filter = header.findChildByName('roomCtgFilter') as IDropMenuWindow | null;
            this.prepareRoomCategories();

            if(this._filter)
            {
                this._filter.addEventListener('WE_SELECTED', this.onFilterSelected);
            }
        }

        header.visible = true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::prepareRoomCategories()
    prepareRoomCategories(): void
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return;

        this._personalized = this._navigator.context.configuration.getBoolean('navigator.2014.personalized.navigator');

        const items: string[] = [
            this._navigator.getText('navigator.navisel.popularrooms'),
            this._navigator.getText('navigator.navisel.highestscore'),
        ];

        if(this._personalized)
        {
            items.push(this._navigator.getText('navigator.navisel.recommendedrooms'));
        }

        for(const cat of this._navigator.data.visibleCategories)
        {
            items.push(cat.nodeName);
        }

        this._filter.populate(items);
        this._filter.selection = this.defaultSelection;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::tabSelected()
    tabSelected(): void
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return;

        this._filter.removeEventListener('WE_SELECTED', this.onFilterSelected);
        this._filter.selection = this.defaultSelection;
        this._filter.addEventListener('WE_SELECTED', this.onFilterSelected);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::refreshFooter()
    refreshFooter(container: IWindowContainer): void
    {
        this._navigator.officialRoomEntryManager.refreshAdFooter(container);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::navigatorOpenedWhileInTab()
    navigatorOpenedWhileInTab(): void
    {
        this.startSearch();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::get filterCategory()
    get filterCategory(): string | null
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return null;

        return this._filter.enumerateSelection()[this._filter.selection] ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::setSubSelection()
    setSubSelection(_value: number): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::processSearchParam()
    processSearchParam(param: string): string
    {
        return param;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::get defaultSelection()
    private get defaultSelection(): number
    {
        return this._personalized ? 2 : 0;
    }

    private onFilterSelected = (_event: WindowEvent): void =>
    {
        this.startSearch();

        if(this._filter && !(this._filter as unknown as { disposed?: boolean }).disposed)
        {
            this._navigator.trackNavigationDataPoint(
                this._filter.enumerateSelection()[this._filter.selection] ?? '',
                'category.view'
            );
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/RoomsTabPageDecorator.as::startSearch()
    private startSearch(): void
    {
        const filter = this._filter;
        const selection = (filter && !(filter as unknown as { disposed?: boolean }).disposed)
            ? filter.selection
            : this.defaultSelection;

        log.debug('Room filter changed: ' + selection);

        if(selection === 0)
        {
            this._navigator.mainViewCtrl?.startSearch(2, 1);
        }
        else if(selection === 1)
        {
            this._navigator.mainViewCtrl?.startSearch(2, 2);
        }
        else if(selection === 2 && this._personalized)
        {
            this._navigator.mainViewCtrl?.startSearch(2, 22);
        }
        else
        {
            let offset = 2;

            if(this._personalized) offset++;

            const cat = this._navigator.data.visibleCategories[selection - offset];

            if(cat === undefined)
            {
                log.warn('No flat category found for index: ' + selection);
                return;
            }

            log.debug('Searching with catId: ' + cat.nodeId);
            this._navigator.mainViewCtrl?.startSearch(2, 1, '' + cat.nodeId);
        }
    }
}
