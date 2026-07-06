import type {IHabboCatalog} from '../IHabboCatalog';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {IPageLocalization} from './IPageLocalization';

/**
 * Owns the catalog page window(s): shows a page's contents and dispatches widget events.
 *
 * @see sources/win63_version/habbo/catalog/viewer/class_2109.as
 */
export interface ICatalogViewer
{
    dispose(): void;

    showCatalogPage(
        pageId: number,
        layoutCode: string,
        localization: IPageLocalization,
        offers: IPurchasableOffer[],
        offerId: number,
        acceptSeasonCurrencyAsCredits: boolean
    ): void;

    dispatchWidgetEvent(event: unknown): boolean;

    readonly catalog: IHabboCatalog;

    readonly roomEngine: IRoomEngine;

    getCurrentLayoutCode(): string;

    readonly viewerTags: string[];
}
