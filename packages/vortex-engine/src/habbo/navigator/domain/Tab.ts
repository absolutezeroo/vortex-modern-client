import type { IMessageComposer } from '@core/communication/messages/IMessageComposer';
import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { ITabButtonWindow } from '@core/window/components/ITabButtonWindow';
import type { IWindow } from '@core/window/IWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { ITabPageDecorator } from '../mainview/tabpagedecorators/ITabPageDecorator';
import type { ITransitionalMainViewCtrl } from '../mainview/ITransitionalMainViewCtrl';
import type { NavigatorData } from './NavigatorData';
import type { OfficialRoomEntryManager } from '../mainview/OfficialRoomEntryManager';

/**
 * Interface capturing all HabboNavigator members accessed by Tab, Tabs and TabPageDecorators.
 * Using this interface instead of the concrete class prevents circular imports.
 */
export interface ITabNavigator
{
    readonly mainViewCtrl: ITransitionalMainViewCtrl | null;
    readonly data: NavigatorData;
    readonly officialRoomEntryManager: OfficialRoomEntryManager;
    readonly context: { configuration: { getBoolean(key: string): boolean } };

    getText(key: string): string;

    openCatalogRoomAdsPage(): void;

    performCompetitionRoomsSearch(goalId: number, pageIndex: number): void;

    registerParameter(key: string, param: string, value: string): string;

    refreshButton(
        container: IWindowContainer,
        name: string,
        visible: boolean,
        callback: ((event: WindowEvent, window: IWindow) => void) | null,
        index: number,
        tooltip?: string | null
    ): void;

    trackNavigationDataPoint(category: string, action: string, label?: string, value?: number): void;

    send(composer: IMessageComposer<unknown[]>): void;
}

/**
 * Represents a single tab in the old navigator.
 *
 * @see sources/win63_version/habbo/navigator/domain/Tab.as
 */
export class Tab
{
    private _navigator: ITabNavigator;
    private _id: number;
    private _defaultSearchType: number;
    private _tabPageDecorator: ITabPageDecorator;
    private _searchMsg: number;
    private _selected: boolean = false;
    private _button: ITabButtonWindow | null = null;

    constructor(
        navigator: ITabNavigator,
        id: number,
        defaultSearchType: number,
        decorator: ITabPageDecorator,
        searchMsg: number = 1
    )
    {
        this._navigator = navigator;
        this._id = id;
        this._defaultSearchType = defaultSearchType;
        this._tabPageDecorator = decorator;
        this._searchMsg = searchMsg;
    }

    sendSearchRequest(): void
    {
        let searchType = this._defaultSearchType;
        const personalized = this._navigator.context.configuration.getBoolean('navigator.2014.personalized.navigator');

        if(personalized && this._id === 2)
        {
            searchType = 22;
        }

        this._navigator.mainViewCtrl?.startSearch(this._id, searchType, '-1', this._searchMsg);
    }

    get id(): number
    {
        return this._id;
    }

    get defaultSearchType(): number
    {
        return this._defaultSearchType;
    }

    get selected(): boolean
    {
        return this._selected;
    }

    set selected(value: boolean)
    {
        this._selected = value;
    }

    get tabPageDecorator(): ITabPageDecorator
    {
        return this._tabPageDecorator;
    }

    get searchMsg(): number
    {
        return this._searchMsg;
    }

    get button(): ITabButtonWindow | null
    {
        return this._button;
    }

    set button(value: ITabButtonWindow | null)
    {
        this._button = value;
    }
}
