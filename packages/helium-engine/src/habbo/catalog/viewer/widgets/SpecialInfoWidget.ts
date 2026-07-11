import type {IWindowContainer} from '@core/window/IWindowContainer';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

/**
 * Hides the "special" info label as soon as a product is selected.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/SpecialInfoWidget.as
 */
export class SpecialInfoWidget extends CatalogWidget
{
    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.SPECIAL_INFO);

        const label = this.window.findChildByName('ctlg_special_txt');

        if(label) label.caption = '';

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);

        return true;
    }

    private onPreviewProduct = (_event: SelectProductEvent): void =>
    {
        this.window.visible = false;
    };
}
