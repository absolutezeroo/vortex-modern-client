/**
 * RewardTrackPrizeTrackView — the horizontal track itself: two rows of prizes (free above, premium
 * below), the point markers between them, the fill bar, and the two page arrows.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/prizes/RewardTrackPrizeTrackView.as
 *
 * Slots are pooled per row and never shrink: `ensurePrizeSlots()` grows each row to the busiest
 * page's prize count, and `refreshPrizeSlots()` then binds or `clear()`s each one per page. So the
 * view allocates once and repaints, which is why paging is free.
 *
 * The arrow badges count prizes that are claimable but **not on this page** — split by which side of
 * the current page they sit on, so the player can see there is something behind them.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {WindowUtils} from '@core/window/utils/WindowUtils';
import type {RewardTrack} from '../../data/RewardTrack';
import type {RewardTrackPrize} from '../../data/RewardTrackPrize';
import type {RewardTrackController} from '../../RewardTrackController';
import {RewardTrackMainProgressBarView} from '../progress/RewardTrackMainProgressBarView';
import {RewardTrackPointIndicatorView} from './RewardTrackPointIndicatorView';
import {RewardTrackPrizeLayout} from './RewardTrackPrizeLayout';
import {RewardTrackPrizeView} from './RewardTrackPrizeView';

export class RewardTrackPrizeTrackView implements IDisposable
{
    /** The gap the layout scales against — AS3 passes this literal into `rebuild()`. */
    // AS3: RewardTrackPrizeTrackView.as::MIN_PRIZE_SPACING
    private static readonly MIN_PRIZE_SPACING: number = 15;

    /** Derived name — `_SafeStr_4593`. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_4593
    private _controller: RewardTrackController | null;

    /** Derived name — `_SafeStr_4821`. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_4821
    private _track: RewardTrack | null;

    // AS3: RewardTrackPrizeTrackView.as::_content
    private _content: IWindowContainer | null;

    /** Derived name — `_SafeStr_8235`: the container the point markers are parented to. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_8235
    private _pointIndicatorContainer: IWindowContainer | null;

    /** Derived name — `_SafeStr_7779`: the fill bar's container. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_7779
    private _progressBarContainer: IWindowContainer | null;

    /** Derived name — `_SafeStr_7038`: the free-prize tile the pool clones. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_7038
    private _freePrizeTemplate: IWindowContainer | null;

    /** Derived name — `_SafeStr_7239`: the premium-prize tile the pool clones. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_7239
    private _premiumPrizeTemplate: IWindowContainer | null;

    /** Derived name — `_SafeStr_7115`: the point-marker template. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_7115
    private _pointIndicatorTemplate: IWindowContainer | null;

    /** Derived name — `_SafeStr_6787`. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_6787
    private _previousRegion: IRegionWindow | null;

    /** Derived name — `_SafeStr_6684`. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_6684
    private _nextRegion: IRegionWindow | null;

    /** Derived name — `_SafeStr_7466`: the badge over the left arrow. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_7466
    private _previousUnclaimedIndicator: IWindowContainer | null;

    /** Derived name — `_SafeStr_7300`: the badge over the right arrow. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_7300
    private _nextUnclaimedIndicator: IWindowContainer | null;

    // AS3: RewardTrackPrizeTrackView.as::_layout
    private _layout: RewardTrackPrizeLayout | null;

    /** Derived name — `_SafeStr_5984`. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_5984
    private _progressBar: RewardTrackMainProgressBarView | null;

    /** Derived name — `_SafeStr_7361`: the free row's pooled slots. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_7361
    private _freePrizeViews: RewardTrackPrizeView[] = [];

    /** Derived name — `_SafeStr_7185`: the premium row's pooled slots. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_7185
    private _premiumPrizeViews: RewardTrackPrizeView[] = [];

    /** Derived name — `_SafeStr_6381`: both rows, for the sweeps that do not care which. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_6381
    private _allPrizeViews: RewardTrackPrizeView[] = [];

    /** Derived name — `_SafeStr_5832`. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_5832
    private _pointIndicatorViews: RewardTrackPointIndicatorView[] = [];

    // AS3: RewardTrackPrizeTrackView.as::_freePagePrizes
    private _freePagePrizes: RewardTrackPrize[][] = [];

    // AS3: RewardTrackPrizeTrackView.as::_premiumPagePrizes
    private _premiumPagePrizes: RewardTrackPrize[][] = [];

    // AS3: RewardTrackPrizeTrackView.as::_pagePointValues
    private _pagePointValues: number[][] = [];

    /** Derived name — `_SafeStr_4726`. */
    // AS3: RewardTrackPrizeTrackView.as::_SafeStr_4726
    private _currentPage: number = 0;

    // AS3: RewardTrackPrizeTrackView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackPrizeTrackView.as::RewardTrackPrizeTrackView()
    constructor(
        controller: RewardTrackController,
        track: RewardTrack,
        content: IWindowContainer,
        pointIndicatorContainer: IWindowContainer,
        progressBarContainer: IWindowContainer,
        freePrizeTemplate: IWindowContainer,
        premiumPrizeTemplate: IWindowContainer,
        pointIndicatorTemplate: IWindowContainer,
        previousRegion: IRegionWindow,
        nextRegion: IRegionWindow,
        previousUnclaimedIndicator: IWindowContainer,
        nextUnclaimedIndicator: IWindowContainer
    )
    {
        this._controller = controller;
        this._track = track;
        this._content = content;
        this._pointIndicatorContainer = pointIndicatorContainer;
        this._progressBarContainer = progressBarContainer;
        this._freePrizeTemplate = freePrizeTemplate;
        this._premiumPrizeTemplate = premiumPrizeTemplate;
        this._pointIndicatorTemplate = pointIndicatorTemplate;
        this._previousRegion = previousRegion;
        this._nextRegion = nextRegion;
        this._previousUnclaimedIndicator = previousUnclaimedIndicator;
        this._nextUnclaimedIndicator = nextUnclaimedIndicator;

        this._layout = new RewardTrackPrizeLayout();
        this._progressBar = new RewardTrackMainProgressBarView(progressBarContainer);

        (previousRegion as unknown as IWindow).addEventListener('WME_CLICK', this.onPreviousClicked);
        (nextRegion as unknown as IWindow).addEventListener('WME_CLICK', this.onNextClicked);

        this.refresh(false, true);
    }

    /** `resetPage` jumps to the page the player's own point total sits on. */
    // AS3: RewardTrackPrizeTrackView.as::refresh()
    public refresh(animate: boolean, resetPage: boolean): void
    {
        const track = this._track;
        const layout = this._layout;

        if(track === null || layout === null || this._content === null
            || this._freePrizeTemplate === null || this._premiumPrizeTemplate === null)
        {
            return;
        }

        layout.rebuild(
            track,
            (this._content as unknown as IWindow).width,
            (this._freePrizeTemplate as unknown as IWindow).width,
            RewardTrackPrizeTrackView.MIN_PRIZE_SPACING
        );

        this.buildPageData();

        this.ensurePrizeSlots(
            this._freePrizeViews,
            this._freePrizeTemplate,
            RewardTrackPrizeTrackView.maxPrizeCount(this._freePagePrizes)
        );
        this.ensurePrizeSlots(
            this._premiumPrizeViews,
            this._premiumPrizeTemplate,
            RewardTrackPrizeTrackView.maxPrizeCount(this._premiumPagePrizes)
        );
        this.ensurePointIndicatorSlots(this.maxPointIndicatorCount());

        if(resetPage)
        {
            this._currentPage = layout.pageForPoints(track.points);
        }

        this._currentPage = Math.max(0, Math.min(layout.pageCount - 1, this._currentPage));

        this.refreshPage(animate);
    }

    // AS3: RewardTrackPrizeTrackView.as::pointsUpdated()
    public pointsUpdated(animate: boolean): void
    {
        this.refreshPrizeStates();
        this.refreshPointIndicators();

        this._progressBar?.refreshByX(
            this._layout?.xForPoints(this._track?.points ?? 0, this._currentPage) ?? 0, animate
        );

        this.refreshUnclaimedIndicators();
    }

    // AS3: RewardTrackPrizeTrackView.as::prizeClaimed()
    public prizeClaimed(prize: RewardTrackPrize): void
    {
        const view = this.getPrizeView(prize);

        if(view !== null)
        {
            view.refreshState();
        }
        else
        {
            this.refreshPrizeStates();
        }

        this.refreshUnclaimedIndicators();
    }

    // AS3: RewardTrackPrizeTrackView.as::premiumUpdated()
    public premiumUpdated(animate: boolean): void
    {
        this.pointsUpdated(animate);
    }

    // AS3: RewardTrackPrizeTrackView.as::update()
    public update(deltaMs: number): void
    {
        this._progressBar?.update(deltaMs);
    }

    /**
     * Buckets every prize by page and row, and collects each page's distinct thresholds — a free and
     * a premium prize at the same threshold share one marker, which is what the seen-set is for.
     */
    // AS3: RewardTrackPrizeTrackView.as::buildPageData()
    private buildPageData(): void
    {
        const track = this._track;
        const layout = this._layout;

        if(track === null || layout === null) return;

        this._freePagePrizes = RewardTrackPrizeTrackView.createPageData<RewardTrackPrize[]>(
            layout.pageCount, () => []
        );
        this._premiumPagePrizes = RewardTrackPrizeTrackView.createPageData<RewardTrackPrize[]>(
            layout.pageCount, () => []
        );
        this._pagePointValues = RewardTrackPrizeTrackView.createPageData<number[]>(layout.pageCount, () => []);

        const seenPoints = RewardTrackPrizeTrackView.createPageData<Set<number>>(
            layout.pageCount, () => new Set<number>()
        );

        for(const prize of track.prizes)
        {
            const page = layout.pageForPoints(prize.requiredPoints);
            const rows = prize.premium ? this._premiumPagePrizes : this._freePagePrizes;

            rows[page].push(prize);

            if(!seenPoints[page].has(prize.requiredPoints))
            {
                seenPoints[page].add(prize.requiredPoints);
                this._pagePointValues[page].push(prize.requiredPoints);
            }
        }
    }

    // AS3: RewardTrackPrizeTrackView.as::createPrizePageData()
    private static createPageData<T>(pageCount: number, create: () => T): T[]
    {
        const pages: T[] = [];

        for(let page = 0; page < pageCount; page++)
        {
            pages.push(create());
        }

        return pages;
    }

    /** Slots are created hidden and only ever added, never removed — see the class note. */
    // AS3: RewardTrackPrizeTrackView.as::ensurePrizeSlots()
    private ensurePrizeSlots(views: RewardTrackPrizeView[], template: IWindowContainer, required: number): void
    {
        while(views.length < required)
        {
            const view = new RewardTrackPrizeView(template);
            const window = view.window as unknown as IWindow | null;

            if(window !== null)
            {
                window.visible = false;
                this._content?.addChild(window);
            }

            views.push(view);
            this._allPrizeViews.push(view);
        }
    }

    // AS3: RewardTrackPrizeTrackView.as::ensurePointIndicatorSlots()
    private ensurePointIndicatorSlots(required: number): void
    {
        const template = this._pointIndicatorTemplate;

        if(template === null) return;

        while(this._pointIndicatorViews.length < required)
        {
            const view = new RewardTrackPointIndicatorView(template);
            const window = view.window as unknown as IWindow | null;

            if(window !== null)
            {
                window.visible = false;
                this._pointIndicatorContainer?.addChild(window);
            }

            this._pointIndicatorViews.push(view);
        }
    }

    // AS3: RewardTrackPrizeTrackView.as::refreshPage()
    private refreshPage(animate: boolean): void
    {
        this.refreshPrizeSlots(this._freePrizeViews, this._freePagePrizes[this._currentPage] ?? []);
        this.refreshPrizeSlots(this._premiumPrizeViews, this._premiumPagePrizes[this._currentPage] ?? []);
        this.refreshPointIndicatorSlots(this._pagePointValues[this._currentPage] ?? []);

        this._progressBar?.refreshByX(
            this._layout?.xForPoints(this._track?.points ?? 0, this._currentPage) ?? 0, animate
        );

        this.refreshNavigation();
    }

    // AS3: RewardTrackPrizeTrackView.as::refreshPrizeSlots()
    private refreshPrizeSlots(views: RewardTrackPrizeView[], prizes: RewardTrackPrize[]): void
    {
        const controller = this._controller;
        const track = this._track;

        for(let index = 0; index < views.length; index++)
        {
            const view = views[index];

            if(index >= prizes.length)
            {
                view.clear();

                continue;
            }

            if(controller === null || track === null) continue;

            const prize = prizes[index];

            view.initialize(controller, track, prize);

            const window = view.window as unknown as IWindow | null;

            if(window === null) continue;

            const x = this._layout?.xForPoints(prize.requiredPoints, this._currentPage) ?? 0;

            window.x = Math.round(x - window.width / 2);
            window.visible = true;
        }
    }

    // AS3: RewardTrackPrizeTrackView.as::refreshPointIndicatorSlots()
    private refreshPointIndicatorSlots(pointValues: number[]): void
    {
        const track = this._track;

        for(let index = 0; index < this._pointIndicatorViews.length; index++)
        {
            const view = this._pointIndicatorViews[index];

            if(index >= pointValues.length)
            {
                view.clear();

                continue;
            }

            if(track === null) continue;

            view.initialize(track, pointValues[index]);

            const window = view.window as unknown as IWindow | null;

            if(window === null) continue;

            const x = this._layout?.xForPoints(pointValues[index], this._currentPage) ?? 0;

            window.x = Math.round(x - window.width / 2);
            window.visible = true;
        }
    }

    // AS3: RewardTrackPrizeTrackView.as::maxPrizeCount()
    private static maxPrizeCount(pages: RewardTrackPrize[][]): number
    {
        let highest = 0;

        for(const page of pages)
        {
            highest = Math.max(highest, page.length);
        }

        return highest;
    }

    // AS3: RewardTrackPrizeTrackView.as::maxPointIndicatorCount()
    private maxPointIndicatorCount(): number
    {
        let highest = 0;

        for(const page of this._pagePointValues)
        {
            highest = Math.max(highest, page.length);
        }

        return highest;
    }

    /** Only bound slots are refreshed; a cleared slot has no prize and nothing to say. */
    // AS3: RewardTrackPrizeTrackView.as::refreshPrizeStates()
    private refreshPrizeStates(): void
    {
        for(const view of this._allPrizeViews)
        {
            if(view.prize !== null) view.refreshState();
        }
    }

    // AS3: RewardTrackPrizeTrackView.as::refreshPointIndicators()
    private refreshPointIndicators(): void
    {
        for(const view of this._pointIndicatorViews)
        {
            view.refreshAvailability();
        }
    }

    // AS3: RewardTrackPrizeTrackView.as::getPrizeView()
    private getPrizeView(prize: RewardTrackPrize): RewardTrackPrizeView | null
    {
        for(const view of this._allPrizeViews)
        {
            if(view.prize === prize) return view;
        }

        return null;
    }

    // AS3: RewardTrackPrizeTrackView.as::refreshNavigation()
    private refreshNavigation(): void
    {
        const pageCount = this._layout?.pageCount ?? 1;

        if(this._previousRegion !== null)
        {
            WindowUtils.disableSection(this._previousRegion as unknown as IWindow, this._currentPage <= 0);
        }

        if(this._nextRegion !== null)
        {
            WindowUtils.disableSection(this._nextRegion as unknown as IWindow, this._currentPage >= pageCount - 1);
        }

        this.refreshUnclaimedIndicators();
    }

    /**
     * Counts claimable prizes that are not on this page, split by side. A prize that is claimable and
     * on screen needs no badge — the player can already see it.
     */
    // AS3: RewardTrackPrizeTrackView.as::refreshUnclaimedIndicators()
    private refreshUnclaimedIndicators(): void
    {
        const track = this._track;

        if(track === null) return;

        let behind = 0;
        let ahead = 0;

        for(const prize of track.prizes)
        {
            if(!prize.isClaimable(track)) continue;
            if(this.isPrizeVisibleOnPage(prize, this._currentPage)) continue;

            if((this._layout?.pageForPoints(prize.requiredPoints) ?? 0) < this._currentPage)
            {
                behind += 1;
            }
            else
            {
                ahead += 1;
            }
        }

        RewardTrackPrizeTrackView.setUnclaimedIndicator(
            this._previousUnclaimedIndicator, this.previousUnclaimedCountText, behind
        );
        RewardTrackPrizeTrackView.setUnclaimedIndicator(
            this._nextUnclaimedIndicator, this.nextUnclaimedCountText, ahead
        );
    }

    // AS3: RewardTrackPrizeTrackView.as::isPrizeVisibleOnPage()
    private isPrizeVisibleOnPage(prize: RewardTrackPrize, page: number): boolean
    {
        const rows = prize.premium ? this._premiumPagePrizes[page] : this._freePagePrizes[page];

        return (rows ?? []).indexOf(prize) >= 0;
    }

    /** AS3 leaves the stale caption in place when the count is zero — the badge is hidden anyway. */
    // AS3: RewardTrackPrizeTrackView.as::setUnclaimedIndicator()
    private static setUnclaimedIndicator(
        indicator: IWindowContainer | null, text: ITextWindow | null, count: number
    ): void
    {
        const window = indicator as unknown as IWindow | null;

        if(window !== null) window.visible = count > 0;

        if(count > 0 && text !== null) text.text = String(count);
    }

    // AS3: RewardTrackPrizeTrackView.as::onPreviousClicked()
    private onPreviousClicked = (): void =>
    {
        if(this._currentPage <= 0) return;

        this._currentPage -= 1;

        this.refreshPage(false);
    };

    // AS3: RewardTrackPrizeTrackView.as::onNextClicked()
    private onNextClicked = (): void =>
    {
        if(this._currentPage >= (this._layout?.pageCount ?? 1) - 1) return;

        this._currentPage += 1;

        this.refreshPage(false);
    };

    // AS3: RewardTrackPrizeTrackView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackPrizeTrackView.as::get previousUnclaimedCountText()
    private get previousUnclaimedCountText(): ITextWindow | null
    {
        const indicator = this._previousUnclaimedIndicator;

        return (indicator?.findChildByName('previous_unclaimed_count') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPrizeTrackView.as::get nextUnclaimedCountText()
    private get nextUnclaimedCountText(): ITextWindow | null
    {
        const indicator = this._nextUnclaimedIndicator;

        return (indicator?.findChildByName('next_unclaimed_count') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPrizeTrackView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        (this._previousRegion as unknown as IWindow | null)?.removeEventListener('WME_CLICK', this.onPreviousClicked);
        (this._nextRegion as unknown as IWindow | null)?.removeEventListener('WME_CLICK', this.onNextClicked);

        for(const view of this._allPrizeViews)
        {
            view.dispose();
        }

        for(const view of this._pointIndicatorViews)
        {
            view.dispose();
        }

        this._progressBar?.dispose();

        this._freePrizeViews = [];
        this._premiumPrizeViews = [];
        this._allPrizeViews = [];
        this._pointIndicatorViews = [];
        this._freePagePrizes = [];
        this._premiumPagePrizes = [];
        this._pagePointValues = [];
        this._progressBar = null;
        this._layout = null;
        this._controller = null;
        this._track = null;
        this._content = null;
        this._pointIndicatorContainer = null;
        this._progressBarContainer = null;
        this._freePrizeTemplate = null;
        this._premiumPrizeTemplate = null;
        this._pointIndicatorTemplate = null;
        this._previousRegion = null;
        this._nextRegion = null;
        this._previousUnclaimedIndicator = null;
        this._nextUnclaimedIndicator = null;
    }
}
