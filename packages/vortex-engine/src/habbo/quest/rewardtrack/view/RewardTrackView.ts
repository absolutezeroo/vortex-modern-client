/**
 * RewardTrackView — one reward track's whole window: header, prize track, task list and task
 * details, built from `reward_track_main_xml` and themed per track.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/RewardTrackView.as
 *
 * **The layout ships its own templates and this view tears them out.** `extractTemplates()` removes
 * the prize tile, the premium prize tile, the point marker, the task row and the rung row from the
 * tree before anything is built, so each becomes a detached prototype the sub-views clone. That is
 * also why `dispose()` disposes those five windows by hand: once removed they belong to nobody.
 *
 * `initialize()` is separate from the constructor because the sub-views take each other — the task
 * list takes the details view — and the templates must already be out of the tree by then.
 *
 * `shouldAnimate` is simply "am I on screen": a track that updates while hidden snaps rather than
 * animating into a window nobody is looking at.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {ITabButtonWindow} from '@core/window/components/ITabButtonWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {RewardTrack} from '../data/RewardTrack';
import type {RewardTrackPrize} from '../data/RewardTrackPrize';
import type {RewardTrackTask} from '../data/RewardTrackTask';
import type {RewardTrackController} from '../RewardTrackController';
import {RewardTrackHeaderView} from './header/RewardTrackHeaderView';
import {RewardTrackPrizeTrackView} from './prizes/RewardTrackPrizeTrackView';
import {RewardTrackTaskDetailsView} from './tasks/RewardTrackTaskDetailsView';
import {RewardTrackTaskListView} from './tasks/RewardTrackTaskListView';
import {RewardTrackTheme} from './theme/RewardTrackTheme';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

const log = Logger.getLogger('habbo.quest.rewardtrack.view.RewardTrackView');

export class RewardTrackView implements IDisposable, IUpdateReceiver
{
    /** AS3 passes the literal `1` to `buildFromXML`/`getDesktop`. */
    // AS3: RewardTrackView.as::RewardTrackView()
    private static readonly DESKTOP_WINDOW_LAYER: number = 1;

    /** Derived name — `_SafeStr_4593`. */
    // AS3: RewardTrackView.as::_SafeStr_4593
    private _controller: RewardTrackController | null;

    /** Derived name — `_SafeStr_4821`. */
    // AS3: RewardTrackView.as::_SafeStr_4821
    private _track: RewardTrack | null;

    // AS3: RewardTrackView.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_7038`: the free-prize tile pulled out of the layout. */
    // AS3: RewardTrackView.as::_SafeStr_7038
    private _prizeTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_7239`. */
    // AS3: RewardTrackView.as::_SafeStr_7239
    private _premiumPrizeTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_7115`. */
    // AS3: RewardTrackView.as::_SafeStr_7115
    private _pointIndicatorTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6979`: the task row pulled out of the `tasks` list. */
    // AS3: RewardTrackView.as::_SafeStr_6979
    private _taskRowTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5521`: the rung row pulled out of the `levels` list. */
    // AS3: RewardTrackView.as::_SafeStr_5521
    private _levelTemplate: IWindowContainer | null = null;

    // AS3: RewardTrackView.as::_theme
    private _theme: RewardTrackTheme | null;

    // AS3: RewardTrackView.as::_headerView
    private _headerView: RewardTrackHeaderView | null = null;

    /** Derived name — `_SafeStr_5815`. */
    // AS3: RewardTrackView.as::_SafeStr_5815
    private _prizeTrackView: RewardTrackPrizeTrackView | null = null;

    /** Derived name — `_SafeStr_6035`. */
    // AS3: RewardTrackView.as::_SafeStr_6035
    private _taskListView: RewardTrackTaskListView | null = null;

    /** Derived name — `_SafeStr_6581`. */
    // AS3: RewardTrackView.as::_SafeStr_6581
    private _taskDetailsView: RewardTrackTaskDetailsView | null = null;

    // AS3: RewardTrackView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackView.as::RewardTrackView()
    constructor(controller: RewardTrackController, track: RewardTrack)
    {
        this._controller = controller;
        this._track = track;
        this._theme = RewardTrackTheme.resolve(track.theme);

        const asset = (controller.assets?.getAssetByName('reward_track_main_xml') as XmlAsset | null) ?? null;
        const layout = asset?.content ?? null;
        const windowManager = controller.windowManager;

        if(layout === null || windowManager === null)
        {
            log.warn('Missing layout "reward_track_main_xml" — the reward track window is not built');

            return;
        }

        this._window = windowManager.buildFromXML(
            layout, RewardTrackView.DESKTOP_WINDOW_LAYER
        ) as unknown as IWindowContainer | null;

        if(this._window === null) return;

        this._theme.applyTo(this._window as unknown as IWindow);

        this.extractTemplates();

        this._window.enableLookupCache();

        this.closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onCloseClicked);
    }

    // AS3: RewardTrackView.as::initialize()
    public initialize(): void
    {
        const controller = this._controller;
        const track = this._track;
        const theme = this._theme;

        if(controller === null || track === null || theme === null) return;

        const header = this.headerContainer;
        const taskInfo = this.taskInfoContainer;
        const taskList = this.taskListContainer;
        const prizeContent = this.prizeContent;
        const pointsIndicator = this.pointsIndicator;
        const mainLoadingBar = this.mainLoadingBar;
        const previous = this.previousButton;
        const next = this.nextButton;
        const previousUnclaimed = this.previousUnclaimedIndicator;
        const nextUnclaimed = this.nextUnclaimedIndicator;

        if(header !== null)
        {
            this._headerView = new RewardTrackHeaderView(controller, header, track);
        }

        this.buildSeasonTabs(controller);

        if(taskInfo !== null && this._levelTemplate !== null)
        {
            this._taskDetailsView = new RewardTrackTaskDetailsView(
                controller, taskInfo, this._levelTemplate, theme
            );
        }

        if(taskList !== null && this._taskRowTemplate !== null && this._taskDetailsView !== null)
        {
            this._taskListView = new RewardTrackTaskListView(
                controller, taskList, this._taskRowTemplate, this._taskDetailsView, track, theme
            );
        }

        if(prizeContent !== null && pointsIndicator !== null && mainLoadingBar !== null
            && this._prizeTemplate !== null && this._premiumPrizeTemplate !== null
            && this._pointIndicatorTemplate !== null && previous !== null && next !== null
            && previousUnclaimed !== null && nextUnclaimed !== null)
        {
            this._prizeTrackView = new RewardTrackPrizeTrackView(
                controller,
                track,
                prizeContent,
                pointsIndicator,
                mainLoadingBar,
                this._prizeTemplate,
                this._premiumPrizeTemplate,
                this._pointIndicatorTemplate,
                previous,
                next,
                previousUnclaimed,
                nextUnclaimed
            );
        }
    }

    /**
     * Detaches the five prototypes the sub-views clone from. They leave the display list here and are
     * disposed by hand in `dispose()`, since no parent owns them afterwards.
     */
    // AS3: RewardTrackView.as::extractTemplates()
    private extractTemplates(): void
    {
        const prizeContent = this.prizeContent;
        const pointsIndicator = this.pointsIndicator;

        this._prizeTemplate = RewardTrackView.detach(prizeContent, 'prize_template');
        this._premiumPrizeTemplate = RewardTrackView.detach(prizeContent, 'prize_template_premium');
        this._pointIndicatorTemplate = RewardTrackView.detach(pointsIndicator, 'point_indicator_template');

        this._taskRowTemplate = (this.tasksList?.removeListItemAt(0) ?? null) as unknown as IWindowContainer | null;
        this._levelTemplate = (this.levelsList?.removeListItemAt(0) ?? null) as unknown as IWindowContainer | null;
    }

    // TS-only: the null-guarded form of AS3's `container.removeChild(container.findChildByName(name))`.
    private static detach(container: IWindowContainer | null, name: string): IWindowContainer | null
    {
        const child = container?.findChildByName(name) ?? null;

        if(container === null || child === null) return null;

        return container.removeChild(child) as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::show()
    public show(): void
    {
        this._headerView?.refreshOwnAvatar();
        this.syncSeasonTabSelection();

        const window = this._window as unknown as IWindow | null;

        if(window === null || window.parent !== null) return;

        const desktop = this._controller?.windowManager?.getDesktop(RewardTrackView.DESKTOP_WINDOW_LAYER) ?? null;

        if(desktop !== null) (desktop as unknown as IWindowContainer).addChild(window);
    }

    // AS3: RewardTrackView.as::hide()
    public hide(): void
    {
        const window = this._window as unknown as IWindow | null;

        if(window === null || window.parent === null) return;

        const desktop = this._controller?.windowManager?.getDesktop(RewardTrackView.DESKTOP_WINDOW_LAYER) ?? null;

        if(desktop !== null) (desktop as unknown as IWindowContainer).removeChild(window);
    }

    // AS3: RewardTrackView.as::activate()
    public activate(): void
    {
        (this._window as unknown as IWindow | null)?.activate();
    }

    // AS3: RewardTrackView.as::center()
    public center(): void
    {
        (this._window as unknown as IWindow | null)?.center();
    }

    // AS3: RewardTrackView.as::isShowing()
    public isShowing(): boolean
    {
        return ((this._window as unknown as IWindow | null)?.parent ?? null) !== null;
    }

    /** A hidden track snaps instead of animating — nobody would see the transition. */
    // AS3: RewardTrackView.as::get shouldAnimate()
    public get shouldAnimate(): boolean
    {
        return this.isShowing();
    }

    // AS3: RewardTrackView.as::taskProgressUpdated()
    public taskProgressUpdated(task: RewardTrackTask | null, hadProgress: boolean, wasComplete: boolean): void
    {
        this._headerView?.refreshPoints();
        this._prizeTrackView?.pointsUpdated(this.shouldAnimate);

        if(task !== null)
        {
            this._taskListView?.taskProgressUpdated(task, hadProgress, wasComplete, this.shouldAnimate);
        }
    }

    // AS3: RewardTrackView.as::prizeClaimed()
    public prizeClaimed(prize: RewardTrackPrize): void
    {
        this._headerView?.refreshRewardsCollected();
        this._prizeTrackView?.prizeClaimed(prize);
    }

    // AS3: RewardTrackView.as::premiumPurchased()
    public premiumPurchased(): void
    {
        this._headerView?.refreshPoints();
        this._taskListView?.premiumUpdated();
        this._prizeTrackView?.premiumUpdated(this.shouldAnimate);
    }

    // AS3: RewardTrackView.as::update()
    public update(deltaMs: number): void
    {
        this._taskListView?.update(deltaMs);
        this._prizeTrackView?.update(deltaMs);
    }

    // AS3: RewardTrackView.as::get location()
    public get location(): {x: number; y: number}
    {
        const window = this._window as unknown as IWindow | null;

        return {x: window?.x ?? 0, y: window?.y ?? 0};
    }

    // AS3: RewardTrackView.as::setLocation()
    public setLocation(location: {x: number; y: number}): void
    {
        const window = this._window as unknown as IWindow | null;

        if(window === null) return;

        window.x = location.x;
        window.y = location.y;
    }

    // AS3: RewardTrackView.as::onCloseClicked()
    private onCloseClicked = (): void =>
    {
        this.hide();
    };

    // AS3: RewardTrackView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackView.as::get track()
    public get track(): RewardTrack | null
    {
        return this._track;
    }

    // AS3: RewardTrackView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: RewardTrackView.as::get headerContainer()
    private get headerContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('header') ?? null) as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get prizeContent()
    private get prizeContent(): IWindowContainer | null
    {
        return (this._window?.findChildByName('prize_content') ?? null) as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get pointsIndicator()
    private get pointsIndicator(): IWindowContainer | null
    {
        return (this._window?.findChildByName('points_indicator') ?? null) as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get trackContainer()
    private get trackContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('track') ?? null) as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get mainLoadingBar()
    private get mainLoadingBar(): IWindowContainer | null
    {
        return (this.trackContainer?.findChildByName('loading_bar') ?? null) as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get previousButton()
    private get previousButton(): IRegionWindow | null
    {
        return (this._window?.findChildByName('previous_btn') ?? null) as unknown as IRegionWindow | null;
    }

    // AS3: RewardTrackView.as::get nextButton()
    private get nextButton(): IRegionWindow | null
    {
        return (this._window?.findChildByName('next_btn') ?? null) as unknown as IRegionWindow | null;
    }

    // AS3: RewardTrackView.as::get previousUnclaimedIndicator()
    private get previousUnclaimedIndicator(): IWindowContainer | null
    {
        const child = this._window?.findChildByName('previous_unclaimed_indicator') ?? null;

        return child as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get nextUnclaimedIndicator()
    private get nextUnclaimedIndicator(): IWindowContainer | null
    {
        const child = this._window?.findChildByName('next_unclaimed_indicator') ?? null;

        return child as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get taskListContainer()
    private get taskListContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('task_list') ?? null) as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get taskInfoContainer()
    private get taskInfoContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('task_info') ?? null) as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackView.as::get tasksList()
    private get tasksList(): IScrollableListWindow | null
    {
        return (this._window?.findChildByName('tasks') ?? null) as unknown as IScrollableListWindow | null;
    }

    // AS3: RewardTrackView.as::get levelsList()
    private get levelsList(): IScrollableListWindow | null
    {
        return (this._window?.findChildByName('levels') ?? null) as unknown as IScrollableListWindow | null;
    }

    // AS3: RewardTrackView.as::dispose()
    /**
     * One tab per reward track the server sent, above the header — the hotel's seasons.
     *
     * The whole strip is hidden when there is a single track, so a hotel running one permanent
     * track looks exactly as AS3 does. Selecting a tab reopens the window on that track;
     * `RewardTrackController` caches a view per track id, so switching back is instant.
     *
     * Follows `TopViewSelector`, the navigator's own tab code: clone the layout's template button,
     * give it a caption, an id and a procedure, then hand it to the context.
     */
    // DEVIATION: no AS3 counterpart. That build shipped one permanent track and its window has no
    //   selector at all; the protocol has always sent a list (`RewardTracksMessageEvent.tracks[]`)
    //   and the emulator serves every visible track, including a finished season whose claims are
    //   still open — so two are on screen together by design. The tab strip is added by
    //   `vortex-layouts/reward_track_main_xml.xml`; see App.ts step 3c for how that override works.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/view/TopViewSelector.as::refresh()
    private buildSeasonTabs(controller: RewardTrackController): void
    {
        const context = this.seasonTabContext;

        if(context === null) return;

        const template = (context as unknown as IWindowContainer).findChildByName('season_tab_button');

        if(template === null) return;

        // The template is a layout node, not a tab: it is detached either way, so the single-track
        // case leaves no stray button behind.
        ((template as unknown as IWindow).parent as unknown as IWindowContainer | null)
            ?.removeChild(template as unknown as IWindow);

        const tracks = controller.tracks;

        if(tracks.length < 2)
        {
            (context as unknown as IWindow).visible = false;
            (template as unknown as IWindow).dispose();

            return;
        }

        for(let i = 0; i < tracks.length; i++)
        {
            const tab = (template as unknown as IWindow).clone() as unknown as ITabButtonWindow;

            tab.caption = `\${reward_track.${tracks[i].id}.name}`;
            tab.id = i;
            tab.procedure = this.onSeasonTabClicked;

            context.addTabItem(tab);

            // The theme ran in the constructor, before these tabs existed, so each clone is painted
            // as it is added. That is what puts the strip in the season's colours instead of the
            // window chrome's grey — `RewardTrackTheme` recolours by tag, and the template carries
            // RECOLORABLE_MEDIUM.
            this._theme?.applyTo(tab as unknown as IWindow);
        }

        this.syncSeasonTabSelection();
        (template as unknown as IWindow).dispose();
    }

    /**
     * Marks the tab of the track this window shows.
     *
     * Called from `show()` as well as at build time, and that is the point: `openRewardTrack()`
     * keeps one window per track and re-attaches it rather than rebuilding, so a view that was
     * already constructed never runs `buildSeasonTabs()` again. Without this the strip kept
     * whatever it was showing when it was last on screen, and only a second click put it right.
     */
    // DEVIATION: no AS3 counterpart — see buildSeasonTabs().
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/view/TopViewSelector.as::selectTabByIndex()
    private syncSeasonTabSelection(): void
    {
        const context = this.seasonTabContext;

        if(context === null || context.selector === null) return;

        const index = this._controller?.tracks.findIndex((t) => t.id === this._track?.id) ?? -1;

        if(index < 0) return;

        const tab = context.getTabItemAt(index);

        if(tab !== null) (context.selector as unknown as {setSelected(item: IWindow): void}).setSelected(tab);
    }

    // DEVIATION: no AS3 counterpart — see buildSeasonTabs().
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/view/TopViewSelector.as::topViewSelectorButtonProcedure()
    private onSeasonTabClicked = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const chosen = this._controller?.tracks[window.id] ?? null;

        if(chosen === null || chosen.id === this._track?.id) return;

        // Recorded before reopening so the toolbar's Progression entry, which reads `activeTrack`,
        // follows the season the player is actually looking at.
        if(this._controller !== null) this._controller.activeTrack = chosen;

        this._controller?.openRewardTrack(chosen.id);
    };

    // DEVIATION: no AS3 counterpart — see buildSeasonTabs().
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/RewardTrackView.as
    private get seasonTabContext(): ITabContextWindow | null
    {
        return (this._window?.findChildByName('season_tab_context') ?? null) as unknown as ITabContextWindow | null;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._prizeTrackView?.dispose();
        this._taskListView?.dispose();
        this._taskDetailsView?.dispose();
        this._headerView?.dispose();

        this.closeButton?.removeEventListener(WindowMouseEvent.CLICK, this.onCloseClicked);

        this.hide();

        // The five templates left the display list in `extractTemplates()`, so nothing else disposes them.
        (this._prizeTemplate as unknown as IWindow | null)?.dispose();
        (this._premiumPrizeTemplate as unknown as IWindow | null)?.dispose();
        (this._pointIndicatorTemplate as unknown as IWindow | null)?.dispose();
        (this._taskRowTemplate as unknown as IWindow | null)?.dispose();
        (this._levelTemplate as unknown as IWindow | null)?.dispose();

        (this._window as unknown as IWindow | null)?.dispose();

        this._prizeTrackView = null;
        this._taskListView = null;
        this._taskDetailsView = null;
        this._headerView = null;
        this._prizeTemplate = null;
        this._premiumPrizeTemplate = null;
        this._pointIndicatorTemplate = null;
        this._taskRowTemplate = null;
        this._levelTemplate = null;
        this._window = null;
        this._controller = null;
        this._track = null;
        this._theme = null;
    }
}
