import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboCatalog} from '../../HabboCatalog';
import type {FrontPageItem} from '@habbo/communication/messages/incoming/catalog/FrontPageItem';
import {CatalogWidget} from './CatalogWidget';

/**
 * The catalog front-page promo banner grid: a fixed "first item" slot plus up to 3 more cloned
 * from a template list item, each linking to a catalog page/offer.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/FeaturedItemsCatalogWidget.as
 */
export class FeaturedItemsCatalogWidget extends CatalogWidget
{
    private _catalog: HabboCatalog | null;

    private _itemList: IItemListWindow | null = null;

    private _itemTemplate: IWindow | null = null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this._catalog = null;
        this._itemList?.dispose();
        this._itemList = null;
        this._itemTemplate?.dispose();
        this._itemTemplate = null;
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this._itemList = this.window.findChildByName('itemlist_featured') as unknown as IItemListWindow | null;
        this._itemTemplate = this._itemList?.getListItemByName('featured_item_template') ?? null;
        this._itemList?.removeListItems();

        const items = this._catalog?.frontPageItems;

        if(items == null || items.length === 0) return true;

        const firstItem = this.window.findChildByName('firstitem') as unknown as IWindowContainer | null;

        if(firstItem != null) this.populateItem(items[0]!, firstItem);

        for(let i = 1; i < Math.min(4, items.length); i++)
        {
            const item = this.createItemFromTemplate(items[i]!);

            if(item != null) this._itemList?.addListItem(item);
        }

        return true;
    }

    private createItemFromTemplate(item: FrontPageItem): IWindowContainer | null
    {
        const view = this._itemTemplate?.clone() as unknown as IWindowContainer | null;

        if(view == null) return null;

        return this.populateItem(item, view);
    }

    private populateItem(item: FrontPageItem, view: IWindowContainer): IWindowContainer
    {
        const title = view.findChildByName('item_title') as unknown as ITextWindow | null;

        if(title) title.text = item.itemName;

        if(item.itemPromoImage)
        {
            const imageUrl = this._catalog?.getProperty('image.library.url') ?? '';
            const image = view.findChildByName('item_image') as unknown as IStaticBitmapWrapperWindow | null;

            if(image) image.assetUri = imageUrl + item.itemPromoImage;
        }

        const eventCatcher = view.getChildByName('event_catcher_region') as unknown as IWindowContainer | null;

        if(eventCatcher) eventCatcher.procedure = this.eventProc;

        return view;
    }

    private eventProc = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_DOWN') return;

        const items = this._catalog?.frontPageItems;

        if(items == null) return;

        let index = this._itemList?.getListItemIndex(event.target?.parent as unknown as IWindow) ?? -1;

        index = index < 0 ? 0 : index + 1;

        const item = items[index];

        if(item == null) return;

        switch(item.type)
        {
            case 0:
                if(item.cataloguePageLocation === 'room_bundles_mobile')
                {
                    this._catalog?.openCatalogPage('room_bundles', 'NORMAL');
                }
                else if(item.cataloguePageLocation === 'mobile_subscriptions')
                {
                    this._catalog?.openCatalogPage('hc_membership', 'NORMAL');
                }
                else
                {
                    this._catalog?.openCatalogPage(item.cataloguePageLocation, 'NORMAL');
                }

                break;
            case 1:
                this._catalog?.openCatalogPageByOfferId(item.productOfferID, 'NORMAL');
                break;
        }
    };
}
