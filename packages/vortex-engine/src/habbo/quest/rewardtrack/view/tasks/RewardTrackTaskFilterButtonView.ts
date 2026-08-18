/**
 * RewardTrackTaskFilterButtonView — one of the three "All / In progress / Completed" pills above
 * the task list.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/tasks/RewardTrackTaskFilterButtonView.as
 *
 * Two windows stacked in the layout do the work: `selected_view` for the active pill and
 * `notselected_shape` for the rest, swapped by visibility rather than restyled. The hover tint only
 * applies to the inactive state, and the active pill turns its own cursor off so it does not invite
 * a click that would do nothing.
 *
 * The theme is applied to the whole subtree at construction, before the default colours are
 * captured — so `_defaultNotSelectedColor` is the *themed* resting colour, not the layout's.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ShapeController} from '@core/window/components/ShapeController';
import type {RewardTrackTheme} from '../theme/RewardTrackTheme';
import type {RewardTrackTaskListView} from './RewardTrackTaskListView';

export class RewardTrackTaskFilterButtonView
{
    /** Derived name — `_SafeStr_10485`; AS3's `uint` 4294967295. */
    // AS3: RewardTrackTaskFilterButtonView.as::_SafeStr_10485
    private static readonly SELECTED_TEXT_COLOR: number = 0xFFFFFFFF;

    /** AS3's `uint` 4282664004. */
    // AS3: RewardTrackTaskFilterButtonView.as::NOT_SELECTED_TEXT_COLOR
    private static readonly NOT_SELECTED_TEXT_COLOR: number = 0xFF444444;

    /** AS3's literal `1` — the param flag cleared on the selected view. */
    // AS3: RewardTrackTaskFilterButtonView.as::RewardTrackTaskFilterButtonView()
    private static readonly SELECTED_VIEW_PARAM_FLAG: number = 1;

    // AS3: RewardTrackTaskFilterButtonView.as::_window
    private _window: IRegionWindow | null;

    /** Derived name — `_SafeStr_4691`: which filter this pill selects. */
    // AS3: RewardTrackTaskFilterButtonView.as::_SafeStr_4691
    private _filter: number;

    /** Derived name — `_SafeStr_7636`: the list this pill filters. */
    // AS3: RewardTrackTaskFilterButtonView.as::_SafeStr_7636
    private _listView: RewardTrackTaskListView | null;

    // AS3: RewardTrackTaskFilterButtonView.as::_theme
    private _theme: RewardTrackTheme | null;

    // AS3: RewardTrackTaskFilterButtonView.as::_defaultNotSelectedColor
    private _defaultNotSelectedColor: number;

    // AS3: RewardTrackTaskFilterButtonView.as::_defaultNotSelectedBorderColor
    private _defaultNotSelectedBorderColor: number;

    // AS3: RewardTrackTaskFilterButtonView.as::_active
    private _active: boolean = false;

    /** Derived name — `_SafeStr_5943`: whether the pointer is over this pill. */
    // AS3: RewardTrackTaskFilterButtonView.as::_SafeStr_5943
    private _hovered: boolean = false;

    // AS3: RewardTrackTaskFilterButtonView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackTaskFilterButtonView.as::RewardTrackTaskFilterButtonView()
    constructor(
        window: IRegionWindow,
        filter: number,
        localizationKey: string,
        listView: RewardTrackTaskListView,
        theme: RewardTrackTheme
    )
    {
        this._window = window;
        this._filter = filter;
        this._listView = listView;
        this._theme = theme;

        theme.applyTo(window as unknown as IWindow);

        const shape = this.notSelectedShape;

        this._defaultNotSelectedColor = (shape as unknown as IWindow | null)?.color ?? 0;
        this._defaultNotSelectedBorderColor = shape?.strokeColor ?? 0;

        const selected = this.selectedView;

        if(selected !== null)
        {
            (selected as unknown as IWindow).setParamFlag(
                RewardTrackTaskFilterButtonView.SELECTED_VIEW_PARAM_FLAG, false
            );
            selected.interactiveCursorDisabled = true;
        }

        const text = this.buttonText;

        if(text !== null) text.text = `\${${localizationKey}}`;

        const asWindow = window as unknown as IWindow;

        asWindow.addEventListener('WME_CLICK', this.onClick);
        asWindow.addEventListener('WME_OVER', this.onMouseOver);
        asWindow.addEventListener('WME_OUT', this.onMouseOut);
    }

    // AS3: RewardTrackTaskFilterButtonView.as::setActive()
    public setActive(active: boolean): void
    {
        this._active = active;

        this.refreshState();
    }

    // AS3: RewardTrackTaskFilterButtonView.as::onClick()
    private onClick = (): void =>
    {
        this._listView?.setFilter(this._filter);
    };

    // AS3: RewardTrackTaskFilterButtonView.as::onMouseOver()
    private onMouseOver = (): void =>
    {
        this._hovered = true;

        this.refreshState();
    };

    // AS3: RewardTrackTaskFilterButtonView.as::onMouseOut()
    private onMouseOut = (): void =>
    {
        this._hovered = false;

        this.refreshState();
    };

    // AS3: RewardTrackTaskFilterButtonView.as::refreshState()
    private refreshState(): void
    {
        const selected = this.selectedView as unknown as IWindow | null;
        const shape = this.notSelectedShape;
        const shapeWindow = shape as unknown as IWindow | null;
        const highlight = !this._active && this._hovered;

        if(selected !== null) selected.visible = this._active;

        if(shapeWindow !== null)
        {
            shapeWindow.visible = !this._active;
            shapeWindow.color = highlight
                ? (this._theme?.lightColor ?? this._defaultNotSelectedColor)
                : this._defaultNotSelectedColor;
        }

        if(shape !== null)
        {
            shape.strokeColor = highlight
                ? (this._theme?.darkColor ?? this._defaultNotSelectedBorderColor)
                : this._defaultNotSelectedBorderColor;
        }

        const text = this.buttonText;

        if(text !== null)
        {
            text.textColor = this._active
                ? RewardTrackTaskFilterButtonView.SELECTED_TEXT_COLOR
                : RewardTrackTaskFilterButtonView.NOT_SELECTED_TEXT_COLOR;
        }

        if(this._window !== null) this._window.interactiveCursorDisabled = this._active;
    }

    // AS3: RewardTrackTaskFilterButtonView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackTaskFilterButtonView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window as unknown as IWindowContainer | null;
    }

    // AS3: RewardTrackTaskFilterButtonView.as::get selectedView()
    private get selectedView(): IInteractiveWindow | null
    {
        return ((this._window as unknown as IWindowContainer | null)?.findChildByName('selected_view')
            ?? null) as unknown as IInteractiveWindow | null;
    }

    // AS3: RewardTrackTaskFilterButtonView.as::get notSelectedShape()
    private get notSelectedShape(): ShapeController | null
    {
        return ((this._window as unknown as IWindowContainer | null)?.findChildByName('notselected_shape')
            ?? null) as unknown as ShapeController | null;
    }

    // AS3: RewardTrackTaskFilterButtonView.as::get buttonText()
    private get buttonText(): ITextWindow | null
    {
        return ((this._window as unknown as IWindowContainer | null)?.findChildByName('button_text')
            ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackTaskFilterButtonView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        const asWindow = this._window as unknown as IWindow | null;

        asWindow?.removeEventListener('WME_CLICK', this.onClick);
        asWindow?.removeEventListener('WME_OVER', this.onMouseOver);
        asWindow?.removeEventListener('WME_OUT', this.onMouseOut);
        asWindow?.dispose();

        this._window = null;
        this._listView = null;
        this._theme = null;
    }
}
