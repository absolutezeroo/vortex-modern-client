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
    refreshCustomContent(container: IWindowContainer): void;

    tabSelected(): void;

    navigatorOpenedWhileInTab(): void;

    refreshFooter(container: IWindowContainer): void;

    readonly filterCategory: string | null;

    setSubSelection(value: number): void;

    processSearchParam(param: string): string;
}
