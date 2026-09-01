import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import {imageElementToBitmap} from '@core/utils/BitmapSlot';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {AvatarTextureUtils} from '@habbo/avatar/AvatarTextureUtils';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {
    Game2LeaderboardEntryData
} from '@habbo/communication/messages/parser/game/score/Game2LeaderboardEntryData';
import type {SnowWarEngine} from '../SnowWarEngine';
import {WindowUtils} from '../utils/WindowUtils';
import {LeaderboardTable} from './LeaderboardTable';
import {TotalGroupLeaderboardTable} from './TotalGroupLeaderboardTable';
import {TotalLeaderboardTable} from './TotalLeaderboardTable';
import {WeeklyFriendLeaderboardTable} from './WeeklyFriendLeaderboardTable';
import {WeeklyGroupLeaderboardTable} from './WeeklyGroupLeaderboardTable';
import {WeeklyTotalLeaderboardTable} from './WeeklyTotalLeaderboardTable';

const log = Logger.getLogger('habbo.game.snowwar.leaderboard.LeaderboardViewController');

/**
 * The snow-war high-score window: one window, six boards, one visible at a time.
 *
 * The six `LeaderboardTable`s are all constructed up front and all kept — switching view is a
 * state change plus a fresh request, never a rebuild — and `_state` is what every handler in here
 * branches on. The three text links cycle a *pair* of states each (friends all-time ↔ friends
 * weekly, and so on), while the two region buttons switch the all-time/this-week axis without
 * leaving the friends/hotel/group one.
 *
 * The window is built lazily, on the first `visible = true`, and every board's rows are drawn by
 * cloning one prototype list item — `snowwar_leaderboard_entry` — per row.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/leaderboard/LeaderboardViewController.as
 */
export class LeaderboardViewController implements IDisposable, IAvatarImageListener
{
    // AS3: LeaderboardViewController.as::STATE_FRIENDS_ALLTIME
    private static readonly STATE_FRIENDS_ALLTIME: number = 0;

    // AS3: LeaderboardViewController.as::STATE_ALLTIME
    private static readonly STATE_ALLTIME: number = 1;

    // AS3: LeaderboardViewController.as::STATE_WEEKLY
    private static readonly STATE_WEEKLY: number = 2;

    // AS3: LeaderboardViewController.as::STATE_FRIENDS_WEEKLY
    private static readonly STATE_FRIENDS_WEEKLY: number = 3;

    // AS3: LeaderboardViewController.as::STATE_GROUP_WEEKLY
    private static readonly STATE_GROUP_WEEKLY: number = 4;

    // AS3: LeaderboardViewController.as::STATE_GROUP_ALLTIME
    private static readonly STATE_GROUP_ALLTIME: number = 5;

    /** Derived name — `_SafeStr_4581`, the engine. */
    // AS3: LeaderboardViewController.as::_SafeStr_4581
    private _engine: SnowWarEngine | null;

    // AS3: LeaderboardViewController.as::_localization
    private _localization: IHabboLocalizationManager | null;

    // AS3: LeaderboardViewController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: LeaderboardViewController.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_4597`, one of the six `STATE_*` above. */
    // AS3: LeaderboardViewController.as::_SafeStr_4597
    private _state: number = LeaderboardViewController.STATE_FRIENDS_ALLTIME;

    /** Derived name — `_SafeStr_4652`, the row list. */
    // AS3: LeaderboardViewController.as::_SafeStr_4652
    private _list: IItemListWindow | null = null;

    // AS3: LeaderboardViewController.as::_listBorder
    private _listBorder: IWindow | null = null;

    /** Derived name — `_SafeStr_8025`; the "all / hotel" link. */
    // AS3: LeaderboardViewController.as::_SafeStr_8025
    private _changeView: IWindow | null = null;

    /** Derived name — `_SafeStr_8313`; the "groups" link. */
    // AS3: LeaderboardViewController.as::_SafeStr_8313
    private _changeGroupView: IWindow | null = null;

    /** Derived name — `_SafeStr_7770`; the "friends" link. */
    // AS3: LeaderboardViewController.as::_SafeStr_7770
    private _changeFriendsView: IWindow | null = null;

    /** Derived name — `_SafeStr_7102`; the this-week tab's bitmap. */
    // AS3: LeaderboardViewController.as::_SafeStr_7102
    private _thisWeekImage: IBitmapWrapperWindow | null = null;

    /** Derived name — `_SafeStr_7336`; the all-time tab's bitmap. */
    // AS3: LeaderboardViewController.as::_SafeStr_7336
    private _allTimeImage: IBitmapWrapperWindow | null = null;

    /** Derived name — `_SafeStr_6942`; the all-time tab's label. */
    // AS3: LeaderboardViewController.as::_SafeStr_6942
    private _allTimeText: ITextWindow | null = null;

    /** Derived name — `_SafeStr_6193`; the this-week tab's label, which doubles as the week number. */
    // AS3: LeaderboardViewController.as::_SafeStr_6193
    private _thisWeekText: ITextWindow | null = null;

    /** Derived name — `_SafeStr_5933`. */
    // AS3: LeaderboardViewController.as::_SafeStr_5933
    private _scrollUp: IWindow | null = null;

    /** Derived name — `_SafeStr_6693`. */
    // AS3: LeaderboardViewController.as::_SafeStr_6693
    private _scrollDown: IWindow | null = null;

    // AS3: LeaderboardViewController.as::_nextWeek
    private _nextWeek: IWindow | null = null;

    // AS3: LeaderboardViewController.as::_previousWeek
    private _previousWeek: IWindow | null = null;

    /** Derived name — `_SafeStr_6121`; the "year/week" label the this-week tab shows when paging back. */
    // AS3: LeaderboardViewController.as::_SafeStr_6121
    private _weekLabel: string | null = null;

    /** Derived name — `_SafeStr_4956`; minutes until the weekly board resets, counted down by the timer. */
    // AS3: LeaderboardViewController.as::_SafeStr_4956
    private _minutesUntilReset: number = 0;

    /** Derived name — `_SafeStr_5870`; AS3's minute `Timer`, a `setInterval` handle here. */
    // AS3: LeaderboardViewController.as::_SafeStr_5870
    private _weeklyResetTimer: ReturnType<typeof setInterval> | null = null;

    // TS-only: AS3's `Timer` carries its own repeat count; `setInterval` does not, so it is kept here.
    private _weeklyResetTicksLeft: number = 0;

    /** Derived name — `_SafeStr_9756`; `games.highscores.scrolling.enabled`. */
    // AS3: LeaderboardViewController.as::_SafeStr_9756
    private _scrollingEnabled: boolean = false;

    // AS3: LeaderboardViewController.as::_avatarPlaceholders
    private readonly _avatarPlaceholders: OrderedMap<string, IBitmapWrapperWindow>;

    /** Derived name — `_SafeStr_5432`; the friends all-time board, and the base-class instance. */
    // AS3: LeaderboardViewController.as::_SafeStr_5432
    private _friendsAllTime: LeaderboardTable | null;

    /** Derived name — `_SafeStr_5796`. */
    // AS3: LeaderboardViewController.as::_SafeStr_5796
    private _allTime: TotalLeaderboardTable | null;

    /** Derived name — `_SafeStr_5583`. */
    // AS3: LeaderboardViewController.as::_SafeStr_5583
    private _groupAllTime: TotalGroupLeaderboardTable | null;

    /** Derived name — `_SafeStr_4897`. */
    // AS3: LeaderboardViewController.as::_SafeStr_4897
    private _weekly: WeeklyTotalLeaderboardTable | null;

    /** Derived name — `_SafeStr_4856`. */
    // AS3: LeaderboardViewController.as::_SafeStr_4856
    private _groupWeekly: WeeklyGroupLeaderboardTable | null;

    /** Derived name — `_SafeStr_4884`. */
    // AS3: LeaderboardViewController.as::_SafeStr_4884
    private _friendsWeekly: WeeklyFriendLeaderboardTable | null;

    // AS3: LeaderboardViewController.as::_selectedGame
    private _selectedGame: number = 0;

    // AS3: LeaderboardViewController.as::LeaderboardViewController()
    constructor(engine: SnowWarEngine)
    {
        this._engine = engine;
        this._localization = engine.localization;
        this._avatarPlaceholders = new OrderedMap<string, IBitmapWrapperWindow>();
        this._scrollingEnabled = engine.config?.getBoolean('games.highscores.scrolling.enabled') ?? false;

        this._friendsAllTime = new LeaderboardTable(engine);
        this._allTime = new TotalLeaderboardTable(engine);
        this._groupAllTime = new TotalGroupLeaderboardTable(engine);
        this._weekly = new WeeklyTotalLeaderboardTable(engine);
        this._groupWeekly = new WeeklyGroupLeaderboardTable(engine);
        this._friendsWeekly = new WeeklyFriendLeaderboardTable(engine);

        this.sendGetFriendsAllTimeData();
    }

    // AS3: LeaderboardViewController.as::set selectedGame()
    public set selectedGame(selectedGame: number)
    {
        this._selectedGame = selectedGame;
    }

    // AS3: LeaderboardViewController.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: LeaderboardViewController.as::showFriendsAllTime()
    public showFriendsAllTime(): void
    {
        this._state = LeaderboardViewController.STATE_FRIENDS_ALLTIME;
        this.sendGetFriendsAllTimeData();
        this.setVisible(true);

        if(this._window) this._window.caption = '${snowwar.leaderboard.friends}';

        this.enableAllTimeButton();
        this.updateWeekSelection();
        this.populateList();
    }

    // AS3: LeaderboardViewController.as::showAllTime()
    public showAllTime(): void
    {
        this._state = LeaderboardViewController.STATE_ALLTIME;
        this.sendGetAllTimeData();
        this.setVisible(true);

        if(this._window) this._window.caption = '${snowwar.leaderboard.all}';

        this.enableAllTimeButton();
        this.updateWeekSelection();
        this.populateList();
    }

    // AS3: LeaderboardViewController.as::showGroupAllTime()
    public showGroupAllTime(): void
    {
        this._state = LeaderboardViewController.STATE_GROUP_ALLTIME;
        this.sendGetAllTimeGroupData();
        this.setVisible(true);

        if(this._window) this._window.caption = '${snowwar.leaderboard.all}';

        this.enableAllTimeButton();
        this.updateWeekSelection();
        this.populateList();
    }

    // AS3: LeaderboardViewController.as::showWeekly()
    public showWeekly(): void
    {
        this._state = LeaderboardViewController.STATE_WEEKLY;

        if(this._weekly) this._weekly.offset = 0;

        this.sendGetWeeklyData(0);
        this.setVisible(true);

        if(this._window) this._window.caption = '${snowwar.leaderboard.all}';

        this.enableThisWeekButton();
        this.updateWeekSelection();
        this.populateList();
    }

    // AS3: LeaderboardViewController.as::showGroupWeekly()
    public showGroupWeekly(): void
    {
        this._state = LeaderboardViewController.STATE_GROUP_WEEKLY;

        if(this._groupWeekly) this._groupWeekly.offset = 0;

        this.sendGetGroupWeeklyData(0);
        this.setVisible(true);

        if(this._window) this._window.caption = '${snowwar.leaderboard.all}';

        this.enableThisWeekButton();
        this.updateWeekSelection();
        this.populateList();
    }

    // AS3: LeaderboardViewController.as::showFriendsWeekly()
    public showFriendsWeekly(): void
    {
        this._state = LeaderboardViewController.STATE_FRIENDS_WEEKLY;

        if(this._friendsWeekly) this._friendsWeekly.offset = 0;

        this.sendGetFriendsWeeklyData(0);
        this.setVisible(true);

        if(this._window) this._window.caption = '${snowwar.leaderboard.friends}';

        this.enableThisWeekButton();
        this.updateWeekSelection();
        this.populateList();
    }

    // AS3: LeaderboardViewController.as::hide()
    public hide(): void
    {
        this.setVisible(false);
    }

    // AS3: LeaderboardViewController.as::addAllTimeData()
    public addAllTimeData(entries: Game2LeaderboardEntryData[], totalListSize: number): void
    {
        this._allTime?.addEntries(entries, totalListSize);

        if(this._state === LeaderboardViewController.STATE_ALLTIME && this.isVisible()) this.populateList();

        this.updateWeekSelection();
    }

    // AS3: LeaderboardViewController.as::addAllTimeGroupData()
    public addAllTimeGroupData(entries: Game2LeaderboardEntryData[], totalListSize: number, favouriteGroupId: number): void
    {
        this._groupAllTime?.addGroupEntries(entries, totalListSize, favouriteGroupId);

        if(this._state === LeaderboardViewController.STATE_GROUP_ALLTIME && this.isVisible()) this.populateList();

        this.updateWeekSelection();
    }

    // AS3: LeaderboardViewController.as::addFriendAllTimeData()
    public addFriendAllTimeData(entries: Game2LeaderboardEntryData[], totalListSize: number): void
    {
        this._friendsAllTime?.addEntries(entries, totalListSize);

        if(this._state === LeaderboardViewController.STATE_FRIENDS_ALLTIME && this.isVisible()) this.populateList();

        this.updateWeekSelection();
    }

    // AS3: LeaderboardViewController.as::addWeeklyData()
    public addWeeklyData(
        year: number,
        week: number,
        entries: Game2LeaderboardEntryData[],
        totalListSize: number,
        maxOffset: number,
        minutesUntilReset: number
    ): void
    {
        this.disposeWeeklyResetTimer();

        this._minutesUntilReset = minutesUntilReset;
        this._weekLabel = `${year}/${week}`;

        if(this._weekly)
        {
            this._weekly.maxOffset = maxOffset;
            this._weekly.addEntries(entries, totalListSize);
        }

        if(this._state === LeaderboardViewController.STATE_WEEKLY && this.isVisible()) this.populateList();

        this.updateWeekSelection();
    }

    // AS3: LeaderboardViewController.as::addWeeklyGroupData()
    public addWeeklyGroupData(
        year: number,
        week: number,
        entries: Game2LeaderboardEntryData[],
        totalListSize: number,
        maxOffset: number,
        minutesUntilReset: number,
        favouriteGroupId: number
    ): void
    {
        this.disposeWeeklyResetTimer();

        this._minutesUntilReset = minutesUntilReset;
        this._weekLabel = `${year}/${week}`;

        if(this._groupWeekly)
        {
            this._groupWeekly.maxOffset = maxOffset;
            this._groupWeekly.addGroupEntries(entries, totalListSize, favouriteGroupId);
        }

        if(this._state === LeaderboardViewController.STATE_GROUP_WEEKLY && this.isVisible()) this.populateList();

        this.updateWeekSelection();
    }

    // AS3: LeaderboardViewController.as::addFriendWeeklyData()
    public addFriendWeeklyData(
        year: number,
        week: number,
        entries: Game2LeaderboardEntryData[],
        totalListSize: number,
        maxOffset: number,
        minutesUntilReset: number
    ): void
    {
        this.disposeWeeklyResetTimer();

        this._minutesUntilReset = minutesUntilReset;
        this._weekLabel = `${year}/${week}`;

        if(this._friendsWeekly)
        {
            this._friendsWeekly.maxOffset = maxOffset;
            this._friendsWeekly.addEntries(entries, totalListSize);
        }

        if(this._state === LeaderboardViewController.STATE_FRIENDS_WEEKLY && this.isVisible()) this.populateList();

        this.updateWeekSelection();
    }

    /** The avatar renderer calls back once a placeholder figure has finished loading. */
    // AS3: LeaderboardViewController.as::avatarImageReady()
    public avatarImageReady(figureString: string): void
    {
        if(this._disposed) return;

        const slot = this._avatarPlaceholders.remove(figureString);

        if(slot && !slot.disposed) this.setAvatarImage(slot, figureString);
    }

    // AS3: LeaderboardViewController.as::sendGetFriendsAllTimeData()
    private sendGetFriendsAllTimeData(): void
    {
        this._friendsAllTime?.revertToDefaultView(this._selectedGame);
    }

    // AS3: LeaderboardViewController.as::sendGetAllTimeData()
    private sendGetAllTimeData(): void
    {
        this._allTime?.revertToDefaultView(this._selectedGame);
    }

    // AS3: LeaderboardViewController.as::sendGetAllTimeGroupData()
    private sendGetAllTimeGroupData(): void
    {
        this._groupAllTime?.revertToDefaultView(this._selectedGame);
    }

    // AS3: LeaderboardViewController.as::sendGetWeeklyData()
    private sendGetWeeklyData(offset: number): void
    {
        if(!this._weekly) return;

        this._weekly.offset = offset;
        this._weekly.revertToDefaultView(this._selectedGame);
    }

    // AS3: LeaderboardViewController.as::sendGetGroupWeeklyData()
    private sendGetGroupWeeklyData(offset: number): void
    {
        if(!this._groupWeekly) return;

        this._groupWeekly.offset = offset;
        this._groupWeekly.revertToDefaultView(this._selectedGame);
    }

    // AS3: LeaderboardViewController.as::sendGetFriendsWeeklyData()
    private sendGetFriendsWeeklyData(offset: number): void
    {
        if(!this._friendsWeekly) return;

        this._friendsWeekly.offset = offset;
        this._friendsWeekly.revertToDefaultView(this._selectedGame);
    }

    // AS3: LeaderboardViewController.as::get visible()
    private isVisible(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    // AS3: LeaderboardViewController.as::set visible()
    private setVisible(visible: boolean): void
    {
        if(visible && !this._window) this.createMainWindow();

        if(visible)
        {
            if(this._window)
            {
                this._window.visible = true;
                this._window.activate();
            }
        }
        else if(this._window)
        {
            this._window.visible = false;
        }
    }

    // AS3: LeaderboardViewController.as::createMainWindow()
    private createMainWindow(): void
    {
        if(this._window) return;

        this._window = WindowUtils.createWindow('snowwar_leaderboard', 1) as IWindowContainer | null;

        if(!this._window) return;

        this._window.center();
        this._window.findChildByTag('close')?.addEventListener(WindowMouseEvent.CLICK, () => this.hide());

        this._list = this._window.findChildByName('list') as IItemListWindow | null;
        this._listBorder = this._window.findChildByName('listBorder');

        this._changeView = this._window.findChildByName('changeView');
        this._changeView?.addEventListener(WindowMouseEvent.CLICK, () => this.onChangeView());

        this._changeGroupView = this._window.findChildByName('changeGroupView');
        this._changeGroupView?.addEventListener(WindowMouseEvent.CLICK, () => this.onChangeGroupView());

        this._changeFriendsView = this._window.findChildByName('changeFriendsView');
        this._changeFriendsView?.addEventListener(WindowMouseEvent.CLICK, () => this.onChangeFriendsView());

        this._window.findChildByName('all_time_region')
            ?.addEventListener(WindowMouseEvent.DOWN, () => this.onAllTimeButtonDown());
        this._window.findChildByName('this_week_region')
            ?.addEventListener(WindowMouseEvent.DOWN, () => this.onThisWeekButtonDown());

        this._allTimeImage = this._window.findChildByName('all_time_image') as IBitmapWrapperWindow | null;
        this._thisWeekImage = this._window.findChildByName('this_week_image') as IBitmapWrapperWindow | null;
        this._allTimeText = this._window.findChildByName('all_time_text') as ITextWindow | null;
        this._thisWeekText = this._window.findChildByName('this_week_text') as ITextWindow | null;

        this._scrollUp = this._window.findChildByName('scrollUp');
        this.addScrollButtonEventListeners(this._scrollUp);
        WindowUtils.setElementImage(this.firstChildOf(this._scrollUp), this.getBitmap('scroll_up_normal'));

        this._scrollDown = this._window.findChildByName('scrollDown');
        this.addScrollButtonEventListeners(this._scrollDown);
        WindowUtils.setElementImage(this.firstChildOf(this._scrollDown), this.getBitmap('scroll_down_normal'));

        this._nextWeek = this._window.findChildByName('nextWeek');
        this._nextWeek?.addEventListener(WindowMouseEvent.CLICK, () => this.onNextWeekButton());

        if(this._nextWeek) this._nextWeek.visible = false;

        this._previousWeek = this._window.findChildByName('previousWeek');
        this._previousWeek?.addEventListener(WindowMouseEvent.CLICK, () => this.onPreviousWeekButton());

        if(this._previousWeek) this._previousWeek.visible = false;

        this.updateScrollButtons();
        this.updateWeekSelection();
    }

    // AS3: LeaderboardViewController.as::addScrollButtonEventListeners()
    private addScrollButtonEventListeners(button: IWindow | null): void
    {
        if(!button) return;

        for(const type of [
            WindowMouseEvent.CLICK,
            WindowMouseEvent.OVER,
            WindowMouseEvent.OUT,
            WindowMouseEvent.DOWN,
            WindowMouseEvent.UP
        ])
        {
            button.addEventListener(type, (event) => this.onScrollButton(event as WindowMouseEvent));
        }
    }

    // AS3: LeaderboardViewController.as::enableAllTimeButton()
    private enableAllTimeButton(): void
    {
        if(this._thisWeekText) this._thisWeekText.textColor = 0;
        if(this._allTimeText) this._allTimeText.textColor = 0xFFFFFF;

        WindowUtils.setElementImage(this._thisWeekImage, this.getBitmap('left_blue'));
        WindowUtils.setElementImage(this._allTimeImage, this.getBitmap('right_black'));
    }

    // AS3: LeaderboardViewController.as::enableThisWeekButton()
    private enableThisWeekButton(): void
    {
        if(this._thisWeekText) this._thisWeekText.textColor = 0xFFFFFF;
        if(this._allTimeText) this._allTimeText.textColor = 0;

        WindowUtils.setElementImage(this._thisWeekImage, this.getBitmap('left_black'));
        WindowUtils.setElementImage(this._allTimeImage, this.getBitmap('right_blue'));
    }

    /** The "all / hotel" link cycles hotel all-time ↔ hotel weekly. */
    // AS3: LeaderboardViewController.as::onChangeView()
    private onChangeView(): void
    {
        switch(this._state)
        {
            case LeaderboardViewController.STATE_ALLTIME:
                this.showAllTime();
                break;
            case LeaderboardViewController.STATE_WEEKLY:
                this.showWeekly();
                break;
            default:
                this._state = LeaderboardViewController.STATE_WEEKLY;
                this.showWeekly();
        }
    }

    // AS3: LeaderboardViewController.as::onChangeFriendsView()
    private onChangeFriendsView(): void
    {
        switch(this._state)
        {
            case LeaderboardViewController.STATE_FRIENDS_ALLTIME:
                this.showFriendsAllTime();
                break;
            case LeaderboardViewController.STATE_FRIENDS_WEEKLY:
                this.showFriendsWeekly();
                break;
            default:
                this._state = LeaderboardViewController.STATE_FRIENDS_WEEKLY;
                this.showFriendsWeekly();
        }
    }

    // AS3: LeaderboardViewController.as::onChangeGroupView()
    private onChangeGroupView(): void
    {
        switch(this._state)
        {
            case LeaderboardViewController.STATE_GROUP_WEEKLY:
                this.showGroupWeekly();
                break;
            case LeaderboardViewController.STATE_GROUP_ALLTIME:
                this.showGroupAllTime();
                break;
            default:
                this._state = LeaderboardViewController.STATE_GROUP_WEEKLY;
                this.showGroupWeekly();
        }
    }

    /** The all-time tab keeps whichever of friends/hotel/group is showing. */
    // AS3: LeaderboardViewController.as::onAllTimeButtonDown()
    private onAllTimeButtonDown(): void
    {
        switch(this._state)
        {
            case LeaderboardViewController.STATE_WEEKLY:
                this.showAllTime();
                break;
            case LeaderboardViewController.STATE_FRIENDS_WEEKLY:
                this.showFriendsAllTime();
                break;
            case LeaderboardViewController.STATE_GROUP_WEEKLY:
                this.showGroupAllTime();
                break;
        }
    }

    // AS3: LeaderboardViewController.as::onThisWeekButtonDown()
    private onThisWeekButtonDown(): void
    {
        switch(this._state)
        {
            case LeaderboardViewController.STATE_FRIENDS_ALLTIME:
                this.showFriendsWeekly();
                break;
            case LeaderboardViewController.STATE_ALLTIME:
                this.showWeekly();
                break;
            case LeaderboardViewController.STATE_GROUP_ALLTIME:
                this.showGroupWeekly();
                break;
        }
    }

    // AS3: LeaderboardViewController.as::getCurrentLeaderboard()
    private getCurrentLeaderboard(): LeaderboardTable | null
    {
        switch(this._state)
        {
            case LeaderboardViewController.STATE_FRIENDS_ALLTIME: return this._friendsAllTime;
            case LeaderboardViewController.STATE_ALLTIME: return this._allTime;
            case LeaderboardViewController.STATE_WEEKLY: return this._weekly;
            case LeaderboardViewController.STATE_FRIENDS_WEEKLY: return this._friendsWeekly;
            case LeaderboardViewController.STATE_GROUP_WEEKLY: return this._groupWeekly;
            case LeaderboardViewController.STATE_GROUP_ALLTIME: return this._groupAllTime;
        }

        log.warn(`Invalid state ${this._state}`);

        return null;
    }

    // AS3: LeaderboardViewController.as::onScrollUp()
    private onScrollUp(): void
    {
        const table = this.getCurrentLeaderboard();

        if(table && table.scrollUp()) this.populateList();
    }

    // AS3: LeaderboardViewController.as::onScrollDown()
    private onScrollDown(): void
    {
        const table = this.getCurrentLeaderboard();

        if(table && table.scrollDown()) this.populateList();
    }

    /** One handler for both arrows and all five of their states — the asset name says which. */
    // AS3: LeaderboardViewController.as::onScrollButton()
    private onScrollButton(event: WindowMouseEvent): void
    {
        const isUp = event.window === this._scrollUp;
        const direction = isUp ? 'up' : 'down';
        let state = '';

        switch(event.type)
        {
            case WindowMouseEvent.CLICK:
                if(isUp) this.onScrollUp();
                else this.onScrollDown();

                return;
            case WindowMouseEvent.OUT:
                state = 'normal';
                break;
            case WindowMouseEvent.OVER:
                state = 'hilite';
                break;
            case WindowMouseEvent.DOWN:
                state = 'click';
                break;
            case WindowMouseEvent.UP:
                state = 'normal';
                break;
        }

        WindowUtils.setElementImage(
            this.firstChildOf(event.window ?? null),
            this.getBitmap(`scroll_${direction}_${state}`)
        );
    }

    // AS3: LeaderboardViewController.as::onNextWeekButton()
    private onNextWeekButton(): void
    {
        if(!this._nextWeek?.visible) return;

        switch(this._state)
        {
            case LeaderboardViewController.STATE_WEEKLY:
                this.sendGetWeeklyData((this._weekly?.offset ?? 0) - 1);
                break;
            case LeaderboardViewController.STATE_FRIENDS_WEEKLY:
                this.sendGetFriendsWeeklyData((this._friendsWeekly?.offset ?? 0) - 1);
                break;
            case LeaderboardViewController.STATE_GROUP_WEEKLY:
                this.sendGetGroupWeeklyData((this._groupWeekly?.offset ?? 0) - 1);
                break;
        }
    }

    /**
     * The group branch is AS3's own bug, kept: it reads
     * `sendGetGroupWeeklyData(_SafeStr_4856 + 1)` — the *table object* plus one, not its `offset` —
     * which coerces to `NaN` and then to `0` at the `int` parameter. So "previous week" on the group
     * weekly board jumps to the current week instead of stepping back. Ported as it behaves, not as
     * it reads; the other two branches are correct in the source.
     */
    // AS3: LeaderboardViewController.as::onPreviousWeekButton()
    private onPreviousWeekButton(): void
    {
        if(!this._previousWeek?.visible) return;

        switch(this._state)
        {
            case LeaderboardViewController.STATE_WEEKLY:
                this.sendGetWeeklyData((this._weekly?.offset ?? 0) + 1);
                break;
            case LeaderboardViewController.STATE_FRIENDS_WEEKLY:
                this.sendGetFriendsWeeklyData((this._friendsWeekly?.offset ?? 0) + 1);
                break;
            case LeaderboardViewController.STATE_GROUP_WEEKLY:
                this.sendGetGroupWeeklyData(0);
                break;
        }
    }

    // AS3: LeaderboardViewController.as::updateWeekSelection()
    private updateWeekSelection(): void
    {
        if(!this._nextWeek || !this._previousWeek) return;

        switch(this._state)
        {
            case LeaderboardViewController.STATE_WEEKLY:
                this._nextWeek.visible = (this._weekly?.offset ?? 0) > 0;
                this._previousWeek.visible = (this._weekly?.offset ?? 0) < (this._weekly?.maxOffset ?? 0);
                break;
            case LeaderboardViewController.STATE_FRIENDS_WEEKLY:
                this._nextWeek.visible = (this._friendsWeekly?.offset ?? 0) > 0;
                this._previousWeek.visible = (this._friendsWeekly?.offset ?? 0) < (this._friendsWeekly?.maxOffset ?? 0);
                break;
            case LeaderboardViewController.STATE_GROUP_WEEKLY:
                this._nextWeek.visible = (this._groupWeekly?.offset ?? 0) > 0;
                this._previousWeek.visible = (this._groupWeekly?.offset ?? 0) < (this._groupWeekly?.maxOffset ?? 0);
                break;
            default:
                this._nextWeek.visible = false;
                this._previousWeek.visible = false;
        }

        if(this._thisWeekText)
        {
            this._thisWeekText.caption = this._nextWeek.visible
                ? (this._weekLabel ?? '')
                : '${snowwar.leaderboard.this_week}';
        }

        // AS3 falls through the three weekly cases into the default when `nextWeek` is visible —
        // paging back into an archived week hides the reset counter, which only describes the
        // current one.
        const isWeekly = this._state === LeaderboardViewController.STATE_WEEKLY
            || this._state === LeaderboardViewController.STATE_FRIENDS_WEEKLY
            || this._state === LeaderboardViewController.STATE_GROUP_WEEKLY;

        if(isWeekly && !this._nextWeek.visible)
        {
            this.showTimeUntilWeeklyReset();

            if(this._weeklyResetTimer === null) this.startWeeklyResetTimer(this._minutesUntilReset);

            return;
        }

        WindowUtils.hideElement(this._window, 'reset_text');
        this.disposeWeeklyResetTimer();
    }

    // AS3: LeaderboardViewController.as::showTimeUntilWeeklyReset()
    private showTimeUntilWeeklyReset(): void
    {
        WindowUtils.showElement(this._window, 'reset_text');

        this._localization?.registerParameter(
            'snowwar.leaderboard.weekly_reset', 'days', `${this.convertToDays(this._minutesUntilReset)}`
        );
        this._localization?.registerParameter(
            'snowwar.leaderboard.weekly_reset', 'hours', `${this.convertToHours(this._minutesUntilReset)}`
        );
        this._localization?.registerParameter(
            'snowwar.leaderboard.weekly_reset', 'minutes', `${this.convertToMinutes(this._minutesUntilReset)}`
        );

        WindowUtils.setCaption(
            this._window?.findChildByName('reset_text') ?? null,
            '${snowwar.leaderboard.weekly_reset}'
        );
    }

    // AS3: LeaderboardViewController.as::startWeeklyResetTimer()
    private startWeeklyResetTimer(repeatCount: number): void
    {
        this._weeklyResetTicksLeft = repeatCount;
        this._weeklyResetTimer = setInterval(() => this.onTick(), 60000);
    }

    // AS3: LeaderboardViewController.as::disposeWeeklyResetTimer()
    private disposeWeeklyResetTimer(): void
    {
        if(this._weeklyResetTimer !== null)
        {
            clearInterval(this._weeklyResetTimer);
            this._weeklyResetTimer = null;
        }
    }

    /**
     * One minute gone. AS3's `Timer` is constructed with `minutesUntilReset` as its repeat count and
     * stops itself there; `setInterval` has no such thing, so the count is kept and the timer is
     * cleared when it runs out.
     *
     * The state test is AS3's and is narrower than the branch that started the timer: the group
     * weekly board (state 4) keeps a running timer that never decrements its counter.
     */
    // AS3: LeaderboardViewController.as::onTick()
    private onTick(): void
    {
        if(this._weeklyResetTicksLeft-- <= 0)
        {
            this.disposeWeeklyResetTimer();

            return;
        }

        const isCountedState = this._state === LeaderboardViewController.STATE_WEEKLY
            || this._state === LeaderboardViewController.STATE_FRIENDS_WEEKLY;

        if(!this._nextWeek?.visible && isCountedState)
        {
            if(this._minutesUntilReset > 0) this._minutesUntilReset -= 1;

            this.showTimeUntilWeeklyReset();
        }
    }

    // AS3: LeaderboardViewController.as::convertToDays()
    private convertToDays(minutes: number): number
    {
        return Math.floor(minutes / 60 / 24);
    }

    // AS3: LeaderboardViewController.as::convertToHours()
    private convertToHours(minutes: number): number
    {
        return Math.floor((minutes - this.convertToDays(minutes) * 24 * 60) / 60);
    }

    // AS3: LeaderboardViewController.as::convertToMinutes()
    private convertToMinutes(minutes: number): number
    {
        return minutes - this.convertToDays(minutes) * 24 * 60 - this.convertToHours(minutes) * 60;
    }

    // AS3: LeaderboardViewController.as::getData()
    private getData(): Game2LeaderboardEntryData[] | null
    {
        switch(this._state)
        {
            case LeaderboardViewController.STATE_FRIENDS_ALLTIME: return this._friendsAllTime?.getVisibleEntries() ?? null;
            case LeaderboardViewController.STATE_ALLTIME: return this._allTime?.getVisibleEntries() ?? null;
            case LeaderboardViewController.STATE_WEEKLY: return this._weekly?.getVisibleEntries() ?? null;
            case LeaderboardViewController.STATE_FRIENDS_WEEKLY: return this._friendsWeekly?.getVisibleEntries() ?? null;
            case LeaderboardViewController.STATE_GROUP_WEEKLY: return this._groupWeekly?.getVisibleEntries() ?? null;
            case LeaderboardViewController.STATE_GROUP_ALLTIME: return this._groupAllTime?.getVisibleEntries() ?? null;
        }

        return null;
    }

    // AS3: LeaderboardViewController.as::getFavouriteGroupId()
    private getFavouriteGroupId(): number
    {
        switch(this._state)
        {
            case LeaderboardViewController.STATE_GROUP_WEEKLY: return this._groupWeekly?.favouriteGroupId ?? -1;
            case LeaderboardViewController.STATE_GROUP_ALLTIME: return this._groupAllTime?.favouriteGroupId ?? -1;
        }

        return -1;
    }

    /**
     * Rebuilds the visible rows from one cloned prototype each.
     *
     * The highlight/divider block is the fiddly part: a row is highlighted only when it is the
     * viewer's own (or their group's) *and* the board is one of the two that pin it, and the
     * divider above a highlighted row is removed so the two read as one block.
     *
     * The padding loop below it exists because the pinned own-row must stay at the bottom of the
     * list even when the page is short: blank rows are inserted and the last real row is re-added
     * after them.
     */
    // AS3: LeaderboardViewController.as::populateList()
    private populateList(): void
    {
        if(!this._list || !this._listBorder) return;

        const data = this.getData();
        const favouriteGroupId = this.getFavouriteGroupId();
        const ownUserId = this._engine?.sessionDataManager?.userId ?? 0;

        if(!data || data.length === 0)
        {
            this._list.visible = false;
            this._listBorder.visible = false;

            return;
        }

        this._list.destroyListItems();

        const prototype = WindowUtils.createWindow('snowwar_leaderboard_entry') as IWindowContainer | null;

        if(!prototype) return;

        let index = 0;

        while(index < data.length)
        {
            const entry = data[index];

            if(entry)
            {
                const row = prototype.clone() as IWindowContainer;
                const rank = row.findChildByName('rank');
                const score = row.findChildByName('score');
                const name = row.findChildByName('name');

                if(rank) rank.caption = `${entry.rank}`;
                if(score) score.caption = `${entry.score}`;
                if(name) name.caption = entry.name;

                const isGroup = entry.gender === 'g';
                const avatarImage = row.findChildByName('avatarImage') as IBitmapWrapperWindow | null;

                if(isGroup) this.setGroupBadgeImage(avatarImage, entry.figure);
                else this.setAvatarImage(avatarImage, entry.figure, entry.gender);

                const boardPinsOwnRow = this._state === LeaderboardViewController.STATE_ALLTIME
                    || this._state === LeaderboardViewController.STATE_GROUP_ALLTIME;
                const isPinnedOwnRow = boardPinsOwnRow
                    && (entry.userId === ownUserId || (isGroup && entry.userId === favouriteGroupId));

                if((!isGroup && entry.userId !== ownUserId)
                    || (isGroup && entry.userId !== favouriteGroupId)
                    || (isPinnedOwnRow && index < data.length - 1))
                {
                    const highlight = row.findChildByName('highlight');
                    const divider = row.findChildByName('divider');

                    if(highlight) highlight.visible = false;
                    if(divider) divider.visible = false;

                    const previous = this._list.getListItemAt(this._list.numListItems - 1) as IWindowContainer | null;
                    const previousDivider = previous?.findChildByName('divider') ?? null;

                    if(previousDivider) previousDivider.visible = false;
                }

                const imageRegion = row.findChildByName('imageRegion');

                if(imageRegion)
                {
                    imageRegion.id = entry.userId;

                    if(isGroup)
                    {
                        imageRegion.addEventListener(
                            WindowMouseEvent.CLICK,
                            (event) => this.onGroupImageRegion(event as WindowMouseEvent)
                        );
                    }
                    else
                    {
                        imageRegion.addEventListener(
                            WindowMouseEvent.CLICK,
                            (event) => this.onImageRegion(event as WindowMouseEvent)
                        );
                    }
                }

                this._list.addListItem(row);
            }

            index++;
        }

        const padsShortPages = this._state === LeaderboardViewController.STATE_ALLTIME
            || this._state === LeaderboardViewController.STATE_GROUP_ALLTIME
            || this._state === LeaderboardViewController.STATE_WEEKLY
            || this._state === LeaderboardViewController.STATE_GROUP_WEEKLY;
        const viewSize = this._friendsAllTime?.viewSize ?? 8;

        if(padsShortPages && index % viewSize !== 0)
        {
            const lastRealRow = this._list.getListItemAt(this._list.numListItems - 1);

            for(let i = 0; i < index % viewSize - 1; i++)
            {
                const blank = prototype.clone() as IWindowContainer;
                const rank = blank.findChildByName('rank');
                const score = blank.findChildByName('score');
                const name = blank.findChildByName('name');
                const highlight = blank.findChildByName('highlight');
                const divider = blank.findChildByName('divider');

                if(rank) rank.caption = '';
                if(score) score.caption = '';
                if(name) name.caption = '';
                if(highlight) highlight.visible = false;
                if(divider) divider.visible = false;

                const previous = this._list.getListItemAt(this._list.numListItems - 1) as IWindowContainer | null;
                const previousDivider = previous?.findChildByName('divider') ?? null;

                if(previousDivider) previousDivider.visible = false;

                const imageRegion = blank.findChildByName('imageRegion');

                if(imageRegion) blank.removeChild(imageRegion);

                this._list.addListItem(blank);
            }

            if(lastRealRow) this._list.addListItem(lastRealRow);
        }

        prototype.dispose();

        const last = this._list.getListItemAt(this._list.numListItems - 1) as IWindowContainer | null;
        const lastDivider = last?.findChildByName('divider') ?? null;

        if(lastDivider) lastDivider.visible = false;

        this._list.visible = true;
        this._listBorder.visible = true;

        this.updateScrollButtons();
        this._window?.invalidate();
    }

    // AS3: LeaderboardViewController.as::setGroupBadgeImage()
    private setGroupBadgeImage(slot: IBitmapWrapperWindow | null, badgeCode: string): void
    {
        if(!slot) return;

        const badge = imageElementToBitmap(this._engine?.sessionDataManager?.getGroupBadgeImage(badgeCode) ?? null);

        if(badge)
        {
            this._avatarPlaceholders.remove(badgeCode);
            this._avatarPlaceholders.add(badgeCode, slot);

            WindowUtils.setElementImage(slot, badge);
            badge.close();
        }
    }

    /**
     * Renders one head into a row's avatar slot.
     *
     * AS3 disposes the cropped bitmap unconditionally after handing it to `setElementImage()`,
     * including when `createAvatarImage()` returned null — a null dereference this port cannot
     * reproduce without throwing, so the release is guarded.
     */
    // AS3: LeaderboardViewController.as::setAvatarImage()
    private setAvatarImage(slot: IBitmapWrapperWindow | null, figure: string, gender: string | null = null): void
    {
        if(!slot) return;

        let head: ImageBitmap | null = null;
        const avatarImage = this._engine?.avatarManager?.createAvatarImage(figure, 'h', gender, this, null) ?? null;

        if(avatarImage)
        {
            avatarImage.setDirection('full', 2);
            head = AvatarTextureUtils.toImageBitmap(avatarImage.getCroppedImage('head'));

            if(avatarImage.isPlaceholder())
            {
                this._avatarPlaceholders.remove(figure);
                this._avatarPlaceholders.add(figure, slot);
            }

            avatarImage.dispose();
        }

        WindowUtils.setElementImage(slot, head);
        head?.close();
    }

    // AS3: LeaderboardViewController.as::onImageRegion()
    private onImageRegion(event: WindowMouseEvent): void
    {
        this._engine?.groupsManager?.showExtendedProfile(event.window?.id ?? 0);
    }

    // AS3: LeaderboardViewController.as::onGroupImageRegion()
    private onGroupImageRegion(event: WindowMouseEvent): void
    {
        this._engine?.groupsManager?.showGroupBadgeInfo(false, event.window?.id ?? 0);
    }

    // AS3: LeaderboardViewController.as::updateScrollButtons()
    private updateScrollButtons(): void
    {
        const table = this.getCurrentLeaderboard();

        if(table && this._scrollingEnabled)
        {
            if(this._scrollUp) this._scrollUp.visible = table.canScrollUp();
            if(this._scrollDown) this._scrollDown.visible = table.canScrollDown();
        }
    }

    // AS3: LeaderboardViewController.as::getBitmap()
    private getBitmap(name: string): ImageBitmap | null
    {
        return (this._engine?.assets?.getAssetByName(name)?.content ?? null) as ImageBitmap | null;
    }

    // TS-only: AS3 casts the scroll region to a container and calls `getChildAt(0)` inline.
    private firstChildOf(window: IWindow | null): IWindow | null
    {
        const container = window as IWindowContainer | null;

        if(!container || typeof container.getChildAt !== 'function') return null;

        return container.getChildAt(0);
    }

    // AS3: LeaderboardViewController.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._engine = null;
        this._localization = null;
        this._list = null;
        this._listBorder = null;
        this._changeView = null;
        this._changeGroupView = null;
        this._changeFriendsView = null;
        this._thisWeekImage = null;
        this._allTimeImage = null;
        this._allTimeText = null;
        this._thisWeekText = null;
        this._scrollUp = null;
        this._scrollDown = null;
        this._nextWeek = null;
        this._previousWeek = null;
        this._weekLabel = null;

        this._avatarPlaceholders.dispose();

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._friendsAllTime?.dispose();
        this._friendsAllTime = null;
        this._allTime?.dispose();
        this._allTime = null;
        this._groupAllTime?.dispose();
        this._groupAllTime = null;
        this._weekly?.dispose();
        this._weekly = null;
        this._groupWeekly?.dispose();
        this._groupWeekly = null;
        this._friendsWeekly?.dispose();
        this._friendsWeekly = null;

        this.disposeWeeklyResetTimer();
        this._disposed = true;
    }
}
