import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ClubBuyController} from './ClubBuyController';
import type {ClubBuyOfferData} from './ClubBuyOfferData';

/**
 * Standalone Club/VIP buy confirmation dialog. Real but currently unreachable - see
 * ClubBuyController.showConfirmation()'s note.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubBuyConfirmationDialog.as
 */
export class ClubBuyConfirmationDialog
{
    private _offer: ClubBuyOfferData | null;

    private _controller: ClubBuyController | null;

    private _window: IWindowContainer | null = null;

    private _pageId: number;

    constructor(controller: ClubBuyController, offer: ClubBuyOfferData, pageId: number)
    {
        this._offer = offer;
        this._controller = controller;
        this._pageId = pageId;

        this.showConfirmation();
    }

    dispose(): void
    {
        this._controller = null;
        this._offer = null;
        this._window?.dispose();
        this._window = null;
    }

    showConfirmation(): void
    {
        if(!this._offer || !this._controller) return;

        this._window = this._controller.catalog?.utils.createWindow('club_buy_confirmation') as unknown as IWindowContainer | null;

        if(!this._window) return;

        this._window.procedure = this.windowEventHandler;
        this._window.center();

        if(this._controller.catalog?.getBoolean('disclaimer.credit_spending.enabled'))
        {
            this.setDisclaimerAccepted(false);
        }
        else
        {
            this._window.findChildByName('disclaimer')?.dispose();
            this.setDisclaimerAccepted(true);
        }

        const localization = this._controller.localization;
        const purse = this._controller.getPurse();
        const prefix = purse?.hasClubLeft && purse.isVIP ? 'extension.' : 'subscription.';
        const unit = this._offer.months === 0 ? 'days' : 'months';
        const key = `catalog.vip.buy.confirm.${prefix}${unit}`;

        localization?.registerParameter(key, `num_${unit}`, String(this._offer.months === 0 ? this._offer.extraDays : this._offer.months));

        const subscriptionName = this._window.findChildByName('subscription_name');

        if(subscriptionName) subscriptionName.caption = localization?.getLocalization(key) ?? '';

        localization?.registerParameter('catalog.vip.buy.confirm.end_date', 'day', String(this._offer.day));
        localization?.registerParameter('catalog.vip.buy.confirm.end_date', 'month', String(this._offer.month));
        localization?.registerParameter('catalog.vip.buy.confirm.end_date', 'year', String(this._offer.year));

        const priceBox = this._window.findChildByName('purchase_cost_box') as unknown as IWindowContainer | null;

        if(priceBox) this._controller.catalog?.utils.showPriceInContainer(priceBox, this._offer);
    }

    private setDisclaimerAccepted(accepted: boolean): void
    {
        if(this._window == null) return;

        const button = this._window.findChildByName('select_button');

        if(button == null) return;

        if(accepted) button.enable();
        else button.disable();
    }

    private windowEventHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(!event || !window || !this._controller || !this._offer) return;

        if(event.type !== WindowMouseEvent.CLICK && event.type !== WindowMouseEvent.DOUBLE_CLICK) return;

        switch(window.name)
        {
            case 'spending_disclaimer':
                this.setDisclaimerAccepted((window as unknown as ISelectableWindow).isSelected);

                break;
            case 'select_button':
                this._controller.catalog?.doNotCloseAfterVipPurchase();
                this._controller.confirmSelection(this._offer, this._pageId);

                break;
            case 'header_button_close':
            case 'cancel_button':
                this._controller.catalog?.forgetPageDuringVipPurchase();
                this._controller.closeConfirmation();

                break;
        }
    };
}
