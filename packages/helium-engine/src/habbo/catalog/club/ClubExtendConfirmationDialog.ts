import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {type AssetLoaderEvent, AssetLoaderEventType} from '@core/assets/loaders/AssetLoaderEvent';
import {ActivityPointTypeEnum} from '../purse/ActivityPointTypeEnum';
import {HabboCatalogUtils} from '../HabboCatalogUtils';
import type {ClubExtendController} from './ClubExtendController';
import type {ClubExtendOfferData} from './ClubExtendOfferData';

const CREDIT_IMAGE_COUNT = 7;
const ANIMATION_TRIGGER_INTERVAL_MS = 2000;
const ANIMATION_FRAME_INTERVAL_MS = 75;
const LINK_COLOR_DEFAULT = 0;
const LINK_COLOR_HOVER = 9552639;
const TEASER_IMAGE_URL_TEMPLATE = '${image.library.catalogue.url}catalogue/vip_extend_tsr.png';

/**
 * Club/VIP membership extension (renewal) confirmation dialog: shows the original vs. discounted
 * price breakdown, a remote "teaser" image, and an animated credit-icon flourish.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubExtendConfirmationDialog.as
 */
export class ClubExtendConfirmationDialog
{
    private _controller: ClubExtendController | null;

    private _window: IWindowContainer | null = null;

    private _offer: ClubExtendOfferData | null;

    private _laterRegion: IRegionWindow | null = null;

    private _laterLink: ITextWindow | null = null;

    private _creditIconElement: IBitmapWrapperWindow | null = null;

    private _creditImages: (ImageBitmap | null)[] = new Array(CREDIT_IMAGE_COUNT).fill(null);

    private _animationTriggerTimer: ReturnType<typeof setInterval> | null = null;

    private _animationFrameTimer: ReturnType<typeof setInterval> | null = null;

    private _animationFrame: number = 0;

    private _animationFrameToggle: number = 0;

    private _disposed: boolean = false;

    private _localizationKey: string = 'catalog.club.extend.';

    constructor(controller: ClubExtendController, offer: ClubExtendOfferData)
    {
        this._controller = controller;
        this._offer = offer;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._offer = null;
        this._controller = null;
        this.clearAnimation();

        if(this._laterRegion)
        {
            this._laterRegion.removeEventListener(WindowMouseEvent.OUT, this.onMouseOutLaterRegion);
            this._laterRegion.removeEventListener(WindowMouseEvent.OVER, this.onMouseOverLaterRegion);
            this._laterRegion = null;
        }

        this._laterLink = null;
        this._creditIconElement = null;
        this._creditImages = new Array(CREDIT_IMAGE_COUNT).fill(null);

        this._window?.dispose();
        this._window = null;
        this._disposed = true;
    }

    showConfirmation(): void
    {
        if(!this._offer || !this._controller || this._disposed) return;

        this._window = this.createWindow('club_extend_confirmation');

        if(!this._window) return;

        this._window.procedure = this.windowEventHandler;
        this._window.center();

        if(!this._offer.vip)
        {
            this._localizationKey += 'basic.';

            const clubLevelIcon = this._window.findChildByName('club_level_icon') as unknown as IIconWindow | null;

            if(clubLevelIcon)
            {
                clubLevelIcon.style = 17;
                clubLevelIcon.x += 15;
            }
        }

        const localization = this._controller.localization;
        const offer = this._offer;

        this.setCaption('normal_price_price_left', offer.originalPrice.toString());
        this.setCaption('normal_price_price_right', offer.originalActivityPointPrice.toString());
        this.setCaption('you_save_price_left', offer.discountCreditAmount.toString());
        this.setCaption('you_save_price_right', offer.discountActivityPointAmount.toString());
        this.setCaption('your_price_price_left', offer.priceInCredits.toString());
        this.setCaption('your_price_price_right', offer.priceInActivityPoints.toString());

        const title = (this._window as unknown as IFrameWindow).title;

        if(title) title.caption = localization?.getLocalization(`${this._localizationKey}confirm.caption`) ?? '';

        this.setCaption('extend_title', localization?.getLocalization(`${this._localizationKey}confirm.title`) ?? '');
        this.setCaption('normal_price_label', localization?.getLocalization(`${this._localizationKey}normal.label`) ?? '');
        this.setCaption('you_save_label', localization?.getLocalization(`${this._localizationKey}save.label`) ?? '');
        this.setCaption('your_price_label', localization?.getLocalization(`${this._localizationKey}price.label`) ?? '');
        this.setCaption('buy_now_button', localization?.getLocalization(`${this._localizationKey}buy.button`) ?? '');
        this.setCaption('maybe_later_link', localization?.getLocalization(`${this._localizationKey}later.link`) ?? '');

        let expiration: string;

        if(offer.subscriptionDaysLeft > 1)
        {
            localization?.registerParameter(`${this._localizationKey}expiration_days_left`, 'day', offer.subscriptionDaysLeft.toString());
            localization?.registerParameter(`${this._localizationKey}expiration_days_left`, 'duration', (31 * offer.months).toString());
            expiration = localization?.getLocalization(`${this._localizationKey}expiration_days_left`) ?? '';
        }
        else
        {
            expiration = localization?.getLocalization(`${this._localizationKey}expires_today`) ?? '';
        }

        this.setCaption('offer_expiration', expiration);

        this._laterRegion = this._window.findChildByName('maybe_later_region') as unknown as IRegionWindow | null;
        this._laterLink = this._window.findChildByName('maybe_later_link') as unknown as ITextWindow | null;

        if(!this._laterRegion || !this._laterLink) return;

        this._laterRegion.addEventListener(WindowMouseEvent.OUT, this.onMouseOutLaterRegion);
        this._laterRegion.addEventListener(WindowMouseEvent.OVER, this.onMouseOverLaterRegion);

        const creditIcon = this.getBitmapFromAsset('icon_credit_0');

        this.setElementBitmap('normal_price_icon_left', creditIcon);
        this.setElementBitmap('you_save_icon_left', creditIcon);
        this.setActivityPointIconStyle('normal_price_icon_right');
        this.setActivityPointIconStyle('you_save_icon_right');
        this.setActivityPointIconStyle('your_price_icon_right');

        const teaser = this._window.findChildByName('club_teaser') as unknown as IWindow | null;

        if(teaser)
        {
            teaser.x = 1;
            teaser.y = this._window.height - 144;
            teaser.height = 144;
            teaser.width = 133;
        }

        const configuration = this._controller.config;
        let teaserUrl = configuration?.interpolate(TEASER_IMAGE_URL_TEMPLATE) ?? TEASER_IMAGE_URL_TEMPLATE;

        if(configuration) teaserUrl = configuration.updateUrlProtocol(teaserUrl);

        this.loadAssetFromUrl('club_teaser', 'club_teaser', teaserUrl, 'image/png');

        const itemList = this._window.findChildByName('itemlist_vertical') as unknown as IWindowContainer | null;

        if(!itemList) return;

        const totalAmountLine = this._window.findChildByName('total_amount_line');

        if(!totalAmountLine) return;

        const backgroundContainer = this._window.findChildByName('background_container');

        if(!backgroundContainer) return;

        backgroundContainer.height = itemList.y + totalAmountLine.height + totalAmountLine.y;

        this._creditIconElement = this._window.findChildByName('your_price_icon_left') as unknown as IBitmapWrapperWindow | null;

        if(this._creditIconElement == null) return;

        for(let i = 0; i < CREDIT_IMAGE_COUNT; i++)
        {
            this._creditImages[i] = this.getBitmapFromAsset(`icon_credit_${i}`);
        }

        this.startAnimation();
    }

    private setCaption(name: string, value: string): void
    {
        const element = this._window?.findChildByName(name);

        if(element) element.caption = value;
    }

    private setActivityPointIconStyle(name: string): void
    {
        const element = this._window?.findChildByName(name);
        const configuration = (this._controller?.config ?? null) as unknown as IHabboConfigurationManager | null;

        if(element && configuration && this._offer)
        {
            element.style = ActivityPointTypeEnum.getIconStyleFor(this._offer.originalActivityPointType, configuration, true);
        }
    }

    private onMouseOutLaterRegion = (_event: WindowMouseEvent): void =>
    {
        if(this._laterLink) this._laterLink.textColor = LINK_COLOR_DEFAULT;
    };

    private onMouseOverLaterRegion = (_event: WindowMouseEvent): void =>
    {
        if(this._laterLink) this._laterLink.textColor = LINK_COLOR_HOVER;
    };

    private startAnimation(): void
    {
        if(this._animationTriggerTimer != null) this.clearAnimation();

        this.setAnimationFrame();
        this._animationTriggerTimer = setInterval(() => this.onAnimationTrigger(), ANIMATION_TRIGGER_INTERVAL_MS);
    }

    private clearAnimation(): void
    {
        this._animationFrame = 0;
        this._animationFrameToggle = 0;

        if(this._animationFrameTimer != null)
        {
            clearInterval(this._animationFrameTimer);
            this._animationFrameTimer = null;
        }

        if(this._animationTriggerTimer != null)
        {
            clearInterval(this._animationTriggerTimer);
            this._animationTriggerTimer = null;
        }
    }

    private setAnimationFrame(): void
    {
        if(!this._creditIconElement) return;

        if(this._animationFrame < CREDIT_IMAGE_COUNT)
        {
            const frame = this._creditImages[this._animationFrame];

            if(frame) this._creditIconElement.bitmap = frame;
        }
    }

    private startAnimationFrame(): void
    {
        let ticks = 0;

        this._animationFrameTimer = setInterval(() =>
        {
            ticks++;
            this.onAnimationFrame();

            if(ticks >= CREDIT_IMAGE_COUNT - 1)
            {
                if(this._animationFrameTimer != null)
                {
                    clearInterval(this._animationFrameTimer);
                    this._animationFrameTimer = null;
                }

                this.onAnimationFrameComplete();
            }
        }, ANIMATION_FRAME_INTERVAL_MS);
    }

    private onAnimationTrigger(): void
    {
        this.startAnimationFrame();
    }

    private onAnimationFrame(): void
    {
        this._animationFrame += 1;
        this.setAnimationFrame();
    }

    private onAnimationFrameComplete(): void
    {
        this._animationFrame = 0;
        this.setAnimationFrame();

        if(this._animationFrameToggle === 0)
        {
            this._animationFrameToggle = 1;
            this.startAnimationFrame();
        }
        else
        {
            this._animationFrameToggle = 0;
        }
    }

    private getBitmapFromAsset(name: string): ImageBitmap | null
    {
        return (this._controller?.assets?.getAssetByName(name)?.content as ImageBitmap | null) ?? null;
    }

    private setElementBitmap(name: string, source: ImageBitmap | null): void
    {
        const element = this._window?.findChildByName(name) as unknown as IBitmapWrapperWindow | null;

        if(source && element) HabboCatalogUtils.replaceCenteredImage(element, source);
    }

    private loadAssetFromUrl(elementName: string, assetName: string, url: string, mimeType: string): boolean
    {
        const existing = this.getBitmapFromAsset(assetName);

        if(existing != null)
        {
            this.setElementBitmap(elementName, existing);

            return true;
        }

        const loader = this._controller?.assets?.loadAssetFromFile(assetName, url, mimeType) ?? null;

        if(!loader) return false;

        loader.events.on('event', (event: AssetLoaderEvent) =>
        {
            if(event.type === AssetLoaderEventType.COMPLETE) this.onTeaserLoaded(assetName);
        });

        return true;
    }

    private onTeaserLoaded(assetName: string): void
    {
        if(this._disposed) return;

        const bitmap = this.getBitmapFromAsset(assetName);

        this.setElementBitmap('club_teaser', bitmap);
    }

    private windowEventHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(!event || !window || !this._controller || !this._offer || this._disposed) return;

        if(event.type !== WindowMouseEvent.CLICK) return;

        switch(window.name)
        {
            case 'buy_now_button':
                this._controller.confirmSelection();

                break;
            case 'header_button_close':
            case 'maybe_later_region':
                this._controller.closeConfirmation();

                break;
        }
    };

    private createWindow(name: string): IWindowContainer | null
    {
        if(!this._controller?.assets || !this._controller?.windowManager || this._disposed) return null;

        return this._controller.config?.utils.createWindow(name) as unknown as IWindowContainer | null;
    }
}
