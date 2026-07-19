import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {ActivityPointTypeEnum} from '../../purse/ActivityPointTypeEnum';
import {PurseUpdateEvent} from '../../purse/PurseUpdateEvent';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

/**
 * Shows "you have N <currency>" for the page's activity-point-priced offer (e.g. "you have 40
 * duckets"), hidden entirely for non-visible activity point types (NO_OP_1/2/4).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ActivityPointDisplayCatalogWidget.as
 */
export class ActivityPointDisplayCatalogWidget extends CatalogWidget
{
    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.page.viewer.catalog.events.off(PurseUpdateEvent.UPDATE, this.onPurseUpdate);
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.ACTIVITY_POINT_DISPLAY);

        const label = this.window.findChildByName('activity_points_txt');

        if(label) label.caption = '';

        this.page.viewer.catalog.events.on(PurseUpdateEvent.UPDATE, this.onPurseUpdate);

        return this.updateAmount();
    }

    private updateAmount(): boolean
    {
        if(this.disposed || this.window == null) return false;

        const catalog = this.page.viewer.catalog;
        const type = this.getActivityPointType();

        if(type < 1 || !ActivityPointTypeEnum.isVisible(type))
        {
            this.window.visible = false;

            return false;
        }

        catalog.localization?.registerParameter('catalog.purchase.youractivitypoints', 'activitypoints', String(catalog.getPurse().getActivityPointsForType(type)));
        catalog.localization?.registerParameter('catalog.purchase.youractivitypoints', 'currencyname', catalog.getActivityPointName(type));

        const label = this.window.findChildByName('activity_points_txt');

        if(label) label.caption = catalog.localization?.getLocalization('catalog.purchase.youractivitypoints') ?? '';

        const icon = this.window.findChildByName('activity_point_icon');

        if(icon) icon.style = ActivityPointTypeEnum.getIconStyleFor(type, catalog as unknown as IHabboConfigurationManager, true);

        this.window.visible = true;

        return true;
    }

    private onPurseUpdate = (_event: PurseUpdateEvent): void =>
    {
        this.updateAmount();
    };

    private getActivityPointType(): number
    {
        if(this.page?.offers == null) return 0;

        for(const offer of this.page.offers)
        {
            if(offer.activityPointType > 0) return offer.activityPointType;
        }

        return 0;
    }
}
