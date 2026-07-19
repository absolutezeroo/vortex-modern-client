import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import {AlertView} from './AlertView';

/**
 * Club promotion alert with call-to-action to the catalog club page.
 *
 * @see sources/win63_version/habbo/navigator/ClubPromoAlertView.as
 */
export class ClubPromoAlertView extends AlertView
{
    private _text: string;
    private _promoText: string;

    constructor(navigator: IHabboTransitionalNavigator, caption: string, bodyText: string, promoText: string)
    {
        super(navigator, 'nav_promo_alert', caption);
        this._text = bodyText;
        this._promoText = promoText;
    }

    protected override setupAlertWindow(window: IWindow): void
    {
        const content = (window as any).content as IWindowContainer;

        if(!content) return;

        const bodyText = content.findChildByName('body_text');

        if(bodyText)
        {
            bodyText.caption = this._text;
        }

        const promoText = content.findChildByName('promo_text');

        if(promoText)
        {
            promoText.caption = this._promoText;
        }

        const okButton = content.findChildByName('ok');

        if(okButton)
        {
            okButton.addEventListener('WME_CLICK', this.onOk);
        }

        const promoContainer = content.findChildByName('promo_container');

        if(promoContainer)
        {
            promoContainer.addEventListener('WME_CLICK', this.onPromo);
        }
    }

    private onOk = (_event: WindowEvent): void =>
    {
        this.dispose();
    };

    private onPromo = (_event: WindowEvent): void =>
    {
        this.navigator?.openCatalogClubPage('ClubPromoAlertView');
        this.dispose();
    };
}
