import type { IWindowContainer } from '@core/window/IWindowContainer';

/**
 * Interface for tab page decorators in the old navigator.
 *
 * Each decorator handles tab-specific content, footer, and search behaviour.
 *
 * @see sources/win63_version/habbo/navigator/mainview/tabpagedecorators/ITabPageDecorator.as
 */
export interface ITabPageDecorator
{
    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/ITabPageDecorator.as::refreshCustomContent()
    refreshCustomContent(container: IWindowContainer): void;

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/ITabPageDecorator.as::tabSelected()
    tabSelected(): void;

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/ITabPageDecorator.as::navigatorOpenedWhileInTab()
    navigatorOpenedWhileInTab(): void;

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/ITabPageDecorator.as::refreshFooter()
    refreshFooter(container: IWindowContainer): void;

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/ITabPageDecorator.as::get filterCategory()
    readonly filterCategory: string | null;

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/ITabPageDecorator.as::setSubSelection()
    setSubSelection(value: number): void;

    // AS3: sources/win63_version/habbo/navigator/mainview/tabpagedecorators/ITabPageDecorator.as::processSearchParam()
    processSearchParam(param: string): string;
}
