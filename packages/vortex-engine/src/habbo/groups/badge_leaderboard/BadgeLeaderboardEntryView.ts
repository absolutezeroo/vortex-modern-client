/**
 * BadgeLeaderboardEntryView — one row of the board, or the pinned "your rank" row.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge_leaderboard/BadgeLeaderboardEntryView.as
 *
 * Pure accessors over a window someone else owns. The two constructor flags are what let the same
 * class serve both roles: the pinned row is handed the layout's own `own_container` rather than a
 * clone, so `ownsWindow` is false and `dispose()` must not dispose it, and its rank text is called
 * `rank_own` instead of `rank_number`.
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';

export class BadgeLeaderboardEntryView
{
    // AS3: BadgeLeaderboardEntryView.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_9630`: whether `dispose()` owns the window it was handed. */
    // AS3: BadgeLeaderboardEntryView.as::_SafeStr_9630
    private _ownsWindow: boolean;

    // AS3: BadgeLeaderboardEntryView.as::_rankTextName
    private _rankTextName: string | null;

    // AS3: BadgeLeaderboardEntryView.as::_window
    private _window: IWindowContainer | null;

    // AS3: BadgeLeaderboardEntryView.as::BadgeLeaderboardEntryView()
    constructor(window: IWindowContainer, ownsWindow: boolean = true, rankTextName: string = 'rank_number')
    {
        this._ownsWindow = ownsWindow;
        this._rankTextName = rankTextName;
        this._window = window;
    }

    // AS3: BadgeLeaderboardEntryView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: BadgeLeaderboardEntryView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: BadgeLeaderboardEntryView.as::get evenBackground()
    public get evenBackground(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('entry_bg_even') ?? null) as IStaticBitmapWrapperWindow | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::get unevenBackground()
    public get unevenBackground(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('entry_bg_uneven') ?? null) as IStaticBitmapWrapperWindow | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::get rankText()
    public get rankText(): ITextWindow | null
    {
        return (this._window?.findChildByName(this._rankTextName ?? '') ?? null) as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::get rankBorder()
    public get rankBorder(): IWindowContainer | null
    {
        return (this._window?.findChildByName('rank_border') ?? null) as IWindowContainer | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::get profileRegion()
    public get profileRegion(): IRegionWindow | null
    {
        return (this._window?.findChildByName('region_profile') ?? null) as IRegionWindow | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::get profileCanvas()
    public get profileCanvas(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('canvas') ?? null) as IBitmapWrapperWindow | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::get usernameText()
    public get usernameText(): ITextWindow | null
    {
        return (this._window?.findChildByName('username_txt') ?? null) as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::get scoreText()
    public get scoreText(): ITextWindow | null
    {
        return (this._window?.findChildByName('score_txt') ?? null) as ITextWindow | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::get rankTypeImage()
    public get rankTypeImage(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('rank_type_img') ?? null) as IStaticBitmapWrapperWindow | null;
    }

    // AS3: BadgeLeaderboardEntryView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._ownsWindow)
        {
            this._window?.dispose();
        }

        this._window = null;
        this._rankTextName = null;
        this._disposed = true;
    }
}
