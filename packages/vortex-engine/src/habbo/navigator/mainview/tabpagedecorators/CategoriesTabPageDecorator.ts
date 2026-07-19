import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { ITabPageDecorator } from './ITabPageDecorator';
import type { ITabNavigator } from '../../domain/Tab';

/**
 * Tab page decorator for the Categories tab.
 *
 * @see sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as
 */
export class CategoriesTabPageDecorator implements ITabPageDecorator
{
    private _navigator: ITabNavigator;

    constructor(navigator: ITabNavigator)
    {
        this._navigator = navigator;
    }

    refreshCustomContent(_container: IWindowContainer): void
    {
    }

    tabSelected(): void
    {
    }

    navigatorOpenedWhileInTab(): void
    {
        this._navigator.mainViewCtrl?.startSearch(6, 21);
    }

    refreshFooter(_container: IWindowContainer): void
    {
    }

    get filterCategory(): string | null
    {
        return null;
    }

    setSubSelection(_value: number): void
    {
    }

    processSearchParam(_param: string): string
    {
        return '';
    }
}
