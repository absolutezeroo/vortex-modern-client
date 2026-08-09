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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as::_navigator
    private _navigator: IOfficialTabNavigator;

    constructor(navigator: IOfficialTabNavigator)
    {
        this._navigator = navigator;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as::refreshCustomContent()
    refreshCustomContent(_container: IWindowContainer): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as::tabSelected()
    tabSelected(): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as::refreshFooter()
    refreshFooter(container: IWindowContainer): void
    {
        this._navigator.officialRoomEntryManager.refreshAdFooter(container);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as::navigatorOpenedWhileInTab()
    navigatorOpenedWhileInTab(): void
    {
        this._navigator.mainViewCtrl?.startSearch(4, 11, '-1', 4);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as::get filterCategory()
    get filterCategory(): string | null
    {
        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as::setSubSelection()
    setSubSelection(_value: number): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/OfficialTabPageDecorator.as::processSearchParam()
    processSearchParam(param: string): string
    {
        return param;
    }
}
