import type {HabboLandingView} from '../HabboLandingView';
import {CatalogPromoWidget} from './CatalogPromoWidget';

/**
 * Subclass of `CatalogPromoWidget` using the `catalog_promo_small` layout.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidgetSmall.as
 */
export class CatalogPromoWidgetSmall extends CatalogPromoWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidgetSmall.as::CatalogPromoWidgetSmall()
    constructor(landingView: HabboLandingView)
    {
        super(landingView);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/CatalogPromoWidgetSmall.as::get xmlAssetName()
    protected override get xmlAssetName(): string
    {
        return 'catalog_promo_small';
    }
}
