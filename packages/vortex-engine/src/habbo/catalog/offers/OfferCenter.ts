import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {
    OfferRewardDeliveredMessageEvent
} from '@habbo/communication/messages/incoming/catalog/OfferRewardDeliveredMessageEvent';
import type {
    OfferRewardDeliveredMessageParser
} from '@habbo/communication/messages/parser/catalog/OfferRewardDeliveredMessageParser';
import type {IHabboCatalog} from '../IHabboCatalog';
import type {IOfferCenter} from './IOfferCenter';
import type {IOfferExtension} from './IOfferExtension';
import type {IOfferProvider} from './IOfferProvider';
import {OfferReward} from './OfferReward';
import {SponsorPayProvider} from './SponsorPayProvider';
import {SupersonicProvider} from './SupersonicProvider';

const log = Logger.getLogger('habbo.catalog.offers.OfferCenter');

/**
 * The rewarded-video offer centre: a list of payouts the player has earned, and the plumbing that
 * decides whether a video is worth offering.
 *
 * It polls its providers every half hour rather than reacting to anything — a network's inventory
 * changes on its own schedule, not on ours — and asks the *first* enabled provider with a video
 * ready, so the order they are pushed in is their priority order.
 *
 * The reward list is built by cloning a template row lifted out of the layout: AS3 removes list
 * item 0 and keeps it as the stencil, so the layout ships one specimen row rather than the client
 * building one.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/offers/OfferCenter.as
 */
export class OfferCenter implements IOfferCenter, IDisposable
{
    // AS3: OfferCenter.as::PROVIDER_POLLING_FREQUENCY
    private static readonly PROVIDER_POLLING_FREQUENCY: number = 1800000;

    /** The layout, by the name the asset build ships it under. */
    // AS3: OfferCenter.as::showRewards() (its getAssetByName call)
    private static readonly LAYOUT: string = 'offer_center_xml';

    // AS3: OfferCenter.as::_disposed
    private _disposed: boolean = false;

    // AS3: OfferCenter.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: OfferCenter.as::_catalog
    private _catalog: IHabboCatalog | null;

    // AS3: OfferCenter.as::_offerExtension
    private _offerExtension: IOfferExtension | null = null;

    // AS3: OfferCenter.as::_window
    private _window: IWindowContainer | null = null;

    /** Name DERIVED — `_SafeStr_6378`: the provider that will serve the next video. */
    // AS3: OfferCenter.as::_SafeStr_6378
    private _activeProvider: IOfferProvider | null = null;

    // AS3: OfferCenter.as::_providers
    private _providers: IOfferProvider[] | null = null;

    /** Name DERIVED — `_SafeStr_6994`: the payouts, newest first. */
    // AS3: OfferCenter.as::_SafeStr_6994
    private _rewards: OfferReward[] = [];

    /** Name DERIVED — `_SafeStr_7033`: the row lifted out of the layout to clone. */
    // AS3: OfferCenter.as::_SafeStr_7033
    private _rewardItemTemplate: IWindow | null = null;

    // TS-only: AS3 uses a repeating `flash.utils.Timer`; this is its handle.
    private _pollTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: OfferCenter.as::_offerRewardDeliveredMessageEvent
    private _offerRewardDeliveredMessageEvent: IMessageEvent | null;

    /**
     * AS3 takes an `IAssetLibrary` as its second argument, which it uses only to fetch the layout.
     * This port has no per-component library and reaches the layout through the window manager, so
     * that parameter has nothing to hold and is absent.
     */
    // AS3: OfferCenter.as::OfferCenter()
    constructor(windowManager: IHabboWindowManager, catalog: IHabboCatalog)
    {
        this._windowManager = windowManager;
        this._catalog = catalog;

        this._offerRewardDeliveredMessageEvent =
            new OfferRewardDeliveredMessageEvent(this.onOfferRewardDelivered);

        catalog.connection?.addMessageEvent(this._offerRewardDeliveredMessageEvent);

        // Push order is priority order: getNextProvider() takes the first that is ready.
        this._providers = [new SupersonicProvider(this), new SponsorPayProvider(this)];

        this._pollTimer = setInterval(this.onPollTimer, OfferCenter.PROVIDER_POLLING_FREQUENCY);

        this.onPollTimer();
    }

    // AS3: OfferCenter.as::onPollTimer()
    private onPollTimer = (): void =>
    {
        if(this._providers === null) return;

        for(const provider of this._providers)
        {
            if(provider.enabled) provider.load();
        }
    };

    // AS3: OfferCenter.as::getNextProvider()
    private getNextProvider(): IOfferProvider | null
    {
        if(this._providers === null) return null;

        for(const provider of this._providers)
        {
            if(provider.enabled && provider.videoAvailable) return provider;
        }

        return null;
    }

    // AS3: OfferCenter.as::onOfferRewardDelivered()
    private onOfferRewardDelivered = (event: IMessageEvent): void =>
    {
        const parser = event.parser as OfferRewardDeliveredMessageParser | null;

        if(parser === null) return;

        this.addReward(parser.name, parser.contentType, parser.classId);
    };

    // AS3: OfferCenter.as::set offerExtension()
    set offerExtension(value: IOfferExtension | null)
    {
        this._offerExtension = value;
    }

    // AS3: OfferCenter.as::showRewards()
    showRewards(): void
    {
        this.hide();

        this._window = this._windowManager
            ?.buildWidgetLayout(OfferCenter.LAYOUT) as IWindowContainer | null ?? null;

        if(this._window === null)
        {
            log.warn(`${OfferCenter.LAYOUT} is not in the layout registry`);

            return;
        }

        this._window.procedure = this.windowProcedure;
        this._window.center();

        // The layout's first row is the stencil, not a reward: it is removed and cloned per payout.
        const list = this._window.findChildByName('reward_list') as unknown as IItemListWindow | null;

        this._rewardItemTemplate = list?.removeListItemAt(0) ?? null;

        this.populateRewardList();
    }

    // AS3: OfferCenter.as::showVideo()
    showVideo(): void
    {
        this._activeProvider?.showVideo();
    }

    // AS3: OfferCenter.as::get showingVideo()
    get showingVideo(): boolean
    {
        return this._activeProvider !== null && this._activeProvider.showingPopup;
    }

    // AS3: OfferCenter.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || !this.visible) return;

        if(window.name === 'header_button_close') this.hide();
    };

    // AS3: OfferCenter.as::hide()
    private hide(): void
    {
        if(this._window === null) return;

        this._rewardItemTemplate?.dispose();
        this._rewardItemTemplate = null;
        this._window.dispose();
        this._window = null;
    }

    /**
     * AS3: OfferCenter.as::addReward()
     *
     * Newest first, and the window either shows it immediately or the toolbar gets a badge — never
     * both, because a visible list is already the notification.
     */
    // AS3: OfferCenter.as::addReward()
    private addReward(name: string, contentType: string, classId: number): void
    {
        const reward = new OfferReward(name, contentType, classId);

        this._rewards.unshift(reward);

        if(this.visible)
        {
            const list = this._window?.findChildByName('reward_list') as unknown as IItemListWindow | null;
            const item = this.createRewardItem(reward);

            if(list !== null && item !== null) list.addListItemAt(item, 0);
        }
        else
        {
            this._offerExtension?.indicateRewards();
        }
    }

    /** The catalog doubles as the configuration manager — AS3 casts it to one. */
    // AS3: OfferCenter.as::get configuration()
    get configuration(): IHabboConfigurationManager | null
    {
        return this._catalog as unknown as IHabboConfigurationManager | null;
    }

    // AS3: OfferCenter.as::updateVideoStatus()
    updateVideoStatus(): void
    {
        if(this._offerExtension === null) return;

        this._activeProvider = this.getNextProvider();

        this._offerExtension.indicateVideoAvailable(
            this._activeProvider !== null && this._activeProvider.videoAvailable
        );
    }

    // AS3: OfferCenter.as::populateRewardList()
    private populateRewardList(): void
    {
        if(!this.visible) return;

        const list = this._window?.findChildByName('reward_list') as unknown as IItemListWindow | null;

        if(list === null) return;

        list.destroyListItems();

        for(const reward of this._rewards)
        {
            const item = this.createRewardItem(reward);

            if(item !== null) list.addListItem(item);
        }
    }

    /**
     * AS3: OfferCenter.as::createRewardItem()
     *
     * The date is stamped at render time, not stored on the reward — so a list reopened tomorrow
     * says tomorrow. That is AS3's behaviour and not an oversight to fix here.
     */
    // AS3: OfferCenter.as::createRewardItem()
    private createRewardItem(reward: OfferReward): IWindow | null
    {
        const item = this._rewardItemTemplate?.clone() as IWindowContainer | null ?? null;

        if(item === null) return null;

        const date = item.findChildByName('reward_date');
        const name = item.findChildByName('reward_name');

        if(date !== null) date.caption = new Date().toLocaleString();
        if(name !== null) name.caption = reward.name;

        this._catalog?.displayProductIcon(
            reward.contentType, reward.classId, item.findChildByName('reward_icon')
        );

        return item;
    }

    // AS3: OfferCenter.as::get visible()
    private get visible(): boolean
    {
        return this._window !== null && !this._window.disposed && this._window.visible;
    }

    /** AS3's body is empty — the payout already arrives as its own message. */
    // AS3: OfferCenter.as::showSuccess()
    showSuccess(): void
    {
    }

    // AS3: OfferCenter.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: OfferCenter.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._providers !== null)
        {
            for(const provider of this._providers) provider.dispose();

            this._providers = null;
        }

        if(this._pollTimer !== null)
        {
            clearInterval(this._pollTimer);
            this._pollTimer = null;
        }

        if(this._offerRewardDeliveredMessageEvent !== null)
        {
            this._catalog?.connection?.removeMessageEvent(this._offerRewardDeliveredMessageEvent);
            this._offerRewardDeliveredMessageEvent = null;
        }

        this._rewards = [];
        this._offerExtension = null;
        this._windowManager = null;
        this._catalog = null;
        this._disposed = true;
    }
}
