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
    // AS3: sources/win63_version/habbo/catalog/viewer/class_2109.as::dispose()
    dispose(): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2109.as::showCatalogPage()
    showCatalogPage(
        pageId: number,
        layoutCode: string,
        localization: IPageLocalization,
        offers: IPurchasableOffer[],
        offerId: number,
        acceptSeasonCurrencyAsCredits: boolean
    ): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2109.as::dispatchWidgetEvent()
    dispatchWidgetEvent(event: unknown): boolean;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2109.as::get catalog()
    readonly catalog: IHabboCatalog;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2109.as::get roomEngine()
    readonly roomEngine: IRoomEngine;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2109.as::getCurrentLayoutCode()
    getCurrentLayoutCode(): string;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_2109.as::get viewerTags()
    readonly viewerTags: string[];
}
