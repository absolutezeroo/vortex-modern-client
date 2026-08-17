import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {OrderedMap} from '@core/utils/OrderedMap';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import {ExtensionViewEvent} from '@habbo/toolbar/events/ExtensionViewEvent';
import type {BadgeImageReadyEvent} from '@habbo/session/events/BadgeImageReadyEvent';
import type {HabboNotifications} from '../HabboNotifications';
import type {HabboNotificationItem} from './HabboNotificationItem';
import {HabboNotificationItemView} from './HabboNotificationItemView';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.notifications.singular.HabboNotificationViewManager');

/**
 * The stack of notification bubbles: where each one goes, when there is no room for another, and
 * which one gets pushed out when the same notification arrives twice.
 *
 * It owns the views and drives them from its own frame update — the controller only hands it
 * items. Vertical layout is recomputed every frame (`updateVerticalTargets`) rather than on
 * insertion, which is what lets a bubble fading out in the middle of the stack pull the ones
 * below it up while it goes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as
 */
export class HabboNotificationViewManager implements IUpdateReceiver
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::SPACING
    private static readonly SPACING: number = 4;

    /**
     * The layout every style uses unless its config entry names a `customlayout`.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::showItem() (literal)
    private static readonly DEFAULT_LAYOUT: string = 'layout_notification_xml';

    /**
     * The height a bubble is assumed to need when the view config declares none — also the
     * headroom `isSpaceAvailable()` requires below the last bubble.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::getVisibleCapacity() (literal 70)
    private static readonly DEFAULT_VIEW_HEIGHT: number = HabboNotificationItemView.MAX_HEIGHT;

    /**
     * Below this many bubbles on screen, a duplicate is never displaced — the stack is not full
     * enough for it to matter.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::getDuplicateFadeThreshold() (literal 4)
    private static readonly MIN_DUPLICATE_FADE_THRESHOLD: number = 4;

    /**
     * The fraction of the visible capacity at which duplicates start displacing each other.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::getDuplicateFadeThreshold() (literal 0.65)
    private static readonly DUPLICATE_FADE_RATIO: number = 0.65;

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::_notifications
    private _notifications: HabboNotifications | null;

    /**
     * The toolbar this manager currently has its resize listener on, which is how the
     * subscription follows a dependency that resolves late — see `toolbar`.
     */
    // TS-only: AS3 caches `_toolbar` once, because its dependency is guaranteed by then.
    private _listeningToolbar: IHabboToolbar | null = null;

    // TS-only: the constructor's window manager, kept only as a fallback — see `windowManager`.
    private _initialWindowManager: IHabboWindowManager | null = null;

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::_styleConfig
    private _styleConfig: OrderedMap<string, unknown> | null;

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::_viewConfig
    private _viewConfig: OrderedMap<string, unknown> | null;

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::_viewItems
    private _viewItems: HabboNotificationItemView[] = [];

    // TS-only: AS3 passes the method itself; a bound reference is needed to remove the listener.
    private readonly _refreshTopMarginBound = (): void => this.refreshTopMargin();

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::HabboNotificationViewManager()
    constructor(
        notifications: HabboNotifications,
        assets: IAssetLibrary | null,
        windowManager: IHabboWindowManager | null,
        toolbar: IHabboToolbar | null,
        styleConfig: OrderedMap<string, unknown> | null,
        viewConfig: OrderedMap<string, unknown> | null
    )
    {
        this._notifications = notifications;
        this._assets = assets;
        this._styleConfig = styleConfig;
        this._viewConfig = viewConfig;

        // Both parameters are AS3's, and both are normally null here — see `toolbar` and
        // `windowManager`. Passed through the same reconciliation anyway so a caller that does
        // have them (a test, or a future ordering where the UI attaches first) is honoured.
        this.syncToolbar(toolbar);
        this._initialWindowManager = windowManager;

        this._notifications.registerUpdateReceiver(this, 2);
    }

    // AS3: .../src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * The toolbar, read live rather than cached.
     *
     * AS3 declares `IIDHabboToolbar` a *required* dependency of `HabboNotifications`, so by the
     * time this manager is constructed the toolbar exists and caching it is safe. This port
     * declares it optional and attaches the toolbar component after the notifications one, so the
     * constructor sees null and a cached reference would stay null forever — the bubble stack
     * would then start at y=4, on top of the toolbar, for the whole session.
     *
     * Reading it here also keeps the resize subscription honest: it moves to whichever toolbar is
     * current, and attaches the first time one shows up.
     */
    // TS-only: late binding for a dependency AS3 requires and this port does not.
    private get toolbar(): IHabboToolbar | null
    {
        return this.syncToolbar(this._notifications?.toolBar ?? null);
    }

    /**
     * The window manager, read live for the same reason as `toolbar` — it too attaches after the
     * notifications component.
     */
    // TS-only: late binding for a dependency AS3 requires and this port does not.
    private get windowManager(): IHabboWindowManager | null
    {
        return this._notifications?.windowManager ?? this._initialWindowManager;
    }

    /**
     * Builds and stacks a bubble for `item`, or refuses when there is no room left on screen.
     *
     * @returns false when the item was not displayed — the caller disposes it in that case
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::showItem()
    showItem(item: HabboNotificationItem): boolean
    {
        if(!this.isSpaceAvailable()) return false;

        // Once the stack is near capacity, an incoming duplicate takes an existing bubble's place
        // rather than adding to the pile — that is what keeps a spammed notification from filling
        // the screen.
        if(this.countVisibleItems() >= this.getDuplicateFadeThreshold())
        {
            this.findItemToReplace(item)?.remove();
        }

        const windowManager = this.windowManager;

        if(windowManager === null) return false;

        const layoutName = item.style?.customLayout ?? HabboNotificationViewManager.DEFAULT_LAYOUT;
        const customView = item.style?.customView ?? null;
        const viewConfig = (customView === null
            ? this._viewConfig?.getValue('view')
            : this._viewConfig?.getValue(customView)) as OrderedMap<string, unknown> | null ?? null;

        const layout = (this._assets?.getAssetByName(layoutName) as XmlAsset | null)?.content ?? null;

        if(layout === null)
        {
            log.warn(`Missing notification layout "${layoutName}" — the bubble is not built`);

            return false;
        }

        const view = new HabboNotificationItemView(
            this._notifications?.localizationManager ?? null,
            layout,
            windowManager,
            this._styleConfig,
            viewConfig,
            item
        );

        view.reposition(this.getNextAvailableVerticalPosition());

        this._viewItems.push(view);
        this._viewItems.sort((a, b) => a.verticalPosition - b.verticalPosition);

        return true;
    }

    /**
     * Whether one more bubble would still fit above the bottom of the desktop.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::isSpaceAvailable()
    isSpaceAvailable(): boolean
    {
        const desktopHeight = this.windowManager?.getDesktop(0)?.height ?? 0;

        return this.getNextAvailableVerticalPosition() + HabboNotificationItemView.MAX_HEIGHT < desktopHeight;
    }

    /**
     * Whether a bubble with this id is on screen and not already on its way out — the second
     * half of the controller's dedup test.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::hasNotificationId()
    hasNotificationId(notificationId: string | null): boolean
    {
        if(notificationId === null) return false;

        for(const view of this._viewItems)
        {
            if(view.notificationId === notificationId && !view.readyOrFading)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::removeNotificationById()
    removeNotificationById(notificationId: string | null): void
    {
        if(notificationId === null) return;

        for(const view of this._viewItems)
        {
            if(view.notificationId === notificationId)
            {
                view.remove();
            }
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::replaceIcon()
    replaceIcon(event: BadgeImageReadyEvent): void
    {
        for(const view of this._viewItems)
        {
            view.replaceIcon(event);
        }
    }

    /**
     * Advances every bubble, then drops the ones that finished. The removal pass runs after the
     * update pass, not inside it, so a view reaching IDLE this frame still got its last update.
     *
     * @param deltaTime Milliseconds since the previous frame
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::update()
    update(deltaTime: number): void
    {
        this.updateVerticalTargets();

        for(const view of this._viewItems)
        {
            view.update(deltaTime);
        }

        for(let i = 0; i < this._viewItems.length; i++)
        {
            const view = this._viewItems[i];

            if(view.ready)
            {
                view.dispose();
                this._viewItems.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * Re-stacks every bubble from the toolbar downwards. Called when the toolbar's extension
     * view changes height, which moves the top of the stack.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::refreshTopMargin()
    refreshTopMargin(): void
    {
        const extensionView = this.toolbar?.extensionView ?? null;

        if(extensionView === null) return;

        let top = extensionView.screenHeight + HabboNotificationViewManager.SPACING;

        for(const view of this._viewItems)
        {
            view.reposition(top);

            top = view.verticalPosition + view.height + HabboNotificationViewManager.SPACING;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::countVisibleItems()
    private countVisibleItems(): number
    {
        let count = 0;

        for(const view of this._viewItems)
        {
            if(!view.readyOrFading) count++;
        }

        return count;
    }

    /**
     * How full the stack has to be before duplicates start displacing each other: 65% of what
     * fits, never below four.
     *
     * A capacity of zero — no toolbar yet, or a desktop shorter than the toolbar — returns
     * `Number.MAX_SAFE_INTEGER` so the threshold is never reached and nothing is displaced.
     * (AS3 returns `int.MAX_VALUE`; the constant differs, the "never" does not.)
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::getDuplicateFadeThreshold()
    private getDuplicateFadeThreshold(): number
    {
        const capacity = this.getVisibleCapacity();

        if(capacity <= 0) return Number.MAX_SAFE_INTEGER;

        return Math.max(
            HabboNotificationViewManager.MIN_DUPLICATE_FADE_THRESHOLD,
            capacity * HabboNotificationViewManager.DUPLICATE_FADE_RATIO
        );
    }

    /**
     * How many bubbles fit between the toolbar and the bottom of the desktop.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::getVisibleCapacity()
    private getVisibleCapacity(): number
    {
        const extensionView = this.toolbar?.extensionView ?? null;
        const windowManager = this.windowManager;

        if(windowManager === null || extensionView === null) return 0;

        const top = extensionView.screenHeight + HabboNotificationViewManager.SPACING;
        const desktopHeight = windowManager.getDesktop(0)?.height ?? 0;
        const available = desktopHeight - top;

        if(available <= 0) return 0;

        let viewHeight = this.defaultViewHeight();

        if(viewHeight <= 0) viewHeight = HabboNotificationViewManager.DEFAULT_VIEW_HEIGHT;

        return Math.max(
            0,
            Math.trunc(
                (available + HabboNotificationViewManager.SPACING)
                / (viewHeight + HabboNotificationViewManager.SPACING)
            )
        );
    }

    /**
     * Picks the bubble an incoming duplicate should replace: the first one in `_viewItems`
     * order that `findAllItemsToReplace()` marked as a candidate.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::findItemToReplace()
    private findItemToReplace(item: HabboNotificationItem): HabboNotificationItemView | null
    {
        const candidates = new Set<HabboNotificationItemView>();

        this.findAllItemsToReplace(item, this._viewItems.length - 1, candidates);

        for(const view of this._viewItems)
        {
            if(candidates.has(view)) return view;
        }

        return null;
    }

    /**
     * Walks the stack looking for a bubble showing the same style *and* the same text, recursing
     * down through the stack's own items as the reference — so a run of identical notifications
     * collapses onto one another rather than each finding only the newest.
     *
     * Falls back to every displaceable bubble when nothing matched, which is what makes the
     * duplicate threshold act as a general cap once it is reached.
     *
     * `staysVisible` bubbles are never candidates: they are the ones the user or their producer
     * has to dismiss.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::findAllItemsToReplace()
    private findAllItemsToReplace(
        item: HabboNotificationItem,
        upperIndex: number,
        candidates: Set<HabboNotificationItemView>
    ): void
    {
        for(let i = 0; i <= upperIndex; i++)
        {
            const view = this._viewItems[i];

            if(view === undefined) continue;

            if(!view.readyOrFading
                && view.styleName === (item.style?.styleName ?? null)
                && view.content === item.content
                && !view.staysVisible)
            {
                candidates.add(view);
                break;
            }
        }

        if(upperIndex >= 2)
        {
            const reference = this._viewItems[upperIndex]?.item ?? null;

            if(reference !== null)
            {
                this.findAllItemsToReplace(reference, upperIndex - 1, candidates);
            }

            return;
        }

        if(candidates.size === 0)
        {
            for(const view of this._viewItems)
            {
                if(!view.readyOrFading && !view.staysVisible)
                {
                    candidates.add(view);
                }
            }
        }
    }

    /**
     * Assigns each visible bubble the y it should slide to, stacking them downwards from the
     * toolbar. Bubbles that are idle or fading are skipped, so the stack closes over them.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::updateVerticalTargets()
    private updateVerticalTargets(): void
    {
        const extensionView = this.toolbar?.extensionView ?? null;

        if(extensionView === null) return;

        let top = extensionView.screenHeight + HabboNotificationViewManager.SPACING;

        for(const view of this._viewItems)
        {
            if(!view.readyOrFading)
            {
                view.setVerticalTarget(top);

                top += view.height + HabboNotificationViewManager.SPACING;
            }
        }
    }

    /**
     * The y a new bubble should be placed at: the first gap in the stack big enough to hold it,
     * otherwise the bottom.
     *
     * With no toolbar there is nothing to stack under, and AS3 falls back to the same 4px the
     * constructor starts a view at.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::getNextAvailableVerticalPosition()
    private getNextAvailableVerticalPosition(): number
    {
        const extensionView = this.toolbar?.extensionView ?? null;

        if(extensionView === null) return HabboNotificationViewManager.SPACING;

        const top = extensionView.screenHeight + HabboNotificationViewManager.SPACING;

        if(this._viewItems.length === 0) return top;

        let candidate = top;

        for(const view of this._viewItems)
        {
            if(candidate + view.height < view.verticalPosition) return candidate;

            candidate = view.verticalPosition + view.height + HabboNotificationViewManager.SPACING;
        }

        return candidate;
    }

    /**
     * Moves the `EVE_EXTENSION_VIEW_RESIZED` subscription onto `toolbar`, detaching it from
     * whichever toolbar held it before. A no-op when nothing changed, so it is safe to call from
     * a getter that runs several times per frame.
     *
     * This is AS3's constructor-time `addEventListener` and its dispose-time `removeEventListener`
     * folded into one place, because in this port the toolbar arrives after the constructor.
     *
     * @returns the toolbar it was given, so callers can use it as a pass-through
     */
    // TS-only: see `toolbar`.
    private syncToolbar(toolbar: IHabboToolbar | null): IHabboToolbar | null
    {
        if(toolbar === this._listeningToolbar) return toolbar;

        this._listeningToolbar?.toolbarEvents.off(
            ExtensionViewEvent.EXTENSION_VIEW_RESIZED, this._refreshTopMarginBound
        );

        this._listeningToolbar = toolbar;

        toolbar?.toolbarEvents.on(ExtensionViewEvent.EXTENSION_VIEW_RESIZED, this._refreshTopMarginBound);

        return toolbar;
    }

    /**
     * The `view` entry's configured height, used as the per-bubble slot size when working out
     * capacity. AS3 reads `_viewConfig["view"]["height"]` straight through.
     */
    // TS-only: AS3's nested proxy read, with the string coercion the untyped config needs.
    private defaultViewHeight(): number
    {
        const view = this._viewConfig?.getValue('view') as OrderedMap<string, unknown> | null ?? null;
        const raw = view?.getValue('height') ?? null;

        if(raw === null) return 0;

        const parsed = Number(raw);

        return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationViewManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        while(this._viewItems.length > 0)
        {
            this._viewItems.pop()?.dispose();
        }

        this._assets = null;
        this._initialWindowManager = null;

        if(this._styleConfig)
        {
            this._styleConfig.dispose();
            this._styleConfig = null;
        }

        if(this._viewConfig)
        {
            this._viewConfig.dispose();
            this._viewConfig = null;
        }

        this.syncToolbar(null);

        if(this._notifications !== null)
        {
            this._notifications.removeUpdateReceiver(this);
            this._notifications = null;
        }

        this._disposed = true;

        log.debug('Notification view manager disposed');
    }
}
