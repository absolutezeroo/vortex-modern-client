import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IOfferCenter} from '@habbo/catalog/offers/IOfferCenter';
import type {IOfferExtension} from '@habbo/catalog/offers/IOfferExtension';
import {Logger} from '@core/utils/Logger';
import {ToolbarDisplayExtensionIds} from '../ToolbarDisplayExtensionIds';

import type {HabboToolbar} from '../HabboToolbar';

const log = Logger.getLogger('habbo.toolbar.offers.OfferExtension');

/**
 * The two-row offer strip above the toolbar: "watch a video" and "check your rewards".
 *
 * Both rows live in the same `offer_extension_xml` list and are shown independently — the offer
 * centre calls `indicateVideoAvailable()` and `indicateRewards()` as each becomes available — so the
 * strip itself is visible exactly when at least one row is, which is what `refresh()` recomputes
 * from the list rather than from flags of its own.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/offers/OfferExtension.as
 */
export class OfferExtension implements IOfferExtension
{
    // AS3: OfferExtension.as::_disposed
    private _disposed: boolean = false;

    // AS3: OfferExtension.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: OfferExtension.as::_toolbar
    private _toolbar: HabboToolbar | null;

    // AS3: OfferExtension.as::_offerCenter
    private _offerCenter: IOfferCenter | null = null;

    /** Derived name — `_SafeStr_4652`: the strip's own item list, holding the two rows. */
    // AS3: OfferExtension.as::_SafeStr_4652
    private _list: IItemListWindow | null = null;

    /**
     * DEVIATION: AS3 takes the window manager, the asset library and the catalog as constructor
     *   arguments. `HabboToolbar` already exposes all three and every other toolbar extension in
     *   this port takes only the toolbar, so this one does too — `initOfferExtension()`, the single
     *   call site, is inside `HabboToolbar` itself.
     */
    // AS3: OfferExtension.as::OfferExtension()
    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        const asset = (toolbar.assets?.getAssetByName('offer_extension_xml') as XmlAsset | null) ?? null;

        if(asset === null)
        {
            log.warn('Missing layout "offer_extension_xml" — the offer strip is not built');

            return;
        }

        this._window = (toolbar.windowManager?.buildFromXML(
            asset.content as unknown as string, 1
        ) as IWindowContainer | null) ?? null;

        if(this._window === null) return;

        this._window.procedure = this.windowProcedure;
        this._window.visible = false;

        this._list = (this._window.findChildByName('list') as unknown as IItemListWindow | null) ?? null;

        this._offerCenter = toolbar.catalog?.getOfferCenter(this) ?? null;

        toolbar.extensionView?.attachExtension(
            ToolbarDisplayExtensionIds.VIDEO_OFFERS,
            this._window as unknown as IWindow,
            8
        );

        this.refresh();
    }

    // AS3: OfferExtension.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: OfferExtension.as::get window()
    get window(): IWindow | null
    {
        return this._window as unknown as IWindow | null;
    }

    /** The strip is shown whole; the rewards row is what this turns on. */
    // AS3: OfferExtension.as::indicateRewards()
    indicateRewards(): void
    {
        if(this._window === null) return;

        this._window.visible = true;

        const rewards = this._window.findChildByName('check_rewards');

        if(rewards !== null) rewards.visible = true;

        this.refresh();
    }

    /**
     * The video row, greyed while a video is already playing rather than hidden — that is AS3's
     * `disable()` plus a dimmer colour, so the row keeps its place in the list.
     */
    // AS3: OfferExtension.as::indicateVideoAvailable()
    indicateVideoAvailable(available: boolean): void
    {
        if(this._window === null) return;

        // AS3's `||=`: an available video forces the strip open, an unavailable one never closes it.
        this._window.visible = this._window.visible || available;

        const video = this._window.findChildByName('start_video');

        if(video !== null)
        {
            video.visible = available;

            if(this._offerCenter?.showingVideo ?? false)
            {
                video.disable();
                video.color = 0x999999;
            }
            else
            {
                video.enable();
                video.color = 0xC55541;
            }
        }

        this.refresh();
    }

    // AS3: OfferExtension.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        switch(window.name)
        {
            case 'start_video':
                this._offerCenter?.showVideo();
                break;
            case 'check_rewards':
                this._offerCenter?.showRewards();
                break;
        }
    };

    /**
     * The strip's visibility is the OR of its two rows, read back off the list after it has been
     * re-laid out — not off flags, because a row can also be hidden by the layout itself.
     */
    // AS3: OfferExtension.as::refresh()
    private refresh(): void
    {
        if(this._list === null || this._window === null) return;

        this._list.arrangeListItems();

        const video = this._list.getListItemAt(0);
        const rewards = this._list.getListItemAt(1);

        this._window.visible = (video?.visible ?? false) || (rewards?.visible ?? false);

        this._toolbar?.extensionView?.refreshItemWindow();
    }

    // AS3: OfferExtension.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._list = null;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._toolbar = null;
        this._disposed = true;
    }
}
