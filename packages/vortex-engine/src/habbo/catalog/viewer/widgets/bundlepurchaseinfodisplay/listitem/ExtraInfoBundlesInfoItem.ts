import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IWindow} from '@core/window/IWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboCatalog} from '../../../../HabboCatalog';
import type {BundlePurchaseExtraInfoWidget} from '../../BundlePurchaseExtraInfoWidget';
import {CatalogWidgetBundleDisplayExtraInfoEvent} from '../../events/CatalogWidgetBundleDisplayExtraInfoEvent';
import type {ExtraInfoItemData} from '../ExtraInfoItemData';
import {ExtraInfoListItem} from '../ExtraInfoListItem';

/**
 * Clickable row explaining that a bundle discount was applied; clicking it re-opens the promo
 * item (see BundlePurchaseExtraInfoWidget.onExtraInfoItemClickedEvent()).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoBundlesInfoItem.as
 */
export class ExtraInfoBundlesInfoItem extends ExtraInfoListItem
{
    private _catalog: HabboCatalog;

    private _window: IWindowContainer | null = null;

    private _widget: BundlePurchaseExtraInfoWidget;

    constructor(widget: BundlePurchaseExtraInfoWidget, id: number, data: ExtraInfoItemData, catalog: HabboCatalog)
    {
        super(widget, id, data, ExtraInfoListItem.ALIGN_OVERLAY, true);

        this._catalog = catalog;
        this._widget = widget;
    }

    override getRenderedWindow(): IWindowContainer | null
    {
        if(this._window == null)
        {
            this.createWindow();
        }

        return this._window;
    }

    private createWindow(): void
    {
        this._window = this._catalog.utils.createWindow('bundlesInfoItem') as unknown as IWindowContainer;
        this._window.procedure = this.windowProcedure;
    }

    private windowProcedure = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this._widget.events.emit(
                CatalogWidgetBundleDisplayExtraInfoEvent.ITEM_CLICKED,
                new CatalogWidgetBundleDisplayExtraInfoEvent(CatalogWidgetBundleDisplayExtraInfoEvent.ITEM_CLICKED, this.data, this.id)
            );
        }
    };
}
