import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {ActivityPointTypeEnum} from '@habbo/catalog/purse/ActivityPointTypeEnum';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

import {HabbiconPopupMode} from './HabbiconPopupMode';
import type {HabbiconEntryModel} from './HabbiconEntryModel';
import type {HabbiconTileView} from './HabbiconTileView';

/**
 * The bubble that opens above a clicked tile: the habbicon's name, what it costs or what you can do
 * with it, and one button.
 *
 * **It is a single layout element, not one popup per tile.** The same `habbicon_item_popup` is
 * reconfigured and repositioned on each click, which is why `showForTile()` has to hide and reset
 * every row rather than just filling the one it wants.
 *
 * **The dismiss-on-click listener ignores clicks for 75ms after opening.** Without that grace period
 * the very click that opened the popup would reach the stage listener and close it again — the
 * window system dispatches the tile's WME_CLICK before the DOM event finishes propagating.
 *
 * **Mouse wheel closes it unconditionally, and is watched in the capture phase** — scrolling the list
 * under the popup would otherwise leave the bubble floating over the wrong tile.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconPopupController.as
 */
export class HabbiconPopupController implements IDisposable
{
    // AS3: HabbiconPopupController.as::HABBICON_POPUP_HORIZONTAL_MARGIN
    private static readonly HORIZONTAL_MARGIN: number = 4;

    // AS3: HabbiconPopupController.as::HABBICON_POPUP_VERTICAL_OFFSET
    private static readonly VERTICAL_OFFSET: number = 2;

    // AS3: HabbiconPopupController.as::_SafeStr_11677 (name derived: the remove-favourite button)
    private static readonly REMOVE_FAVOURITE_COLOR: number = 7995440;

    /**
	 * AS3 inlines this for the claim and add-favourite buttons and names it nowhere.
	 */
    // AS3: HabbiconPopupController.as::configurePopup() — inline button colour (name derived)
    private static readonly POSITIVE_ACTION_COLOR: number = 106753;

    // AS3: HabbiconPopupController.as::showForTile() — inline grace period (name derived)
    private static readonly DISMISS_GRACE_MS: number = 75;

    // AS3: HabbiconPopupController.as::_SafeStr_6016 (name derived: the layer the popup lives on)
    private _layer: IWindowContainer | null;

    // AS3: HabbiconPopupController.as::_popup
    private _popup: IWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_7470 (name derived: the popup's content list)
    private _contentList: IItemListWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_8478 (name derived: the popup background)
    private _background: IWindow | null;

    // AS3: HabbiconPopupController.as::_popupTitle
    private _popupTitle: ITextWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_6663 (name derived: the description line)
    private _description: ITextWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_6957 (name derived: the action row)
    private _actionRow: IWindowContainer | null;

    // AS3: HabbiconPopupController.as::_SafeStr_5347 (name derived: the action button)
    private _actionButton: IWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_7092 (name derived: the price bar)
    private _bottomBar: IWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_7232 (name derived: the price text)
    private _price: ITextWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_6836 (name derived: the currency icon)
    private _currencyIcon: IIconWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_6294 (name derived: the buy button)
    private _buyButton: IWindow | null;

    // AS3: HabbiconPopupController.as::_SafeStr_5012 (name derived: the tile the popup is for)
    private _activeTile: HabbiconTileView | null = null;

    // AS3: HabbiconPopupController.as::_SafeStr_7481 (name derived: the action callback)
    private _onAction: ((tile: HabbiconTileView, mode: string) => void) | null;

    // AS3: HabbiconPopupController.as::_SafeStr_7061 (name derived: the buy callback)
    private _onBuy: ((tile: HabbiconTileView) => void) | null;

    // AS3: HabbiconPopupController.as::_onHide
    private _onHide: (() => void) | null;

    // AS3: HabbiconPopupController.as::_SafeStr_6981 (name derived: the hit test for tiles)
    private _isPointInsideAnyTile: ((x: number, y: number) => boolean) | null;

    // AS3: HabbiconPopupController.as::_SafeStr_5128 (name derived: the configuration manager)
    private _configuration: IHabboConfigurationManager | null;

    // AS3: HabbiconPopupController.as::_localization
    private _localization: IHabboLocalizationManager | null;

    // AS3: HabbiconPopupController.as::_SafeStr_7017 (name derived: the stage listeners are attached)
    private _attached: boolean = false;

    // AS3: HabbiconPopupController.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconPopupController.as::_SafeStr_9475 (name derived: clicks ignored until this time)
    private _dismissBlockedUntil: number = 0;

    // AS3: HabbiconPopupController.as::HabbiconPopupController()
    constructor(
        window: IWindowContainer | null,
        onAction: ((tile: HabbiconTileView, mode: string) => void) | null,
        onBuy: ((tile: HabbiconTileView) => void) | null,
        onHide: (() => void) | null,
        isPointInsideAnyTile: ((x: number, y: number) => boolean) | null,
        configuration: IHabboConfigurationManager | null,
        localization: IHabboLocalizationManager | null
    )
    {
        this._onAction = onAction;
        this._onBuy = onBuy;
        this._onHide = onHide;
        this._isPointInsideAnyTile = isPointInsideAnyTile;
        this._configuration = configuration;
        this._localization = localization;

        this._layer = (window?.findChildByName('habbicon_popup_layer') as IWindowContainer | null) ?? null;
        this._popup = window?.findChildByName('habbicon_item_popup') ?? null;
        this._contentList = (window?.findChildByName('habbicon_popup_content_list') as IItemListWindow | null) ?? null;
        this._background = window?.findChildByName('habbicon_popup_background') ?? null;
        this._popupTitle = (window?.findChildByName('habbicon_popup_title') as ITextWindow | null) ?? null;
        this._description = (window?.findChildByName('habbicon_popup_description') as ITextWindow | null) ?? null;
        this._actionRow = (window?.findChildByName('habbicon_popup_action_row') as IWindowContainer | null) ?? null;
        this._actionButton = window?.findChildByName('habbicon_popup_action_button') ?? null;
        this._bottomBar = window?.findChildByName('habbicon_popup_bottom_bar') ?? null;
        this._price = (window?.findChildByName('habbicon_popup_price') as ITextWindow | null) ?? null;
        this._currencyIcon = (window?.findChildByName('habbicon_popup_currency_icon') as IIconWindow | null) ?? null;
        this._buyButton = window?.findChildByName('habbicon_popup_buy_button') ?? null;

        this._actionButton?.addEventListener('WME_CLICK', this.onPopupActionClicked);
        this._buyButton?.addEventListener('WME_CLICK', this.onPopupBuyClicked);

        this.hide(false);
    }

    // AS3: HabbiconPopupController.as::showForTile()
    showForTile(tile: HabbiconTileView | null): void
    {
        if(tile === null || tile.item === null || this._popup === null || this._layer === null) return;

        this._activeTile = tile;

        this.configurePopup(tile.item, HabbiconPopupMode.resolve(tile.item));

        this._popup.visible = true;

        this.arrangePopupLists();
        this.positionPopup(tile);

        this._popup.invalidate();
        this._dismissBlockedUntil = performance.now() + HabbiconPopupController.DISMISS_GRACE_MS;
    }

    /**
	 * `hide(false)` is the silent form: the constructor and every programmatic close use it so the
	 * owner is not told about a popup that was never shown.
	 */
    // AS3: HabbiconPopupController.as::hide()
    hide(notify: boolean = true): void
    {
        const wasVisible = this._popup !== null && this._popup.visible;

        if(this._popup !== null) this._popup.visible = false;

        this._activeTile = null;

        if(notify && wasVisible && this._onHide !== null) this._onHide();
    }

    /**
	 * AS3 reaches the Flash `Stage` through the desktop's display object. This port has no such
	 * bridge — the engine never sees the canvas element — so the listeners go on `globalThis`, which
	 * receives every pointer event the page does. The desktop argument is kept and checked, so the
	 * attach still happens at the same moment as AS3's.
	 */
    // AS3: HabbiconPopupController.as::attachToDesktop()
    attachToDesktop(desktop: IWindow | null): void
    {
        if(this._attached || desktop === null) return;

        globalThis.addEventListener('mousedown', this.onStageMouseDown);
        globalThis.addEventListener('wheel', this.onStageMouseWheel, true);

        this._attached = true;
    }

    // AS3: HabbiconPopupController.as::detachFromStage()
    detachFromStage(): void
    {
        if(this._attached)
        {
            globalThis.removeEventListener('mousedown', this.onStageMouseDown);
            globalThis.removeEventListener('wheel', this.onStageMouseWheel, true);
        }

        this._attached = false;
    }

    // AS3: HabbiconPopupController.as::get visible()
    get visible(): boolean
    {
        return this._popup !== null && this._popup.visible;
    }

    // AS3: HabbiconPopupController.as::get activeTile()
    get activeTile(): HabbiconTileView | null
    {
        return this._activeTile;
    }

    /**
	 * Three shapes share the one layout: a purchase shows the description and the price bar, an info
	 * popup shows the description alone, and the three action modes show the button row alone.
	 *
	 * Note the price is written in the `default` branch — the one that also covers `purchase` — so an
	 * info popup never touches it, and a stale price can survive under a hidden bar.
	 */
    // AS3: HabbiconPopupController.as::configurePopup()
    private configurePopup(item: HabbiconEntryModel | null, mode: string): void
    {
        if(this._popup === null
            || this._popupTitle === null
            || this._actionButton === null
            || this._actionRow === null
            || this._bottomBar === null
            || this._description === null)
        {
            return;
        }

        this._popupTitle.caption = item !== null && item.name.length > 0 ? item.name : 'Habbicon';

        const showsDescription = mode === HabbiconPopupMode.PURCHASE || mode === HabbiconPopupMode.INFO;
        const showsPrice = mode === HabbiconPopupMode.PURCHASE;
        const showsAction = !showsPrice && mode !== HabbiconPopupMode.INFO;

        (this._description as unknown as IWindow).visible = showsDescription;
        this._bottomBar.visible = showsPrice;
        (this._actionRow as unknown as IWindow).visible = showsAction;

        if(showsDescription) this._description.caption = this.resolveDescription(item, mode);

        let caption = '';

        switch(mode)
        {
            case HabbiconPopupMode.CLAIM:
                caption = this.localize('habbicon_reward.claim', 'Claim');
                this._actionButton.color = HabbiconPopupController.POSITIVE_ACTION_COLOR;
                break;
            case HabbiconPopupMode.REMOVE_FAVORITE:
                caption = this.localize('habbicon.favourite.remove', 'Remove from favourites');
                this._actionButton.color = HabbiconPopupController.REMOVE_FAVOURITE_COLOR;
                break;
            case HabbiconPopupMode.ADD_FAVORITE:
                caption = this.localize('habbicon.favourite.add', 'Add to favourites');
                this._actionButton.color = HabbiconPopupController.POSITIVE_ACTION_COLOR;
                break;
            default:
                if(this._price !== null)
                {
                    this._price.caption = item !== null
                        ? HabbiconPopupController.formatPrice(item.priceCredits, item.priceActivityPoints)
                        : '0';
                }

                if(this._currencyIcon !== null && item !== null)
                {
                    this._currencyIcon.style = this.getPriceIconStyle(item.priceActivityPoints, item.activityPointType);
                    this._currencyIcon.fitToSize();
                }
        }

        if(showsAction) this._actionButton.caption = caption;
    }

    /**
	 * Both the inner list and the popup itself are re-laid-out, because either may be an item list
	 * depending on the layout revision.
	 */
    // AS3: HabbiconPopupController.as::arrangePopupLists()
    private arrangePopupLists(): void
    {
        this._contentList?.arrangeListItems();

        const asList = this._popup as unknown as IItemListWindow | null;

        if(asList !== null && typeof asList.arrangeListItems === 'function') asList.arrangeListItems();
    }

    /**
	 * Centred over the tile and clamped to the layer, with a four-pixel margin left and right; the
	 * vertical clamp has no margin, so a tile at the very top puts the popup flush against it.
	 */
    // AS3: HabbiconPopupController.as::positionPopup()
    private positionPopup(tile: HabbiconTileView): void
    {
        const tileWindow = tile.window as unknown as IWindow | null;

        if(tileWindow === null || this._popup === null || this._layer === null) return;

        const tileRect = {x: 0, y: 0, width: 0, height: 0};
        const layerRect = {x: 0, y: 0, width: 0, height: 0};

        tileWindow.getGlobalRectangle(tileRect);
        (this._layer as unknown as IWindow).getGlobalRectangle(layerRect);

        const layerWidth = (this._layer as unknown as IWindow).width;
        const layerHeight = (this._layer as unknown as IWindow).height;

        let x = tileRect.x - layerRect.x + (tileRect.width - this._popup.width) * 0.5;
        const maxX = Math.max(
            HabbiconPopupController.HORIZONTAL_MARGIN,
            layerWidth - this._popup.width - HabbiconPopupController.HORIZONTAL_MARGIN
        );

        x = Math.max(HabbiconPopupController.HORIZONTAL_MARGIN, Math.min(maxX, x));

        let y = tileRect.y - layerRect.y - this._popup.height + HabbiconPopupController.VERTICAL_OFFSET;
        const maxY = Math.max(0, layerHeight - this._popup.height);

        y = Math.max(0, Math.min(maxY, y));

        this._popup.x = x;
        this._popup.y = y;
    }

    // AS3: HabbiconPopupController.as::onPopupActionClicked()
    private onPopupActionClicked = (_event: WindowMouseEvent): void =>
    {
        const item = this._activeTile?.item ?? null;

        if(this._onAction !== null && this._activeTile !== null && item !== null)
        {
            this._onAction(this._activeTile, HabbiconPopupMode.resolve(item));
        }
    };

    // AS3: HabbiconPopupController.as::onPopupBuyClicked()
    private onPopupBuyClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._onBuy !== null && this._activeTile !== null && this._activeTile.item !== null)
        {
            this._onBuy(this._activeTile);
        }
    };

    // AS3: HabbiconPopupController.as::resolveDescription()
    private resolveDescription(item: HabbiconEntryModel | null, mode: string): string
    {
        if(item === null) return this.localize('habbicon.popup.desc.not_owned', 'Not owned');

        if(mode === HabbiconPopupMode.PURCHASE) return this.localize('habbicon.popup.desc.not_owned', 'Not owned');

        if(mode === HabbiconPopupMode.INFO && item.isReward)
        {
            if(item.owned || item.favorite) return this.localize('generic.owned', 'Owned');

            if(item.claimable) return this.localize('habbicon_reward.claim', 'Claim');

            return this.localize('habbicon.popup.desc.locked', 'Locked');
        }

        if(item.owned || item.favorite) return this.localize('generic.owned', 'Owned');

        return this.localize('habbicon.popup.desc.not_owned', 'Not owned');
    }

    /**
	 * A click inside the popup, or on the tile it belongs to, is not a dismissal — the second test is
	 * what lets clicking the same tile twice keep the bubble open rather than flickering it.
	 */
    // AS3: HabbiconPopupController.as::onStageMouseDown()
    private onStageMouseDown = (event: MouseEvent): void =>
    {
        if(!this.visible) return;

        if(performance.now() <= this._dismissBlockedUntil) return;

        const point = HabbiconPopupController.toCanvasPoint(event);

        if(HabbiconPopupController.isPointInsideWindow(this._popup, point.x, point.y)) return;

        if(this._isPointInsideAnyTile !== null && this._isPointInsideAnyTile(point.x, point.y)) return;

        this.hide();
    };

    /**
	 * AS3 compares `stageX`/`stageY` against window-manager coordinates, which in Flash are the same
	 * space. Here the window manager draws into a canvas that can sit anywhere on the page, so the
	 * event has to be made canvas-local first. A click that misses the canvas entirely lands outside
	 * every window and dismisses the popup, which is the wanted behaviour.
	 */
    // TS-only: no AS3 counterpart; the Flash stage needed no coordinate conversion.
    private static toCanvasPoint(event: MouseEvent): {x: number; y: number}
    {
        const target = event.target;

        if(target instanceof HTMLCanvasElement)
        {
            const rect = target.getBoundingClientRect();

            return {x: event.clientX - rect.left, y: event.clientY - rect.top};
        }

        return {x: event.clientX, y: event.clientY};
    }

    // AS3: HabbiconPopupController.as::onStageMouseWheel()
    private onStageMouseWheel = (_event: WheelEvent): void =>
    {
        if(this.visible) this.hide();
    };

    // AS3: HabbiconPopupController.as::isPointInsideWindow()
    private static isPointInsideWindow(window: IWindow | null, x: number, y: number): boolean
    {
        if(window === null) return false;

        const rect = {x: 0, y: 0, width: 0, height: 0};

        window.getGlobalRectangle(rect);

        return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
    }

    // AS3: HabbiconPopupController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconPopupController.as::formatPrice()
    private static formatPrice(credits: number, activityPoints: number): string
    {
        if(credits > 0 && activityPoints > 0) return `${credits}c + ${activityPoints}`;

        if(credits > 0) return String(credits);

        return String(Math.max(0, activityPoints));
    }

    // AS3: HabbiconPopupController.as::getPriceIconStyle()
    private getPriceIconStyle(activityPoints: number, activityPointType: number): number
    {
        const configuration = this._configuration;

        // AS3 passes a possibly-null manager and would throw on the loyalty/seasonal branches that
        // read it. Returning the credits style keeps the icon sane instead of taking down the paint.
        if(configuration === null) return 35;

        const type = activityPoints > 0 ? activityPointType : ActivityPointTypeEnum.CREDITS;

        return ActivityPointTypeEnum.getIconStyleFor(type, configuration, false);
    }

    // AS3: HabbiconPopupController.as::localize()
    private localize(key: string, fallback: string): string
    {
        const value = this._localization?.getLocalization(key, fallback) ?? fallback;

        return value.length > 0 ? value : fallback;
    }

    // AS3: HabbiconPopupController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.hide(false);
        this.detachFromStage();

        this._actionButton?.removeEventListener('WME_CLICK', this.onPopupActionClicked);
        this._buyButton?.removeEventListener('WME_CLICK', this.onPopupBuyClicked);

        this._layer = null;
        this._popup = null;
        this._background = null;
        this._contentList = null;
        this._popupTitle = null;
        this._description = null;
        this._actionRow = null;
        this._actionButton = null;
        this._bottomBar = null;
        this._price = null;
        this._currencyIcon = null;
        this._buyButton = null;
        this._activeTile = null;
        this._onAction = null;
        this._onBuy = null;
        this._onHide = null;
        this._isPointInsideAnyTile = null;
        this._configuration = null;
        this._localization = null;
        this._disposed = true;
    }
}
