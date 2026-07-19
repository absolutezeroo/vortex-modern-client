import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import {ButtonElementHandler} from './ButtonElementHandler';

/**
 * Button that opens a specific catalog page, or the catalog root if none
 * is configured.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/CatalogButtonElementHandler.as
 */
export class CatalogButtonElementHandler extends ButtonElementHandler
{
    private _pageName: string | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/CatalogButtonElementHandler.as::initialize()
    override initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        super.initialize(landingView, window, params, ownerWidget);
        this._pageName = params[2];
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/CatalogButtonElementHandler.as::onClick()
    protected override onClick(): void
    {
        if(this._pageName)
        {
            this.landingView?.catalog?.openCatalogPage(this._pageName);
        }
        else
        {
            this.landingView?.catalog?.openCatalog();
        }

        this.landingView?.tracking?.trackGoogle('landingView', 'click_genericcatalog');
    }
}
