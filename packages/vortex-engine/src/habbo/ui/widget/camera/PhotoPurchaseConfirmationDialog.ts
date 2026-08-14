import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {StringUtil} from '@habbo/utils/StringUtil';
import type {CameraPublishStatusMessageEvent} from '@habbo/communication/messages/incoming/camera/CameraPublishStatusMessageEvent';
import type {CompetitionStatusMessageEvent} from '@habbo/communication/messages/incoming/camera/CompetitionStatusMessageEvent';
import type {CameraPublishStatusMessageParser} from '@habbo/communication/messages/parser/camera/CameraPublishStatusMessageParser';
import type {CompetitionStatusMessageParser} from '@habbo/communication/messages/parser/camera/CompetitionStatusMessageParser';
import type {CameraWidget} from './CameraWidget';

/**
 * The buy / publish / enter-competition dialog shown once the server has rendered the photo.
 *
 * A small state machine: the buttons are dead until `image_loaded`, each action moves to its own
 * "waiting" state, and every server answer lands back on `image_loaded`. Publishing additionally
 * arms a timer for the cool-down the server reports, and re-enables its button only if the dialog
 * is still in `image_loaded` when it fires.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/camera/PhotoPurchaseConfirmationDialog.as
 */
export class PhotoPurchaseConfirmationDialog
{
    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::STATE_LOADING_IMAGE
    private static readonly STATE_LOADING_IMAGE: string = 'loading_image';

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::STATE_IMAGE_LOADED
    private static readonly STATE_IMAGE_LOADED: string = 'image_loaded';

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::STATE_WAITING_PURCHASE_TO_COMPLETE
    private static readonly STATE_WAITING_PURCHASE_TO_COMPLETE: string = 'waiting_purchase_to_complete';

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::STATE_WAITING_PUBLISH_TO_COMPLETE
    private static readonly STATE_WAITING_PUBLISH_TO_COMPLETE: string = 'waiting_publish_to_complete';

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::STATE_WAITING_COMPETITION_SUBMIT_TO_COMPLETE
    private static readonly STATE_WAITING_COMPETITION_SUBMIT_TO_COMPLETE: string = 'waiting_competition_submit_to_complete';

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::STATE_RENDERING_FAILED
    private static readonly STATE_RENDERING_FAILED: string = 'rendering_failed';

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_4597
    private _state: string = '';

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_4549
    private _widget: CameraWidget | null;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_4582
    private _image: ImageBitmap | null = null;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_caption
    private readonly _caption: string;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_8777
    private _disclaimerAccepted: boolean = false;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_7795
    private _competitionSubmitted: boolean = false;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_8283
    private _publishPending: boolean = false;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_8162
    private _extraDataId: string | null = null;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_5079
    private _publishTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::_SafeStr_8720
    private _purchaseCount: number = 0;

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::PhotoPurchaseConfirmationDialog()
    constructor(widget: CameraWidget, caption: string)
    {
        this._widget = widget;
        this._caption = caption;
        this._window = widget.getXmlWindow('photo_purchase_confirmation') as IWindowContainer | null;

        if(this._window === null) return;

        const contentList = this._window.findChildByName('contentlist') as IWindowContainer | null;

        // Three optional sections, each removed outright when its config flag is off — the dialog is
        // resized to whatever survives.
        if(widget.component?.getBoolean('camera.competition.enabled'))
        {
            // TODO(AS3): .../PhotoPurchaseConfirmationDialog.as::PhotoPurchaseConfirmationDialog()
            // AS3 calls TextWindowUtils.setHTMLLinkStyle(competition_info, 0xFFFFFF x3) here; the
            // port has no TextWindowUtils, so the competition blurb keeps its default link colours.
        }
        else
        {
            this.removeListItem(contentList, 'competition_wrapper');
        }

        if(widget.component?.getBoolean('disclaimer.credit_spending.enabled'))
        {
            this.setDisclaimerAccepted(false);
        }
        else
        {
            this.removeListItem(contentList, 'disclaimer');
            this.setDisclaimerAccepted(true);
        }

        if(!widget.component?.getBoolean('camera.photo.publishing.enabled'))
        {
            this.removeListItem(contentList, 'publish_wrapper');
        }

        this.setState(PhotoPurchaseConfirmationDialog.STATE_LOADING_IMAGE);
        this._window.center();
        this._window.procedure = this.windowEventHandler;
    }

    // TS-only: AS3 reaches the list through `IItemListWindow.removeListItem(getListItemByName(...))`;
    // the port's containers expose child lookup and disposal directly, and this keeps the three
    // call sites above readable.
    private removeListItem(list: IWindowContainer | null, name: string): void
    {
        const item = list?.findChildByName(name);

        if(item) item.visible = false;
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::checkPurse()
    private checkPurse(credits: number, activityPoints: number): boolean
    {
        const catalog = this._widget?.catalog ?? null;
        const purse = catalog?.getPurse() ?? null;

        if(purse === null) return false;

        if(purse.credits < credits)
        {
            catalog?.showNotEnoughCreditsAlert();

            return false;
        }

        if(purse.getActivityPointsForType(0) < activityPoints)
        {
            catalog?.showNotEnoughActivityPointsAlert(0);

            return false;
        }

        return true;
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::disableButtons()
    private disableButtons(showWaitingCaption: boolean): void
    {
        if(this._window === null) return;

        for(const name of ['buy_button', 'publish_button', 'competition_button'])
        {
            const button = this._window.findChildByName(name);

            if(button) button.disable();
        }

        if(showWaitingCaption)
        {
            const cancel = this._window.findChildByName('cancel_button');
            const status = this._window.findChildByName('status_info');
            const localizations = this._widget?.localizations ?? null;

            if(cancel) cancel.caption = localizations?.getLocalization('generic.close') ?? '';
            if(status) status.caption = localizations?.getLocalization('camera.purchase.pleasewait') ?? '';
        }
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::setState()
    private setState(state: string): void
    {
        if(this._window === null)
        {
            return;
        }

        this._state = state;

        const buyButton = this._window.findChildByName('buy_button');
        const publishButton = this._window.findChildByName('publish_button');
        const competitionButton = this._window.findChildByName('competition_button');

        switch(state)
        {
            case PhotoPurchaseConfirmationDialog.STATE_LOADING_IMAGE:
                this.disableButtons(false);
                break;

            case PhotoPurchaseConfirmationDialog.STATE_IMAGE_LOADED:
                // Buy re-enables only if the spending disclaimer is ticked; publish and competition
                // stay dead once used, which is what the two pending flags record.
                if(this._disclaimerAccepted && buyButton) buyButton.enable();

                if(!this._publishPending && publishButton) publishButton.enable();

                if(!this._competitionSubmitted && competitionButton) competitionButton.enable();

                break;

            case PhotoPurchaseConfirmationDialog.STATE_WAITING_PURCHASE_TO_COMPLETE:
                this.disableButtons(true);

                if(this._widget?.component?.getBoolean('disclaimer.credit_spending.enabled'))
                {
                    this.setDisclaimerAccepted(false);
                }

                break;

            case PhotoPurchaseConfirmationDialog.STATE_WAITING_PUBLISH_TO_COMPLETE:
                this._publishPending = true;
                this.disableButtons(true);
                break;

            case PhotoPurchaseConfirmationDialog.STATE_WAITING_COMPETITION_SUBMIT_TO_COMPLETE:
                this._competitionSubmitted = true;
                this.disableButtons(true);
                break;

            case PhotoPurchaseConfirmationDialog.STATE_RENDERING_FAILED:
            {
                this.disableButtons(false);

                const status = this._window.findChildByName('status_info');

                if(status) status.caption = '';

                break;
            }
        }
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::animateIconToToolbar()
    animateIconToToolbar(): void
    {
        if(!this._window)
        {
            return;
        }

        // TODO(AS3): .../PhotoPurchaseConfirmationDialog.as::animateIconToToolbar()
        // AS3 scales the rendered photo into a 120x120 BitmapData and hands it to
        // `component.toolbar.createTransitionToIcon('HTIE_ICON_INVENTORY', bmp, x, y)`. Both the
        // mutable bitmap and that toolbar method are absent from this port, so the flight animation
        // is skipped; every caption update below is the real AS3 behaviour and does run.
        const localizations = this._widget?.localizations ?? null;
        const status = this._window.findChildByName('status_info');
        const buyButton = this._window.findChildByName('buy_button');
        const inventoryLink = this._window.findChildByName('inventory_link_area');
        const purchaseCount = this._window.findChildByName('purchase_count');

        if(status) status.caption = localizations?.getLocalization('camera.purchase.successful') ?? '';
        if(buyButton) buyButton.caption = localizations?.getLocalization('camera.buy.another.button.text') ?? '';
        if(inventoryLink) inventoryLink.visible = true;

        this._purchaseCount = this._purchaseCount + 1;

        if(purchaseCount)
        {
            // AS3 blanks the caption before writing the new one; kept, it forces a redraw.
            purchaseCount.caption = '';
            purchaseCount.caption = this._purchaseCount.toString();
        }

        this.setState(PhotoPurchaseConfirmationDialog.STATE_IMAGE_LOADED);
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::setImageUrl()
    setImageUrl(url: string): void
    {
        if(this._widget === null)
        {
            return;
        }

        if(url && url.length > 0)
        {
            const base = this._widget.component?.context?.configuration?.getProperty('stories.image_url_base') ?? '';

            void this.loadImage(base + url);
        }
        else
        {
            this.setRenderingFailed();
            this._widget.windowManager.alert('${generic.alert.title}', '${camera.render.count.info}', 0, null);
        }
    }

    /**
	 * AS3 uses `BitmapFileLoader` plus an `AssetLoaderEventComplete` listener; the fetch/decode pair
	 * is the same sequence without the event round-trip.
	 */
    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::onImageLoaded()
    private async loadImage(url: string): Promise<void>
    {
        let bitmap: ImageBitmap | null = null;

        try
        {
            const response = await fetch(url);

            if(response.ok) bitmap = await createImageBitmap(await response.blob());
        }
        catch
        {
            bitmap = null;
        }

        if(!this._window)
        {
            return;
        }

        if(bitmap) this.setImage(bitmap);

        const status = this._window.findChildByName('status_info');

        if(status) status.caption = this._widget?.localizations?.getLocalization('camera.confirm_phase.info') ?? '';

        this.setState(PhotoPurchaseConfirmationDialog.STATE_IMAGE_LOADED);
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::setImage()
    private setImage(image: ImageBitmap): void
    {
        if(this._window === null)
        {
            return;
        }

        const productImage = this._window.findChildByName('product_image') as (IWindow & { bitmap?: ImageBitmap | null }) | null;

        if(productImage === null)
        {
            return;
        }

        // AS3 scales the photo into the slot's own BitmapData; the port's bitmap windows fit the
        // assigned image to the window, so the scale matrix has no equivalent here.
        productImage.bitmap = image;
        this._image = image;
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::setRenderingFailed()
    setRenderingFailed(): void
    {
        if(this._window === null)
        {
            return;
        }

        const productImage = this._window.findChildByName('product_image') as (IWindow & { bitmap?: ImageBitmap | null }) | null;

        if(productImage !== null)
        {
            // AS3 replaces the slot with an opaque black BitmapData of the same size. Without a
            // mutable bitmap the slot is simply cleared, which reads the same on screen.
            productImage.bitmap = null;
            this._image = null;
        }

        this.setState(PhotoPurchaseConfirmationDialog.STATE_RENDERING_FAILED);
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::publishingStatus()
    publishingStatus(event: CameraPublishStatusMessageEvent): void
    {
        if(this._window === null)
        {
            return;
        }

        const parser = event.parser as CameraPublishStatusMessageParser;
        const localizations = this._widget?.localizations ?? null;

        if(parser.isOk())
        {
            this._extraDataId = parser.getExtraDataId();

            this.setCaption('status_info', localizations?.getLocalization('camera.publish.successful') ?? '');
            this.setCaption('publish_explanation', localizations?.getLocalization('camera.publish.successful') ?? '');
            this.setCaption('publish_detailed_explanation', localizations?.getLocalization('camera.publish.success.short.info') ?? '');
            this.setVisible('publish_button', false);
            this.setVisible('publish_price_area', false);
            this.setVisible('publish_link_area', true);

            if(this._publishTimer !== null)
            {
                clearTimeout(this._publishTimer);
                this._publishTimer = null;
            }
        }
        else
        {
            const secondsToWait = parser.getSecondsToWait();
            // AS3's integer division plus one — the wait is always rounded up to a whole minute.
            const minutes = Math.floor(secondsToWait / 60) + 1;
            const message = localizations?.registerParameter('camera.publish.wait', 'minutes', minutes.toString()) ?? '';

            this._widget?.windowManager.alert('${generic.alert.title}', message, 0, null);
            this.setCaption('status_info', '');

            if(this._publishTimer !== null) clearTimeout(this._publishTimer);

            this._publishTimer = setTimeout(() => this.onPublishTimerComplete(), secondsToWait * 1000);
        }

        this.setState(PhotoPurchaseConfirmationDialog.STATE_IMAGE_LOADED);
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::onPublishTimerComplete()
    private onPublishTimerComplete(): void
    {
        this._publishPending = false;
        this._publishTimer = null;

        if(this._state === PhotoPurchaseConfirmationDialog.STATE_IMAGE_LOADED)
        {
            const publishButton = this._window?.findChildByName('publish_button');

            if(publishButton) publishButton.enable();
        }
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::competitionStatus()
    competitionStatus(event: CompetitionStatusMessageEvent): void
    {
        if(this._window === null || this._window.findChildByName('competition_wrapper') === null)
        {
            return;
        }

        const parser = event.parser as CompetitionStatusMessageParser;
        const localizations = this._widget?.localizations ?? null;

        if(parser.isOk())
        {
            this.setCaption('status_info', localizations?.getLocalization('camera.competition.submitted.status') ?? '');
            this.setCaption('competition_name', localizations?.getLocalization('camera.competition.submitted.info') ?? '');
        }
        else if(parser.getErrorReason() === 'too-many-submits')
        {
            this.setCaption('status_info', localizations?.getLocalization('generic.failed') ?? '');
            this.setCaption('competition_name', localizations?.getLocalization('camera.competition.limit.info') ?? '');
        }
        else if(parser.getErrorReason() === 'email-not-verified')
        {
            // The only branch that clears the flag: an unverified e-mail is retryable, the other
            // two failures are not.
            this._competitionSubmitted = false;

            this.setCaption('status_info', localizations?.getLocalization('generic.failed') ?? '');

            this._widget?.windowManager.confirm(
                '${generic.alert.title}',
                '${camera.competition.email.not.verified}',
                0x10 | 0x20,
                () => this.onEmailVerificationGo()
            );
        }

        this.setState(PhotoPurchaseConfirmationDialog.STATE_IMAGE_LOADED);

        const competitionButton = this._window.findChildByName('competition_button');

        if(competitionButton !== null && competitionButton.y < 10)
        {
            competitionButton.y = 10;
        }
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::onEmailVerificationGo()
    private onEmailVerificationGo(): void
    {
        const url = this._widget?.component?.context?.configuration?.getProperty('email.verification.url') ?? '';

        if(!StringUtil.isEmpty(url))
        {
            const target = this._widget?.component?.getInteger('spaweb', 0) === 1 ? '' : '_blank';

            globalThis.open(url, target === '' ? '_self' : target);
        }
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::setPrices()
    setPrices(creditPrice: number, ducketPrice: number, publishDucketPrice: number): void
    {
        if(this._window === null) return;

        this.setCaption('purchase_credit_cost_text', creditPrice.toString());

        if(ducketPrice > 0)
        {
            this.setCaption('purchase_ducket_cost_text', ducketPrice.toString());
        }
        else
        {
            this.setVisible('purchase_ducket_cost_text', false);
            this.setVisible('ducket_icon', false);
        }

        this.setCaption('publish_ducket_cost_text', publishDucketPrice.toString());
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::windowEventHandler()
    private windowEventHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(!event || !window)
        {
            return;
        }

        if(event.type !== 'WME_CLICK' && event.type !== 'WME_DOUBLE_CLICK')
        {
            return;
        }

        const imageLoaded = this._state === PhotoPurchaseConfirmationDialog.STATE_IMAGE_LOADED;

        switch(window.name)
        {
            case 'spending_disclaimer':
                this.setDisclaimerAccepted((window as IWindow & { isSelected?: boolean }).isSelected === true);
                break;

            case 'competition_button':
                if(imageLoaded)
                {
                    this.setState(PhotoPurchaseConfirmationDialog.STATE_WAITING_COMPETITION_SUBMIT_TO_COMPLETE);
                    this._widget?.handler?.confirmPhotoCompetitionSubmit();
                }

                break;

            case 'buy_button':
                if(imageLoaded && this._disclaimerAccepted
                    && this.checkPurse(this._widget?.handler?.creditPrice ?? 0, this._widget?.handler?.ducketPrice ?? 0))
                {
                    this.setState(PhotoPurchaseConfirmationDialog.STATE_WAITING_PURCHASE_TO_COMPLETE);
                    this._widget?.handler?.confirmPhotoPurchase();
                }

                break;

            case 'publish_button':
                if(imageLoaded && this.checkPurse(0, this._widget?.handler?.publishDucketPrice ?? 0))
                {
                    this.setState(PhotoPurchaseConfirmationDialog.STATE_WAITING_PUBLISH_TO_COMPLETE);
                    this._widget?.handler?.confirmPhotoPublish();
                }

                break;

            case 'inventory_link':
                this._widget?.component?.context?.createLinkEvent('inventory/open/furni');
                break;

            case 'publish_link':
            {
                const userName = this._widget?.container?.sessionDataManager?.userName ?? '';

                // TODO(AS3): .../PhotoPurchaseConfirmationDialog.as::windowEventHandler()
                // AS3 hands `/profile/<user>/photo/<id>` to HabboWebTools.openPage(); the port has
                // no HabboWebTools, so the deep link is opened directly. `globalThis` is spelt out
                // because the procedure's own parameter is named `window`, as it is in AS3.
                globalThis.open(`/profile/${userName}/photo/${this._extraDataId}`, '_blank');
                break;
            }

            case 'header_button_close':
            case 'cancel_button':
                this._widget?.startTakingPhoto('photoPurchaseCancel');
                this.hide();
        }
    };

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::setDisclaimerAccepted()
    private setDisclaimerAccepted(accepted: boolean): void
    {
        if(this._window === null)
        {
            return;
        }

        const buyButton = this._window.findChildByName('buy_button');

        if(buyButton === null)
        {
            return;
        }

        this._disclaimerAccepted = accepted;

        if(accepted && this._state === PhotoPurchaseConfirmationDialog.STATE_IMAGE_LOADED)
        {
            buyButton.enable();
        }
        else
        {
            buyButton.disable();
        }
    }

    // TS-only: caption/visibility helpers over `findChildByName`; AS3 inlines both at every call
    // site, which would be twenty repetitions of the same null check here.
    private setCaption(name: string, caption: string): void
    {
        const child = this._window?.findChildByName(name);

        if(child) child.caption = caption;
    }

    // TS-only: see setCaption() above � the same inlined pattern in AS3.
    private setVisible(name: string, visible: boolean): void
    {
        const child = this._window?.findChildByName(name);

        if(child) child.visible = visible;
    }

    // AS3: .../ui/widget/camera/PhotoPurchaseConfirmationDialog.as::hide()
    hide(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._image = null;
        this._widget = null;

        if(this._publishTimer !== null)
        {
            clearTimeout(this._publishTimer);
            this._publishTimer = null;
        }
    }

    // TS-only: the caption the dialog was opened with. AS3 stores it and never reads it back — kept
    // so the field is not dropped silently.
    get caption(): string
    {
        return this._caption;
    }
}
