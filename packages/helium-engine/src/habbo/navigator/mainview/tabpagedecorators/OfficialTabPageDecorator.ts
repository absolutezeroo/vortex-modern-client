import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { OfficialRoomEntryManager } from '../OfficialRoomEntryManager';
import type { ITabPageDecorator } from './ITabPageDecorator';
import type { ITabNavigator } from '../../domain/Tab';

export interface IOfficialTabNavigator extends ITabNavigator
{
    readonly officialRoomEntryManager: OfficialRoomEntryManager;
}

/**
 * Tab page decorator for the Official rooms tab.
 *
 * @see sources/win63_version/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as
 */
export class OfficialTabPageDecorator implements ITabPageDecorator
{
    private _navigator: IOfficialTabNavigator;

    constructor(navigator: IOfficialTabNavigator)
    {
        this._navigator = navigator;
    }

    refreshCustomContent(_container: IWindowContainer): void
    {
    }

    tabSelected(): void
    {
    }

    refreshFooter(container: IWindowContainer): void
    {
        this._navigator.officialRoomEntryManager.refreshAdFooter(container);
    }

    navigatorOpenedWhileInTab(): void
    {
        this._navigator.mainViewCtrl?.startSearch(4, 11, '-1', 4);
    }

    get filterCategory(): string | null
    {
        return null;
    }

    setSubSelection(_value: number): void
    {
    }

    processSearchParam(param: string): string
    {
        return param;
    }
}
