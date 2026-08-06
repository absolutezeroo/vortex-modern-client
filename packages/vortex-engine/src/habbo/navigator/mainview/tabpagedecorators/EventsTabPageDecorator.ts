import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IDropMenuWindow } from '@core/window/components/IDropMenuWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { ITabPageDecorator } from './ITabPageDecorator';
import type { ITabNavigator } from '../../domain/Tab';
import { Logger } from '@core/utils/Logger';

const log = Logger.getLogger('habbo.navigator.mainview.tabpagedecorators.EventsTabPageDecorator');

/**
 * Tab page decorator for the Events / Room Ads tab.
 *
 * Populates the room ad filter dropdown, handles its selection changes,
 * and wires the "Get Event" footer button.
 *
 * @see sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as
 */
export class EventsTabPageDecorator implements ITabPageDecorator
{
    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::_navigator
    private _navigator: ITabNavigator;
    private _filter: IDropMenuWindow | null = null;

    constructor(navigator: ITabNavigator)
    {
        this._navigator = navigator;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::refreshCustomContent()
    refreshCustomContent(container: IWindowContainer): void
    {
        const header = container.findChildByName('room_ad_header') as IWindowContainer | null;

        if(!header) return;

        if(this._filter === null || (this._filter as unknown as { disposed?: boolean }).disposed)
        {
            this._filter = header.findChildByName('roomAdFilter') as IDropMenuWindow | null;
            this.prepareFilter();

            if(this._filter)
            {
                this._filter.addEventListener('WE_SELECTED', this.onFilterSelected);
            }
        }

        header.visible = true;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::tabSelected()
    tabSelected(): void
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return;

        this._filter.removeEventListener('WE_SELECTED', this.onFilterSelected);
        this._filter.selection = 0;
        this._filter.addEventListener('WE_SELECTED', this.onFilterSelected);
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::refreshFooter()
    refreshFooter(container: IWindowContainer): void
    {
        const footer = container.findChildByName('room_ads_footer') as IWindowContainer | null;

        if(!footer) return;

        const getEventButton = footer.findChildByName('get_event_but');

        if(getEventButton)
        {
            getEventButton.addEventListener('WME_CLICK', this.onGetEventClick);
        }

        footer.visible = true;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::navigatorOpenedWhileInTab()
    navigatorOpenedWhileInTab(): void
    {
        this.startSearch();
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::get filterCategory()
    get filterCategory(): string | null
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return null;

        return this._filter.enumerateSelection()[this._filter.selection] ?? null;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::setSubSelection()
    setSubSelection(_value: number): void
    {
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::processSearchParam()
    processSearchParam(param: string): string
    {
        return param;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::prepareFilter()
    private prepareFilter(): void
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return;

        const items = [
            this._navigator.getText('navigator.roomad.topads'),
            this._navigator.getText('navigator.roomad.newads'),
        ];

        this._filter.populate(items);
        this._filter.selection = 0;
    }

    private onFilterSelected = (_event: WindowEvent): void =>
    {
        this.startSearch();
    };

    private onGetEventClick = (_event: WindowEvent): void =>
    {
        this._navigator.openCatalogRoomAdsPage();
    };

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::startSearch()
    private startSearch(): void
    {
        let searchType = 16;

        if(this._filter && !(this._filter as unknown as { disposed?: boolean }).disposed)
        {
            searchType = this.getSearchType(this._filter.selection);
        }

        this._navigator.mainViewCtrl?.startSearch(1, searchType);
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/EventsTabPageDecorator.as::getSearchType()
    private getSearchType(index: number): number
    {
        switch(index)
        {
            case 0: return 16;
            case 1: return 17;
            default:
                log.warn('Invalid index for room ad search type: ' + index);
                return 0;
        }
    }
}
