import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IDropMenuWindow } from '@core/window/components/IDropMenuWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { ITabPageDecorator } from './ITabPageDecorator';
import type { ITabNavigator } from '../../domain/Tab';
import { Logger } from '@core/utils/Logger';

const log = Logger.getLogger('RoomsTabPageDecorator');

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
    private _navigator: ITabNavigator;
    private _filter: IDropMenuWindow | null = null;
    private _personalized: boolean = false;

    constructor(navigator: ITabNavigator)
    {
        this._navigator = navigator;
    }

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

    tabSelected(): void
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return;

        this._filter.removeEventListener('WE_SELECTED', this.onFilterSelected);
        this._filter.selection = this.defaultSelection;
        this._filter.addEventListener('WE_SELECTED', this.onFilterSelected);
    }

    refreshFooter(container: IWindowContainer): void
    {
        this._navigator.officialRoomEntryManager.refreshAdFooter(container);
    }

    navigatorOpenedWhileInTab(): void
    {
        this.startSearch();
    }

    get filterCategory(): string | null
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return null;

        return this._filter.enumerateSelection()[this._filter.selection] ?? null;
    }

    setSubSelection(_value: number): void
    {
    }

    processSearchParam(param: string): string
    {
        return param;
    }

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
