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
    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as::_navigator
    private _navigator: ITabNavigator;

    constructor(navigator: ITabNavigator)
    {
        this._navigator = navigator;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as::refreshCustomContent()
    refreshCustomContent(_container: IWindowContainer): void
    {
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as::tabSelected()
    tabSelected(): void
    {
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as::navigatorOpenedWhileInTab()
    navigatorOpenedWhileInTab(): void
    {
        this._navigator.mainViewCtrl?.startSearch(6, 21);
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as::refreshFooter()
    refreshFooter(_container: IWindowContainer): void
    {
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as::get filterCategory()
    get filterCategory(): string | null
    {
        return null;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as::setSubSelection()
    setSubSelection(_value: number): void
    {
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/CategoriesTabPageDecorator.as::processSearchParam()
    processSearchParam(_param: string): string
    {
        return '';
    }
}
