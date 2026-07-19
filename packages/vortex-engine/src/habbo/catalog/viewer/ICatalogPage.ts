import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {ICatalogViewer} from './ICatalogViewer';
import type {IPageLocalization} from './IPageLocalization';

/**
 * A loaded catalog page: its window, offers, and localization/layout metadata.
 *
 * @see sources/win63_version/habbo/catalog/viewer/class_2044.as
 */
export interface ICatalogPage
{
    dispose(): void;

    init(): void;

    closed(): void;

    dispatchWidgetEvent(event: unknown): boolean;

    readonly window: IWindowContainer;

    readonly viewer: ICatalogViewer;

    readonly pageId: number;

    readonly offers: IPurchasableOffer[];

    readonly localization: IPageLocalization;

    readonly layoutCode: string;

    readonly hasLinks: boolean;

    readonly links: string[];

    selectOffer(offerId: number): void;

    replaceOffers(offers: IPurchasableOffer[], keepSelection?: boolean): void;

    updateLimitedItemsLeft(offerId: number, itemsLeft: number): void;

    readonly acceptSeasonCurrencyAsCredits: boolean;

    readonly allowDragging: boolean;

    searchPageId: number;

    readonly mode: number;

    readonly isBuilderPage: boolean;
}
