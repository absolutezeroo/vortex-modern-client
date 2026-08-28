import type {XmlAsset} from '@core/assets/XmlAsset';
import {AssetBitmap} from '@core/assets/AssetBitmap';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {Logger} from '@core/utils/Logger';
import {
    EventLogMessageComposer
} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {VideoOfferTypeEnum} from '@habbo/catalog/enum/VideoOfferTypeEnum';
import type {IVideoOfferLauncher} from '@habbo/catalog/IVideoOfferLauncher';

import type {HabboToolbar} from '../HabboToolbar';

const log = Logger.getLogger('habbo.toolbar.extensions.VideoOfferExtension');

/**
 * The "watch a video, earn a credit" bar above the toolbar.
 *
 * Same shape as its two promo siblings — build a window from a layout, attach it to the extension
 * slot, tear it down on dismiss — with the offer count coming from `catalog.videoOffers` rather
 * than from the purse. Note that a *close* click is remembered for the session (`_dismissed`) and
 * suppresses every later rebuild, while the club-expiry path only detaches for as long as the
 * club-extension promo wants the slot.
 *
 * `onTextRegionClicked()` reads oddly and is transcribed as written: it destroys the bar when
 * `launch()` answers **false**, because that answer means "no further offer after this one", not
 * "the launch failed".
 *
 * The bar cannot currently appear, because `VideoOfferManager.enabled` is permanently false in this
 * build — see that class for why. This is the faithful port of what would run if a hotel turned it
 * back on, not dead scaffolding written on spec.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/extensions/VideoOfferExtension.as
 */
export class VideoOfferExtension implements IVideoOfferLauncher
{
    /** Derived name — `_SafeStr_10818`, named from its value. */
    // AS3: VideoOfferExtension.as::_SafeStr_10818
    private static readonly EXTENSION_ID: string = 'video_offer';

    // AS3: VideoOfferExtension.as::LINK_COLOR_NORMAL
    private static readonly LINK_COLOR_NORMAL: number = 0xFFFFFF;

    // AS3: VideoOfferExtension.as::LINK_COLOR_HIGHLIGHT
    private static readonly LINK_COLOR_HIGHLIGHT: number = 0xBACB09;

    // AS3: VideoOfferExtension.as::CLOSE_COLOR_NORMAL
    private static readonly CLOSE_COLOR_NORMAL: number = 0x666666;

    // AS3: VideoOfferExtension.as::CLOSE_COLOR_OVER
    private static readonly CLOSE_COLOR_OVER: number = 0xCCCCCC;

    // AS3: VideoOfferExtension.as::_toolbar
    private _toolbar: HabboToolbar | null;

    /** Derived name — `_SafeStr_4550`: the bar itself. */
    // AS3: VideoOfferExtension.as::_SafeStr_4550
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5412`: the clickable text area. */
    // AS3: VideoOfferExtension.as::_SafeStr_5412
    private _textRegion: IRegionWindow | null = null;

    /** Derived name — `_SafeStr_4987`: the close cross. */
    // AS3: VideoOfferExtension.as::_SafeStr_4987
    private _closeIcon: IIconWindow | null = null;

    /** Derived name — `_SafeStr_8747`: set once the user closes the bar, never cleared. */
    // AS3: VideoOfferExtension.as::_SafeStr_8747
    private _dismissed: boolean = false;

    // AS3: VideoOfferExtension.as::VideoOfferExtension()
    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;
    }

    // AS3: VideoOfferExtension.as::get window()
    get window(): IWindow | null
    {
        return this._window as unknown as IWindow | null;
    }

    /**
     * AS3 takes the club event and never reads it; the port drops the parameter, as the other
     * toolbar extensions do, and reads the inventory the same way the AS3 body does.
     */
    // AS3: VideoOfferExtension.as::onClubChanged()
    onClubChanged(): void
    {
        const toolbar = this._toolbar;

        if(toolbar == null) return;

        if((toolbar.inventory?.clubIsExpiring ?? false) && this._window == null && this.isClubExtensionEnabled())
        {
            toolbar.extensionView?.detachExtension(VideoOfferExtension.EXTENSION_ID);

            this.destroyWindow();

            return;
        }

        if(!this._dismissed && this._window == null)
        {
            toolbar.catalog?.videoOffers?.load(this);
        }
    }

    /** The club-extension promo wants the same slot, and outranks this bar when it is showing. */
    // AS3: VideoOfferExtension.as::isClubExtensionEnabled()
    private isClubExtensionEnabled(): boolean
    {
        return (this._toolbar?.inventory?.clubLevel ?? 0) === 2
            && (this._toolbar?.getBoolean('club.membership.extend.vip.promotion.enabled') ?? false);
    }

    // AS3: VideoOfferExtension.as::offersAvailable()
    offersAvailable(count: number): void
    {
        const toolbar = this._toolbar;

        if(toolbar == null) return;

        if(count <= 0
            || this._dismissed
            || ((toolbar.inventory?.clubIsExpiring ?? false) && this.isClubExtensionEnabled()))
        {
            if(this._window != null) this.destroyWindow();

            return;
        }

        if(this._window == null) this._window = this.createWindow();
    }

    // AS3: VideoOfferExtension.as::createWindow()
    private createWindow(): IWindowContainer | null
    {
        const toolbar = this._toolbar;

        if(toolbar == null) return null;

        const asset = (toolbar.assets?.getAssetByName('video_offer_promotion_xml') as XmlAsset | null) ?? null;

        if(asset == null)
        {
            log.warn('Missing layout "video_offer_promotion_xml" — the video offer bar is not built');

            return null;
        }

        const window = (toolbar.windowManager?.buildFromXML(
            asset.content as unknown as string, 1
        ) as IWindowContainer | null) ?? null;

        if(window == null) return null;

        const text = toolbar.localization?.getLocalization(
            'supersaverads.video.promo.offer', 'Watch a video and earn a credit!'
        ) ?? '';

        const promoText = (window.findChildByName('promo_text') as ITextWindow | null) ?? null;
        const promoTextShadow = (window.findChildByName('promo_text_shadow') as ITextWindow | null) ?? null;

        if(promoText !== null) promoText.text = text;
        if(promoTextShadow !== null) promoTextShadow.text = text;

        // AS3 copies the icon into a fresh transparent bitmap the size of the slot; assigning the
        // asset's own bitmap is the same thing here, since the layout sizes the wrapper to it.
        const iconAsset = toolbar.assets?.getAssetByName('offer_icon') ?? null;
        const icon = (window.findChildByName('promo_icon') as IBitmapWrapperWindow | null) ?? null;

        if(iconAsset !== null && icon !== null) icon.bitmap = AssetBitmap.resolveSync(iconAsset.content);

        this._textRegion = (window.findChildByName('text_region') as IRegionWindow | null) ?? null;

        if(this._textRegion !== null)
        {
            const region = this._textRegion as unknown as IWindow;

            region.addEventListener('WME_CLICK', this.onTextRegionClicked);
            region.addEventListener('WME_OVER', this.onTextRegionMouseOver);
            region.addEventListener('WME_OUT', this.onTextRegionMouseOut);
        }

        this._closeIcon = (window.findChildByName('promo_close_icon') as IIconWindow | null) ?? null;

        if(this._closeIcon !== null)
        {
            const close = this._closeIcon as unknown as IWindow;

            close.addEventListener('WME_CLICK', this.onCloseClicked);
            close.addEventListener('WME_OVER', this.onCloseMouseOver);
            close.addEventListener('WME_OUT', this.onCloseMouseOut);
        }

        toolbar.extensionView?.attachExtension(VideoOfferExtension.EXTENSION_ID, window, 10);

        return window;
    }

    // AS3: VideoOfferExtension.as::destroyWindow()
    private destroyWindow(): void
    {
        if(this._window == null) return;

        if(this._textRegion !== null)
        {
            const region = this._textRegion as unknown as IWindow;

            region.removeEventListener('WME_CLICK', this.onTextRegionClicked);
            region.removeEventListener('WME_OVER', this.onTextRegionMouseOver);
            region.removeEventListener('WME_OUT', this.onTextRegionMouseOut);

            this._textRegion = null;
        }

        if(this._closeIcon !== null)
        {
            const close = this._closeIcon as unknown as IWindow;

            close.removeEventListener('WME_CLICK', this.onCloseClicked);
            close.removeEventListener('WME_OVER', this.onCloseMouseOver);
            close.removeEventListener('WME_OUT', this.onCloseMouseOut);

            this._closeIcon = null;
        }

        this._window.dispose();
        this._window = null;
    }

    // AS3: VideoOfferExtension.as::onCloseClicked()
    private onCloseClicked = (): void =>
    {
        this._dismissed = true;

        this.destroyWindow();

        this._toolbar?.connection?.send(
            new EventLogMessageComposer('SuperSaverAds', 'client_action', 'supersaverads.video.promo.close_clicked')
        );
    };

    // AS3: VideoOfferExtension.as::onCloseMouseOver()
    private onCloseMouseOver = (): void =>
    {
        if(this._closeIcon !== null) this._closeIcon.color = VideoOfferExtension.CLOSE_COLOR_OVER;
    };

    // AS3: VideoOfferExtension.as::onCloseMouseOut()
    private onCloseMouseOut = (): void =>
    {
        if(this._closeIcon !== null) this._closeIcon.color = VideoOfferExtension.CLOSE_COLOR_NORMAL;
    };

    // AS3: VideoOfferExtension.as::onTextRegionClicked()
    private onTextRegionClicked = (): void =>
    {
        if(this._toolbar?.catalog?.videoOffers?.launch(VideoOfferTypeEnum.CREDIT) !== true)
        {
            this.destroyWindow();
        }
    };

    // AS3: VideoOfferExtension.as::onTextRegionMouseOver()
    private onTextRegionMouseOver = (): void =>
    {
        this.setPromoTextColor(VideoOfferExtension.LINK_COLOR_HIGHLIGHT);
    };

    // AS3: VideoOfferExtension.as::onTextRegionMouseOut()
    private onTextRegionMouseOut = (): void =>
    {
        this.setPromoTextColor(VideoOfferExtension.LINK_COLOR_NORMAL);
    };

    /** TS-only: AS3 repeats the `findChildByName("promo_text")` lookup in both hover handlers. */
    // TS-only: no AS3 counterpart; the two hover handlers' shared body.
    private setPromoTextColor(color: number): void
    {
        if(this._window == null) return;

        const promoText = (this._window.findChildByName('promo_text') as ITextWindow | null) ?? null;

        if(promoText !== null) promoText.textColor = color;
    }

    // AS3: VideoOfferExtension.as::dispose()
    dispose(): void
    {
        if(this._toolbar == null) return;

        this._toolbar.extensionView?.detachExtension(VideoOfferExtension.EXTENSION_ID);

        this.destroyWindow();

        this._toolbar = null;
    }
}
