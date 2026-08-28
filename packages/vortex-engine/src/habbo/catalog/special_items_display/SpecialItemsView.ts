import type {IDisposable} from '@core/runtime/IDisposable';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {Logger} from '@core/utils/Logger';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {ProductImageWidget} from '@habbo/window/widgets/ProductImageWidget';
import type {ISpecialItem} from './model/ISpecialItem';
import type {SpecialItemsController} from './SpecialItemsController';
import {SpecialItemClaimState} from './SpecialItemsController';
import {SpecialItemElementView} from './view/SpecialItemElementView';
import {SpecialItemPageButtonView} from './view/SpecialItemPageButtonView';

const log = Logger.getLogger('habbo.catalog.special_items_display.SpecialItemsView');

/**
 * The special-items carousel: a rotating ring of products with a plaque for whichever is in front.
 *
 * The rotation is a **spring, not a tween**. `update()` computes the remaining distance, smooths a
 * speed toward it — creeping up at 5% a frame while accelerating, falling back at 15% while
 * decelerating — and never lets it drop below 0.05, so it always arrives. It also tracks
 * `_extraCycles`: pressing next repeatedly while already spinning adds whole extra turns rather
 * than queueing, which is what makes the wheel feel like it has momentum.
 *
 * The free claim is gated on having *looked at* every item: `markItemVisited()` counts them, and
 * only when the count reaches the set size does the controller become claimable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/special_items_display/SpecialItemsView.as
 */
export class SpecialItemsView implements IUpdateReceiver, IDisposable
{
    // AS3: SpecialItemsView.as::DESKTOP_WINDOW_LAYER
    public static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: SpecialItemsView.as::BLEND_BUFFERING
    private static readonly BLEND_BUFFERING: number = 0.1;

    // AS3: SpecialItemsView.as::CLAIM_HEIGHT
    public static readonly CLAIM_HEIGHT: number = 20;

    /** The layout, by the name the asset build ships it under. */
    // AS3: SpecialItemsView.as::SpecialItemsView() (its getAssetByName call)
    private static readonly LAYOUT: string = 'special_items_display_xml';

    // AS3: SpecialItemsView.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_4593`: the controller that owns this view. */
    // AS3: SpecialItemsView.as::_SafeStr_4593
    private _controller: SpecialItemsController | null;

    // AS3: SpecialItemsView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: SpecialItemsView.as::_window
    private _window: IFrameWindow | null = null;

    /** Derived name — `_SafeStr_7258`: the page-dot row lifted out of the layout to clone. */
    // AS3: SpecialItemsView.as::_SafeStr_7258
    private _pageTemplate: IRegionWindow | null = null;

    /** Derived name — `_SafeStr_6988`: the product-display cell lifted out to clone. */
    // AS3: SpecialItemsView.as::_SafeStr_6988
    private _productDisplayTemplate: IWidgetWindow | null = null;

    // AS3: SpecialItemsView.as::_pages
    private _pages: SpecialItemPageButtonView[] = [];

    /** Derived name — `_SafeStr_4874`: the dot currently lit. */
    // AS3: SpecialItemsView.as::_SafeStr_4874
    private _selectedPageButton: SpecialItemPageButtonView | null = null;

    /** Derived name — `_SafeStr_5687`: the carousel's elements, one per item. */
    // AS3: SpecialItemsView.as::_SafeStr_5687
    private _elements: SpecialItemElementView[] = [];

    // AS3: SpecialItemsView.as::_latestDisplayKey
    private _latestDisplayKey: string = '';

    // AS3: SpecialItemsView.as::_visitedItems
    private _visitedItems: boolean[] = [];

    /** Derived name — `_SafeStr_5930`: how many items have been looked at. */
    // AS3: SpecialItemsView.as::_SafeStr_5930
    private _visitedCount: number = 0;

    /** Derived name — `_SafeStr_4818`: the index the carousel is travelling to. */
    // AS3: SpecialItemsView.as::_SafeStr_4818
    private _targetIndex: number = 0;

    /** Derived name — `_SafeStr_5118`: whether the wheel is currently moving. */
    // AS3: SpecialItemsView.as::_SafeStr_5118
    private _rotating: boolean = false;

    /** Derived name — `_SafeStr_4712`: the current rotation, in fractional item indices. */
    // AS3: SpecialItemsView.as::_SafeStr_4712
    private _rotation: number = 0;

    /** Derived name — `_SafeStr_5401`: the smoothed speed the spring is carrying. */
    // AS3: SpecialItemsView.as::_SafeStr_5401
    private _speed: number = 0;

    /** Derived name — `_SafeStr_4925`: which way round the wheel is going. */
    // AS3: SpecialItemsView.as::_SafeStr_4925
    private _reverse: boolean = false;

    // AS3: SpecialItemsView.as::_extraCycles
    private _extraCycles: number = 0;

    /** Derived name — `_SafeStr_5206`: the index the plaque is currently showing, or -1. */
    // AS3: SpecialItemsView.as::_SafeStr_5206
    private _plaqueIndex: number = -1;

    /** Derived name — `_SafeStr_8033`: the last blend written to the plaque. */
    // AS3: SpecialItemsView.as::_SafeStr_8033
    private _lastPlaqueBlend: number = 1;

    /** Derived name — `_SafeStr_9482`: the last blend written to the spotlight. */
    // AS3: SpecialItemsView.as::_SafeStr_9482
    private _lastSpotlightBlend: number = 1;

    // AS3: SpecialItemsView.as::SpecialItemsView()
    constructor(controller: SpecialItemsController, windowManager: IHabboWindowManager)
    {
        this._windowManager = windowManager;
        this._controller = controller;

        this._window = windowManager.buildWidgetLayout(
            SpecialItemsView.LAYOUT, SpecialItemsView.DESKTOP_WINDOW_LAYER
        ) as IFrameWindow | null;

        if(this._window === null)
        {
            log.warn(`${SpecialItemsView.LAYOUT} is not in the layout registry`);

            return;
        }

        // Both templates are specimens the layout ships and the view clones; they are taken out of
        // the tree so they never render as a stray dot or an empty cell.
        this._pageTemplate = this.pageList?.getListItemAt(0) as unknown as IRegionWindow | null ?? null;
        this.pageList?.removeListItems();
        this._productDisplayTemplate =
            this.itemRotation?.removeChildAt(0) as unknown as IWidgetWindow | null ?? null;

        this.closeButton?.addEventListener('WME_CLICK', this.onClose);
        this.previousButton?.addEventListener('WME_CLICK', this.onPreviousClick);
        this.nextButton?.addEventListener('WME_CLICK', this.onNextClick);
        this.claimButton?.addEventListener('WME_CLICK', this.onClaimClick);

        controller.registerUpdateReceiver(this, 1);

        this.hide();
    }

    // AS3: SpecialItemsView.as::get localizations()
    private get localizations(): IHabboLocalizationManager | null
    {
        return this._controller?.localizationManager ?? null;
    }

    /**
     * AS3: SpecialItemsView.as::displayNewData()
     *
     * Everything below the key check is skipped when the same set is reopened, so returning to a
     * carousel you have already browsed keeps its visited marks and its position.
     */
    // AS3: SpecialItemsView.as::displayNewData()
    displayNewData(): void
    {
        const key = this._controller?.key ?? '';

        if(key !== this._latestDisplayKey && this._window !== null)
        {
            const localizations = this.localizations;

            this._window.caption = localizations?.getLocalizationWithParams(
                'special_items.title', '',
                'set_name', localizations.getLocalization(`special_items.${key}.title`)
            ) ?? '';

            const setTitle = this.setTitleText;
            const setDesc = this.setDescText;

            if(setTitle !== null) setTitle.text = localizations?.getLocalization(`special_items.${key}.header.title`) ?? '';
            if(setDesc !== null) setDesc.text = localizations?.getLocalization(`special_items.${key}.header.desc`) ?? '';

            this.initializePages();
            this.initializeElements();
            this.resetVisitedItems();
            this.resetToFirstElement();
        }

        this._latestDisplayKey = key;
        this._window?.activate();
        this.updateClaimState();
    }

    /**
     * AS3: SpecialItemsView.as::updateClaimState()
     *
     * The claim strip collapses to zero height rather than merely hiding, so a set without a free
     * claim has no gap where it would have been.
     */
    // AS3: SpecialItemsView.as::updateClaimState()
    updateClaimState(): void
    {
        const state = this._controller?.claimState ?? SpecialItemClaimState.NOT_APPLICABLE;
        const spacer = this.claimSpacer;
        const container = this.claimContainer;
        const button = this.claimButton;

        if(state === SpecialItemClaimState.NOT_APPLICABLE)
        {
            if(spacer !== null) spacer.height = 0;
            if(container !== null) container.visible = false;

            this.reevaluateClaimableState();

            return;
        }

        if(spacer !== null) spacer.height = SpecialItemsView.CLAIM_HEIGHT;
        if(container !== null) container.visible = true;

        if(button !== null)
        {
            if(state === SpecialItemClaimState.FETCHING || state === SpecialItemClaimState.BROWSING)
            {
                button.disable();
                button.caption = '${special_items.claim}';
            }
            else if(state === SpecialItemClaimState.CLAIMABLE)
            {
                button.enable();
                button.caption = '${special_items.claim}';
            }
            else if(state === SpecialItemClaimState.CLAIMED)
            {
                button.disable();
                button.caption = '${special_items.claimed}';
            }
        }

        this.reevaluateClaimableState();
    }

    // AS3: SpecialItemsView.as::resetVisitedItems()
    private resetVisitedItems(): void
    {
        this._visitedCount = 0;
        this._visitedItems = new Array(this._controller?.items.length ?? 0).fill(false);
    }

    // AS3: SpecialItemsView.as::clearPages()
    private clearPages(): void
    {
        this.pageList?.removeListItems();

        for(const page of this._pages) page.dispose();

        this._selectedPageButton = null;
        this._pages = [];
    }

    // AS3: SpecialItemsView.as::initializePages()
    private initializePages(): void
    {
        this.clearPages();

        for(let i = 0; i < this.totalElements; i++)
        {
            const page = new SpecialItemPageButtonView(this, i);

            if(page.window !== null) this.pageList?.addListItem(page.window);

            this._pages.push(page);
        }

        if((this._controller?.items.length ?? 0) === 0) return;

        this._selectedPageButton = this._pages[0];
        this._selectedPageButton.selected = true;
    }

    // AS3: SpecialItemsView.as::clearElements()
    private clearElements(): void
    {
        for(const element of this._elements)
        {
            if(element.window !== null) this.itemRotation?.removeChild(element.window);

            element.dispose();
        }

        this._elements = [];
    }

    // AS3: SpecialItemsView.as::initializeElements()
    private initializeElements(): void
    {
        this.clearElements();

        for(const item of this._controller?.items ?? [])
        {
            const element = new SpecialItemElementView(this, item);

            if(element.window !== null) this.itemRotation?.addChild(element.window);

            this._elements.push(element);
        }
    }

    // AS3: SpecialItemsView.as::resetToFirstElement()
    resetToFirstElement(): void
    {
        const items = this._controller?.items ?? [];

        if(items.length === 0) return;

        this.selectedPage = 0;

        this._plaqueIndex = -1;
        this.setItemPlaque(items[0]);

        this._targetIndex = 0;
        this._rotating = false;
        this._rotation = 0;
        this._speed = 0;
        this._reverse = false;
        this._extraCycles = 0;

        this.updateRotationAnimation();

        this.plaqueAndSpotlightBlend = 1;

        this.markItemVisited(this._targetIndex);
    }

    // AS3: SpecialItemsView.as::updateRotationAnimation()
    updateRotationAnimation(): void
    {
        for(const element of this._elements) element.updateRotation(this._rotation);
    }

    // AS3: SpecialItemsView.as::setItemPlaque()
    setItemPlaque(item: ISpecialItem): void
    {
        if(item.index === this._plaqueIndex) return;

        this._plaqueIndex = item.index;

        const title = this.itemTitleText;
        const desc = this.itemDescText;

        if(title !== null) title.text = item.name;
        if(desc !== null) desc.text = item.description;

        const widget = this.productIconWidget?.widget as unknown as ProductImageWidget | null ?? null;

        if(widget !== null) widget.productInfo = item;
    }

    // AS3: SpecialItemsView.as::get totalElements()
    get totalElements(): number
    {
        return this._controller?.items.length ?? 0;
    }

    /**
     * AS3: SpecialItemsView.as::onNextClick()
     *
     * The extra-cycle test asks whether the wheel is already past the target it is spinning toward;
     * if it is, pressing next again means another whole turn rather than a shorter one.
     */
    // AS3: SpecialItemsView.as::onNextClick()
    private onNextClick = (): void =>
    {
        const wasSpinningForward = this._rotating && !this._reverse;

        this.navigateTo((this._targetIndex + 1) % this.totalElements, true, false);

        this._extraCycles = Math.max(0, this._extraCycles);

        const passedTarget = (this._rotation > this._targetIndex - 1 && this._rotation < this._targetIndex)
            || (this._rotation > this.totalElements - 1 && this._targetIndex === 0);

        if(wasSpinningForward && passedTarget) this._extraCycles += 1;
    };

    // AS3: SpecialItemsView.as::onPreviousClick()
    private onPreviousClick = (): void =>
    {
        const wasSpinningBack = this._rotating && this._reverse;

        this.navigateTo((this._targetIndex - 1 + this.totalElements) % this.totalElements, true, true);

        this._extraCycles = Math.min(0, this._extraCycles);

        const passedTarget = this._rotation > this._targetIndex && this._rotation < this._targetIndex + 1;

        if(wasSpinningBack && passedTarget) this._extraCycles -= 1;
    };

    /**
     * AS3: SpecialItemsView.as::navigateTo()
     *
     * A click on a page dot (`fromButton` false) always takes the short way and cancels any extra
     * turns; the arrows keep the direction they were pressed in.
     */
    // AS3: SpecialItemsView.as::navigateTo()
    navigateTo(index: number, fromButton: boolean = false, reverse: boolean = false): void
    {
        this._targetIndex = index;
        this.selectedPage = index;

        this.markItemVisited(index);

        if(!fromButton)
        {
            this._extraCycles = 0;
            reverse = this._rotation > index;
        }

        this._reverse = reverse;

        if(!this._rotating)
        {
            this._speed = 0;
            this._rotating = true;
        }
    }

    /**
     * AS3: SpecialItemsView.as::update()
     *
     * `1000 / deltaMs` is AS3's frames-per-second estimate, and the speed is divided by it to get a
     * per-frame step — so the wheel travels the same arc per second whatever the frame rate.
     */
    // AS3: SpecialItemsView.as::update()
    update(deltaMs: number): void
    {
        if(!this._rotating) return;

        const total = this.totalElements;
        const framesPerSecond = 1000 / deltaMs;

        let distance = this._targetIndex - this._rotation;

        // Take the way round that matches the direction being travelled, not the shorter one.
        if(distance > 0 && this._reverse) distance -= total;
        else if(distance < 0 && !this._reverse) distance += total;

        if((!this._reverse && this._extraCycles > 0) || (this._reverse && this._extraCycles < 0))
        {
            distance += this._extraCycles * total;
        }

        let speed = Math.abs(distance) * 2;

        // Accelerating creeps (5% of the new value); decelerating gives way faster (15%).
        if(speed > this._speed) speed = this._speed * 0.95 + speed * 0.05;
        else speed = this._speed * 0.85 + speed * 0.15;

        speed = Math.max(0.05, speed);

        let step = speed / framesPerSecond;

        if(this._reverse) step *= -1;

        this._speed = speed;

        // Overshooting the target is how the spin ends: snap to it and stop.
        if((!this._reverse && step > distance) || (this._reverse && step < distance))
        {
            this._rotating = false;
            this._rotation = this._targetIndex;
            this._extraCycles = 0;
        }
        else
        {
            this._rotation += step;

            if(this._extraCycles !== 0)
            {
                const withinCycle = distance % total;

                if(this._extraCycles > 0 && !this._reverse && step > withinCycle) this._extraCycles -= 1;
                else if(this._extraCycles < 0 && this._reverse && step < withinCycle) this._extraCycles += 1;
            }

            if(this._rotation > total) this._rotation -= total;
            else if(this._rotation < 0) this._rotation += total;
        }

        this.updatePlaqueAndSpotlight();
        this.updateRotationAnimation();
    }

    /**
     * AS3: SpecialItemsView.as::updatePlaqueAndSpotlight()
     *
     * The plaque follows whichever element is most nearly centred, and only swaps to the incoming
     * one once that one is *more* centred than the outgoing — which is what stops the text flicking
     * back and forth mid-spin. It is suppressed entirely while extra turns are queued or the wheel
     * is moving faster than two items at a time.
     */
    // AS3: SpecialItemsView.as::updatePlaqueAndSpotlight()
    private updatePlaqueAndSpotlight(): void
    {
        if(!this._rotating)
        {
            this.plaqueAndSpotlightBlend = 1;

            const element = this._elements[this._targetIndex];

            if(element !== undefined) this.setItemPlaque(element.item);

            return;
        }

        let focus = 0;

        if(this._plaqueIndex !== -1)
        {
            focus = this._elements[this._plaqueIndex]?.focusValue ?? 0;
        }

        if(this._plaqueIndex !== this._targetIndex && this._plaqueIndex !== -1 && focus === 0)
        {
            this._plaqueIndex = -1;
        }

        if(this._plaqueIndex !== this._targetIndex && this._extraCycles === 0
            && this._speed < Math.min(2, this.totalElements - 1))
        {
            const incoming = this._elements[this._targetIndex];
            const incomingFocus = incoming?.focusValue ?? 0;

            if(incoming !== undefined && incomingFocus > focus)
            {
                focus = incomingFocus;
                this.setItemPlaque(incoming.item);
            }
        }

        this.plaqueAndSpotlightBlend = focus;
    }

    /**
     * AS3: SpecialItemsView.as::set plaqueAndSpotlightBlend()
     *
     * The spotlight never fades below 0.4 and only starts brightening in the last fifth of the
     * focus range, so the stage stays lit while the plaque itself fades all the way out. Both writes
     * are buffered by 0.1 for the same reason the elements buffer theirs.
     */
    // AS3: SpecialItemsView.as::set plaqueAndSpotlightBlend()
    set plaqueAndSpotlightBlend(value: number)
    {
        let spotlight = 0.4;

        if(value > 0.8) spotlight = 0.4 + ((value - 0.8) / 0.2) * 0.6;

        const spotlightChanged = Math.abs(this._lastSpotlightBlend - spotlight) > SpecialItemsView.BLEND_BUFFERING
            || (spotlight === 0.4 && this._lastSpotlightBlend !== 0.4)
            || (spotlight === 1 && this._lastSpotlightBlend !== 1);

        if(spotlightChanged)
        {
            const base = this.spotlightBaseImg;
            const image = this.spotlightImg;

            if(base !== null) base.blend = spotlight;
            if(image !== null) image.blend = spotlight;

            // AS3 does not update its own tracking field here; kept, because doing so would change
            // how often the write is skipped.
        }

        const plaqueChanged = Math.abs(this._lastPlaqueBlend - value) > SpecialItemsView.BLEND_BUFFERING
            || (value === 0 && this._lastPlaqueBlend !== 0)
            || (value === 1 && this._lastPlaqueBlend !== 1);

        if(!plaqueChanged) return;

        this._lastPlaqueBlend = value;

        const title = this.itemTitleText;
        const desc = this.itemDescText;

        if(title !== null) title.blend = value;
        if(desc !== null) desc.blend = value;

        const widget = this.productIconWidget?.widget as unknown as ProductImageWidget | null ?? null;

        if(widget !== null) widget.blend = value;

        const scrollbar = this.itemScrollArea?.findChildByName('_SCROLLBAR') as unknown as IWindowContainer | null ?? null;
        const track = scrollbar?.findChildByName('slider_track') as unknown as IWindowContainer | null ?? null;
        const bar = track?.findChildByName('slider_bar') ?? null;

        if(track !== null) track.blend = value;
        if(bar !== null) bar.blend = value;
    }

    // AS3: SpecialItemsView.as::set selectedPage()
    set selectedPage(index: number)
    {
        if(this._selectedPageButton !== null)
        {
            this._selectedPageButton.selected = false;
            this._selectedPageButton = null;
        }

        if(index >= 0 && index < this._pages.length)
        {
            this._selectedPageButton = this._pages[index];
            this._selectedPageButton.selected = true;
        }
    }

    // AS3: SpecialItemsView.as::onClose()
    private onClose = (): void =>
    {
        this.hide();
    };

    // AS3: SpecialItemsView.as::onClaimClick()
    private onClaimClick = (): void =>
    {
        if(this._controller?.claimState !== SpecialItemClaimState.CLAIMABLE) return;

        this._controller.makeClaim();
    };

    // AS3: SpecialItemsView.as::hide()
    hide(): void
    {
        if(!this.isShowing() || this._window === null) return;

        (this._windowManager?.getDesktop(SpecialItemsView.DESKTOP_WINDOW_LAYER) as unknown as IWindowContainer | null)
            ?.removeChild(this._window);
    }

    // AS3: SpecialItemsView.as::show()
    show(): void
    {
        if(this.isShowing() || this._window === null) return;

        const desktop = this._windowManager?.getDesktop(SpecialItemsView.DESKTOP_WINDOW_LAYER) as unknown as IWindowContainer | null ?? null;

        if(desktop === null) return;

        desktop.addChild(this._window);
        this._window.center();
    }

    // AS3: SpecialItemsView.as::isShowing()
    isShowing(): boolean
    {
        return this._window !== null && this._window.parent != null;
    }

    // AS3: SpecialItemsView.as::get pageTemplate()
    get pageTemplate(): IRegionWindow | null
    {
        return this._pageTemplate;
    }

    // AS3: SpecialItemsView.as::get productDisplayTemplate()
    get productDisplayTemplate(): IWidgetWindow | null
    {
        return this._productDisplayTemplate;
    }

    /** Counting an item as seen is what eventually unlocks the free claim. */
    // AS3: SpecialItemsView.as::markItemVisited()
    private markItemVisited(index: number): void
    {
        if(index < 0 || index >= this._visitedItems.length) return;

        if(this._visitedItems[index]) return;

        this._visitedItems[index] = true;
        this._visitedCount += 1;

        if(this._visitedCount === this._visitedItems.length) this.reevaluateClaimableState();
    }

    // AS3: SpecialItemsView.as::reevaluateClaimableState()
    private reevaluateClaimableState(): void
    {
        if(this._controller?.claimState !== SpecialItemClaimState.BROWSING) return;

        if(this._visitedItems.length === 0) return;

        if(this._visitedCount !== this._visitedItems.length) return;

        this._controller.makeClaimable();
    }

    // AS3: SpecialItemsView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: SpecialItemsView.as::get setTitleText()
    private get setTitleText(): ITextWindow | null
    {
        return this._window?.findChildByName('set_title') as unknown as ITextWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get setDescText()
    private get setDescText(): ITextWindow | null
    {
        return this._window?.findChildByName('set_desc') as unknown as ITextWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get spotlightImg()
    private get spotlightImg(): IStaticBitmapWrapperWindow | null
    {
        return this._window?.findChildByName('spotlight_img') as unknown as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get spotlightBaseImg()
    private get spotlightBaseImg(): IStaticBitmapWrapperWindow | null
    {
        return this._window?.findChildByName('spotlight_base_img') as unknown as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get itemRotation()
    private get itemRotation(): IWindowContainer | null
    {
        return this._window?.findChildByName('item_rotation') as unknown as IWindowContainer | null ?? null;
    }

    // AS3: SpecialItemsView.as::get previousButton()
    private get previousButton(): IRegionWindow | null
    {
        return this._window?.findChildByName('previous_button') as unknown as IRegionWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get nextButton()
    private get nextButton(): IRegionWindow | null
    {
        return this._window?.findChildByName('next_button') as unknown as IRegionWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get pageList()
    private get pageList(): IItemListWindow | null
    {
        return this._window?.findChildByName('page_list') as unknown as IItemListWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get claimContainer()
    private get claimContainer(): IWindowContainer | null
    {
        return this._window?.findChildByName('claim_container') as unknown as IWindowContainer | null ?? null;
    }

    // AS3: SpecialItemsView.as::get claimButton()
    private get claimButton(): IWindow | null
    {
        return this._window?.findChildByName('claim_btn') ?? null;
    }

    // AS3: SpecialItemsView.as::get claimSpacer()
    private get claimSpacer(): IWindowContainer | null
    {
        return this._window?.findChildByName('claim_spacer') as unknown as IWindowContainer | null ?? null;
    }

    // AS3: SpecialItemsView.as::get itemTitleText()
    private get itemTitleText(): ITextWindow | null
    {
        return this._window?.findChildByName('item_title') as unknown as ITextWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get itemDescText()
    private get itemDescText(): ITextWindow | null
    {
        return this._window?.findChildByName('item_desc') as unknown as ITextWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get productIconWidget()
    private get productIconWidget(): IWidgetWindow | null
    {
        return this._window?.findChildByName('product_icon') as unknown as IWidgetWindow | null ?? null;
    }

    // AS3: SpecialItemsView.as::get itemScrollArea()
    private get itemScrollArea(): IWindowContainer | null
    {
        return this._window?.findChildByName('item_scroll_area') as unknown as IWindowContainer | null ?? null;
    }

    // AS3: SpecialItemsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: SpecialItemsView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.clearPages();
        this._controller?.removeUpdateReceiver(this);

        this._targetIndex = 0;
        this._rotating = false;
        this._rotation = 0;
        this._speed = 0;
        this._reverse = false;
        this._plaqueIndex = 0;

        this._window?.dispose();
        this._window = null;
        this._pageTemplate?.dispose();
        this._pageTemplate = null;
        this._productDisplayTemplate?.dispose();
        this._productDisplayTemplate = null;
        this._controller = null;
        this._windowManager = null;
        this._pages = [];
        this._visitedItems = [];
        this._visitedCount = 0;
        this._disposed = true;
    }
}
