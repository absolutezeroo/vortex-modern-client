import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {TargetedOffer} from './data/TargetedOffer';
import type {OfferController} from './OfferController';
import {OfferView} from './OfferView';

/**
 * The confirm step for a targeted-offer purchase.
 *
 * The spending disclaimer is a config-gated checkbox that gates the buy button: with
 * `disclaimer.credit_spending.enabled` off, the whole block is disposed and the button starts
 * enabled instead.
 *
 * Cancelling does not close the flow — it goes back to the full offer dialog, which is why both
 * the close cross and the cancel button call `maximizeOffer()`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferPurchaseConfirmationView.as
 */
export class TargetedOfferPurchaseConfirmationView extends OfferView
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferPurchaseConfirmationView.as::_SafeStr_5777 (the quantity)
    private _quantity: number;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferPurchaseConfirmationView.as::TargetedOfferPurchaseConfirmationView()
    constructor(controller: OfferController, offer: TargetedOffer, quantity: number)
    {
        super(controller, offer);

        this._quantity = quantity;

        const catalog = controller.catalog;

        this._window = catalog.windowManager?.buildWidgetLayout('targeted_offer_purchase_confirmation_xml') as IWindowContainer | null;

        if(this._window == null) return;

        if(catalog.getBoolean('disclaimer.credit_spending.enabled'))
        {
            this.setDisclaimerAccepted(false);
        }
        else
        {
            this._window.findChildByName('disclaimer')?.dispose();
            this.setDisclaimerAccepted(true);
        }

        const productName = this._window.findChildByName('product_name') as unknown as ITextWindow | null;

        if(productName) productName.text = this.getLocalization(offer.title) ?? '';

        const costBox = this._window.findChildByName('purchase_cost_box') as IWindowContainer | null;

        if(costBox) catalog.utils.showPriceInContainer(costBox, offer, quantity);

        const quantityField = this._window.findChildByName('quantity') as unknown as ITextWindow | null;

        if(quantityField != null && catalog.multiplePurchaseEnabled && this._quantity > 1)
        {
            quantityField.text = `X ${this._quantity}`;
        }

        this._window.procedure = this.onInput;
        this._window.center();
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferPurchaseConfirmationView.as::setDisclaimerAccepted()
    private setDisclaimerAccepted(accepted: boolean): void
    {
        if(this._window == null) return;

        const selectButton = this._window.findChildByName('select_button');

        if(selectButton == null) return;

        if(accepted) selectButton.enable();
        else selectButton.disable();
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferPurchaseConfirmationView.as::onInput()
    private onInput = (event: WindowEvent, target: IWindow): void =>
    {
        if(!this._controller || event.type !== 'WME_DOWN') return;

        switch(target?.name)
        {
            case 'spending_disclaimer':
                this.setDisclaimerAccepted((target as unknown as ISelectableWindow).isSelected);
                break;
            case 'header_button_close':
            case 'cancel_button':
                this._controller.maximizeOffer(this._offer!);
                break;
            case 'buy_button':
                this._controller.purchaseTargetedOffer(this._offer!, this._quantity);
        }
    };
}
