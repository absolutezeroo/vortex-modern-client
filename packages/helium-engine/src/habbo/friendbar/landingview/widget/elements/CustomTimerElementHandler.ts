import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import {TimerElementHandlerBase} from './TimerElementHandlerBase';
import {GetSecondsUntilMessageComposer} from '@habbo/communication/messages/outgoing/competition/GetSecondsUntilMessageComposer';
import {SecondsUntilMessageEvent} from '@habbo/communication/messages/incoming/competition/SecondsUntilMessageEvent';
import type {SecondsUntilMessageEventParser} from '@habbo/communication/messages/parser/competition/SecondsUntilMessageEventParser';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

/**
 * Countdown to a named custom server-side timer, matched by `timeStr`.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4143.as
 * (obfuscated as `_SafeCls_4534` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4534.as
 */
export class CustomTimerElementHandler extends TimerElementHandlerBase
{
    private _timeStr: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4534.as::initialize()
    override initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        super.initialize(landingView, window, params, ownerWidget);

        this._timeStr = params[6];
        landingView.communicationManager?.addHabboConnectionMessageEvent(new SecondsUntilMessageEvent(this.onTime));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4534.as::refresh()
    override refresh(): void
    {
        this.landingView?.send(new GetSecondsUntilMessageComposer(this._timeStr));
    }

    private onTime = (event: IMessageEvent): void =>
    {
        const parser = event.parser as SecondsUntilMessageEventParser | null;

        if(parser && parser.timeStr === this._timeStr)
        {
            this.setTimer(parser.secondsUntil);
        }
    };
}
