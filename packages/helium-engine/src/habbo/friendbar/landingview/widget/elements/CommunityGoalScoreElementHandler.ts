import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import type {ILayoutNameProvider} from '../../interfaces/elements/ILayoutNameProvider';
import type {IFloatableElementHandler} from '../../interfaces/elements/IFloatableElementHandler';
import type {IDisableableElementHandler} from '../../interfaces/elements/IDisableableElementHandler';
import type {IRunningNumberWidget} from '@habbo/window/widgets/IRunningNumberWidget';
import type {CommunityGoalProgressMessageParser} from '@habbo/communication/messages/parser/quest/CommunityGoalProgressMessageParser';
import {CommunityGoalProgressMessageEvent} from '@habbo/communication/messages/incoming/quest/CommunityGoalProgressMessageEvent';
import {GetCommunityGoalProgressMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetCommunityGoalProgressMessageComposer';

/**
 * Running-number display of the community's total score, polled while the
 * widget is active.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4139.as
 * (obfuscated as `_SafeCls_4532` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4532.as
 */
export class CommunityGoalScoreElementHandler implements IElementHandler, IDisposable, IFloatableElementHandler, ILayoutNameProvider, IDisableableElementHandler
{
    private _landingView: HabboLandingView | null = null;
    private _window: IWindowContainer | null = null;
    private _isFloating: boolean = false;
    private _pollIntervalId: ReturnType<typeof setInterval> | null = null;
    private _pollIntervalMs: number = 0;
    private _hasReceivedFirstUpdate: boolean = false;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4532.as::dispose()
    dispose(): void
    {
        if(this._landingView)
        {
            this._landingView = null;
        }

        if(this._pollIntervalId !== null)
        {
            clearInterval(this._pollIntervalId);
            this._pollIntervalId = null;
        }

        this._window = null;
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4532.as::initialize()
    initialize(landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        this._landingView = landingView;
        this._window = window as IWindowContainer;

        const digits = parseInt(params[1], 10);
        const updateFrequency = parseInt(params[2], 10);
        const pollIntervalMs = parseInt(params[3], 10);

        this._isFloating = params[4] === 'true';

        const runningNumberWindow = this._window.findChildByName('running_number_widget') as IWidgetWindow | null;
        const runningNumberWidget = (runningNumberWindow?.widget ?? null) as IRunningNumberWidget | null;

        if(runningNumberWidget)
        {
            runningNumberWidget.digits = digits;
            runningNumberWidget.updateFrequency = updateFrequency;
        }

        if(this._isFloating)
        {
            this._window.x = parseInt(params[5], 10);
            this._window.y = parseInt(params[6], 10);
        }

        landingView.communicationManager?.addHabboConnectionMessageEvent(new CommunityGoalProgressMessageEvent(this.onCommunityGoalProgress));

        this._pollIntervalMs = pollIntervalMs;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4532.as::disable()
    disable(): void
    {
        if(this._pollIntervalId !== null)
        {
            clearInterval(this._pollIntervalId);
            this._pollIntervalId = null;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4532.as::refresh()
    refresh(): void
    {
        this._landingView?.send(new GetCommunityGoalProgressMessageComposer());
        this._hasReceivedFirstUpdate = false;

        if(this._pollIntervalId !== null)
        {
            clearInterval(this._pollIntervalId);
        }

        this._pollIntervalId = setInterval(this.onPollTimer, this._pollIntervalMs);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4532.as::isFloating()
    isFloating(_value: boolean): boolean
    {
        return this._isFloating;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4532.as::get layoutName()
    get layoutName(): string
    {
        return 'element_community_goal_score';
    }

    private onCommunityGoalProgress = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CommunityGoalProgressMessageParser | null;
        const data = parser?.data;

        if(!data || !this._landingView || !this._window) return;

        const runningNumberWindow = this._window.findChildByName('running_number_widget') as IWidgetWindow | null;
        const runningNumberWidget = (runningNumberWindow?.widget ?? null) as IRunningNumberWidget | null;

        if(!runningNumberWidget) return;

        if(this._hasReceivedFirstUpdate)
        {
            runningNumberWidget.number = data.communityTotalScore;
        }
        else
        {
            runningNumberWidget.initialNumber = data.communityTotalScore;
            this._hasReceivedFirstUpdate = true;
        }
    };

    private onPollTimer = (): void =>
    {
        this._landingView?.send(new GetCommunityGoalProgressMessageComposer());
    };
}
