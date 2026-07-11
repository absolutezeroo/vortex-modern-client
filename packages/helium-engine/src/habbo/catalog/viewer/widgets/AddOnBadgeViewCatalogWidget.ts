import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

/**
 * Shows the badge that comes bundled with the currently selected offer (e.g. a club-day offer's
 * loyalty badge), via the shared `IBadgeImageWidget`.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/AddOnBadgeViewCatalogWidget.as
 */
export class AddOnBadgeViewCatalogWidget extends CatalogWidget
{
    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.ADD_ON_BADGE_VIEW);
        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);

        return true;
    }

    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        if(this.disposed || !event.offer.badgeCode) return;

        const badge = (this.window.findChildByName('badge') as unknown as IWidgetWindow | null)?.widget as IBadgeImageWidget | null;

        if(badge) badge.badgeId = event.offer.badgeCode;
    };
}
