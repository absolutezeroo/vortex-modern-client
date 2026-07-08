import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import type {ILayoutNameProvider} from '../../interfaces/elements/ILayoutNameProvider';
import type {IFloatableElementHandler} from '../../interfaces/elements/IFloatableElementHandler';
import type {CountdownWidget} from '@habbo/window/widgets/CountdownWidget';

/**
 * Base class for `GenericWidget` timer content elements (`customtimer`,
 * `communitygoaltimer`): wraps a `countdown_widget` child and an optional
 * expiry/remaining caption. Subclasses drive `setTimer()` from their own
 * wire-protocol response.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4142.as
 * (obfuscated as `_SafeCls_4533` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4533.as
 */
export class TimerElementHandlerBase implements IElementHandler, IDisposable, IFloatableElementHandler, ILayoutNameProvider
{
    private _landingView: HabboLandingView | null = null;
    private _window: IWindowContainer | null = null;
    private _isFloating: boolean = false;
    private _timeRemainingKey: string = '';
    private _expiredKey: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4533.as::get layoutName()
    get layoutName(): string
    {
        return 'element_timer';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4533.as::isFloating()
    isFloating(_value: boolean): boolean
    {
        return this._isFloating;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4533.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._window = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4533.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4533.as::refresh()
    refresh(): void
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4533.as::initialize()
    initialize(landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        this._landingView = landingView;
        this._window = window as IWindowContainer;
        this._isFloating = params[1] === 'true';
        this._timeRemainingKey = params[4];
        this._expiredKey = params[5];

        this.setCaption(null);

        if(this._isFloating)
        {
            this._window.x = parseInt(params[2], 10);
            this._window.y = parseInt(params[3], 10);
        }
    }

    protected setTimer(secondsRemaining: number): void
    {
        const countdownWindow = this._window?.findChildByName('countdown_widget') as IWidgetWindow | null;

        if(!countdownWindow) return;

        countdownWindow.visible = secondsRemaining > 0;

        const countdownWidget = countdownWindow.widget as CountdownWidget;

        countdownWidget.seconds = secondsRemaining;

        this.setCaption(secondsRemaining > 0 ? this._timeRemainingKey : this._expiredKey);
    }

    private setCaption(key: string | null): void
    {
        const captionWindow = this._window?.findChildByName('timer_caption_txt') ?? null;

        if(!captionWindow) return;

        const hasKey = key !== null && key !== '';

        captionWindow.visible = hasKey;

        if(hasKey)
        {
            captionWindow.caption = '${' + key + '}';
        }
    }

    protected get landingView(): HabboLandingView | null
    {
        return this._landingView;
    }
}
