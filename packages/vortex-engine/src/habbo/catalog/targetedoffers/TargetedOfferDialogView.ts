import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {ActivityPointTypeEnum} from '../purse/ActivityPointTypeEnum';
import type {TargetedOffer} from './data/TargetedOffer';
import type {OfferController} from './OfferController';
import {OfferView} from './OfferView';

/**
 * The full targeted-offer dialog: art, price, countdown, quantity and a buy button.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as
 */
export class TargetedOfferDialogView extends OfferView
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::IMAGE_DEFAULT_URL
    private static readonly IMAGE_DEFAULT_URL: string = 'targetedoffers/offer_default.png';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::_SafeStr_5777 (the quantity)
    private _quantity: number = 1;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::TargetedOfferDialogView()
    constructor(controller: OfferController, offer: TargetedOffer)
    {
        super(controller, offer);
    }

    /**
     * Built from a *named* layout rather than in the constructor, because the controller may
     * substitute a campaign-specific one — see `OfferController.maximizeOffer()`.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::buildWindow()
    buildWindow(layoutName: string): void
    {
        const catalog = this._controller?.catalog ?? null;

        if(catalog == null || catalog.windowManager == null) return;

        this._window = catalog.windowManager.buildWidgetLayout(layoutName) as IWindowContainer | null;

        if(this._window == null) return;

        const frameTitle = (this._window as unknown as IFrameWindow).title ?? null;

        if(frameTitle) frameTitle.text = this.getLocalization(this._offer!.title) ?? '';

        const title = this._window.findChildByName('txt_title') as unknown as ITextWindow | null;

        if(title) title.text = this.getLocalization(this._offer!.title) ?? '';

        const description = this._window.findChildByName('txt_description') as unknown as ITextWindow | null;

        if(description)
        {
            description.text = this.getLocalization(this._offer!.description) ?? '';
            this.setLinkStyle(description);
        }

        const priceLabel = this._window.findChildByName('txt_price_label') as unknown as ITextWindow | null;

        if(priceLabel) priceLabel.text = this.getLocalization('targeted.offer.price.label') ?? '';

        this.renderPrice(this._window, catalog.utils.getPriceMap(this._offer!, this._quantity));

        const illustration = this._window.findChildByName('bmp_illustration') as unknown as IStaticBitmapWrapperWindow | null;

        if(illustration)
        {
            const libraryUrl = catalog.getProperty('image.library.url');

            let image = this.getPreviewImageOverride(this._offer!);

            if(image == null || image.length === 0)
            {
                image = this._offer!.imageUrl && this._offer!.imageUrl.length > 0
                    ? this._offer!.imageUrl
                    : TargetedOfferDialogView.IMAGE_DEFAULT_URL;
            }

            illustration.assetUri = libraryUrl + image;
        }

        this._timeLeftTemplate = this.getLocalization('targeted.offer.timeleft', '') ?? '';

        if(this._offer!.expirationTime === 0)
        {
            const timeLeftContainer = this._window.findChildByName('cnt_time_left');

            if(timeLeftContainer) timeLeftContainer.visible = false;
        }
        else
        {
            this.startUpdateTimer();
        }

        const quantityInput = this._window.findChildByName('quantity_input') as unknown as ITextFieldWindow | null;

        if(quantityInput) quantityInput.addEventListener('WKE_KEY_UP', this.onQuantityInputEvent);

        this._window.procedure = this.onInput;
        this._window.center();

        this.updatePriceText();
        this.updateButtonStates();
    }

    /**
     * The activity-point half of the price falls back to "0" with the credits icon (type 5) when
     * the offer has no activity-point component, rather than being hidden — the layout keeps both
     * slots.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::renderPrice()
    private renderPrice(window: IWindowContainer | null, prices: Map<string, {amount: number; activityPointType?: number}>): void
    {
        if(window == null) return;

        const credits = prices.get('credit');
        const creditsField = window.findChildByName('txt_price_credits');

        if(creditsField) creditsField.caption = String(credits?.amount ?? '');

        const activityPoints = prices.get('activityPoint');
        const activityPointsField = window.findChildByName('txt_price_activityPoints');

        if(activityPoints != null)
        {
            if(activityPointsField) activityPointsField.caption = String(activityPoints.amount);

            this.setActivityPointIconStyle('activityPoints_icon', window, activityPoints.activityPointType ?? 0);
        }
        else
        {
            if(activityPointsField) activityPointsField.caption = '0';

            this.setActivityPointIconStyle('activityPoints_icon', window, 5);
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::setActivityPointIconStyle()
    private setActivityPointIconStyle(name: string, window: IWindowContainer, type: number): void
    {
        const icon = window.findChildByName(name);
        const configuration = (this._controller?.catalog?.context?.configuration ?? null) as unknown as IHabboConfigurationManager | null;

        if(icon == null || configuration == null) return;

        icon.style = ActivityPointTypeEnum.getIconStyleFor(type, configuration, true);
    }

    /**
     * The countdown is split across three fields, not one: the template's text before `%timeleft%`
     * goes in one label, the number in the middle, and the tail in a third. That is how the layout
     * can style the number differently from the words around it.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::setTimeLeft()
    protected override setTimeLeft(text: string): void
    {
        const field = this._window?.findChildByName('txt_time_left') as unknown as ITextWindow | null;

        if(!field) return;

        field.text = text;

        if(!this._timeLeftTemplate) return;

        const placeholderIndex = Math.max(this._timeLeftTemplate.indexOf('%timeleft%'), 0);

        const before = this._window?.findChildByName('txt_time_left_label_1') as unknown as ITextWindow | null;

        if(before) before.text = this._timeLeftTemplate.substring(0, Math.max(placeholderIndex - 1, 0));

        const after = this._window?.findChildByName('txt_time_left_label_2') as unknown as ITextWindow | null;

        if(after) after.text = this._timeLeftTemplate.substring(placeholderIndex + 10);
    }

    /**
     * `arrangeListItems()` twice is AS3's own — the button bar's width only settles on the second
     * pass, once the first has applied the buttons' new visibility.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::updateButtonStates()
    updateButtonStates(): void
    {
        if(this._window == null || this._offer == null) return;

        const status = this._window.findChildByName('txt_status') as unknown as ITextWindow | null;

        if(!status) return;

        const affordable = this._offer.checkPurseBalance(this._controller?.catalog?.getPurse() ?? null, this._quantity);

        if(affordable) status.text = '';
        else this._window.findChildByName('btn_buy')?.disable();

        const quantityContainer = this._window.findChildByName('cnt_quantity');

        if(quantityContainer) quantityContainer.visible = this._offer.purchaseLimit > 1;

        const getCredits = this._window.findChildByName('btn_get_credits');

        if(getCredits) getCredits.visible = !affordable;

        const buyButton = this._window.findChildByName('btn_buy');

        if(buyButton)
        {
            if(affordable && this.isQuantityValid()) buyButton.enable();
            else buyButton.disable();
        }

        const buttonBar = this._window.findChildByName('itemlist_buttonbar') as unknown as IItemListWindow | null;

        if(buttonBar)
        {
            buttonBar.arrangeListItems();
            buttonBar.arrangeListItems();
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::updatePriceText()
    private updatePriceText(): void
    {
        if(this._window == null || this._offer == null) return;

        const credits = this._window.findChildByName('txt_price_credits') as unknown as ITextWindow | null;

        if(credits) credits.text = `${this._quantity * this._offer.priceInCredits}`;

        const activityPoints = this._window.findChildByName('txt_price_activityPoints') as unknown as ITextWindow | null;

        if(activityPoints) activityPoints.text = `${this._quantity * this._offer.priceInActivityPoints}`;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::onInput()
    private onInput = (event: WindowEvent, target: IWindow): void =>
    {
        if(!this._controller || event.type !== 'WME_DOWN') return;

        switch(target?.name)
        {
            case 'header_button_close':
                this._controller.minimizeOffer(this._offer!);
                break;
            case 'btn_get_credits':
                this._controller.purchaseCredits(this._offer!);
                break;
            case 'btn_buy':
                if(!this.isQuantityValid()) return;

                this._controller.showConfirmation(this._offer!, this._quantity);
        }
    };

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::isQuantityValid()
    private isQuantityValid(): boolean
    {
        return this._quantity >= 1 && this._quantity <= (this._offer?.purchaseLimit ?? 0);
    }

    /**
     * Rejects the keystroke by writing the previous quantity back into the field — including the
     * `parseInt` of a non-numeric entry, which is why an empty field is allowed through (it parses
     * to 0 but the caption is `""`) while "abc" is not.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::onQuantityInputEvent()
    private onQuantityInputEvent = (event: WindowEvent): void =>
    {
        const field = event.target as unknown as ITextFieldWindow | null;

        if(field == null) return;

        const value = parseInt(field.caption, 10) || 0;

        if((value === 0 && field.caption !== '') || value > 999 || value > (this._offer?.purchaseLimit ?? 0))
        {
            field.caption = this._quantity.toString();

            return;
        }

        this._quantity = value;

        this.updatePriceText();
        this.updateButtonStates();
    };

    /**
     * Underline only, with no colour — so a link in an offer description keeps whatever colour the
     * layout gives the surrounding text.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::setLinkStyle()
    private setLinkStyle(field: ITextWindow): void
    {
        if(!field) return;

        field.styleSheet = 'a:link { text-decoration: underline; }';
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferDialogView.as::getPreviewImageOverride()
    private getPreviewImageOverride(offer: TargetedOffer): string
    {
        return this._controller?.catalog?.getProperty(`targeted.offer.override.preview_image.${offer.id}`) ?? '';
    }
}
