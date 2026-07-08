import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import {TimerElementHandlerBase} from './TimerElementHandlerBase';
import {GetCommunityGoalProgressMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetCommunityGoalProgressMessageComposer';
import {CommunityGoalProgressMessageEvent} from '@habbo/communication/messages/incoming/quest/CommunityGoalProgressMessageEvent';
import type {CommunityGoalProgressMessageParser} from '@habbo/communication/messages/parser/quest/CommunityGoalProgressMessageParser';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

/**
 * Countdown to the current community goal's expiry.
 *
 * Behavior read directly from the primary source (obfuscated as
 * `_SafeCls_4541`); the win63_version directory listing does not correspond
 * 1:1 by position so no secondary cross-reference file is cited here.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4541.as
 */
export class CommunityGoalTimerElementHandler extends TimerElementHandlerBase
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4541.as::initialize()
    override initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        super.initialize(landingView, window, params, ownerWidget);
        landingView.communicationManager?.addHabboConnectionMessageEvent(new CommunityGoalProgressMessageEvent(this.onCommunityGoalProgress));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4541.as::refresh()
    override refresh(): void
    {
        this.landingView?.send(new GetCommunityGoalProgressMessageComposer());
    }

    private onCommunityGoalProgress = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CommunityGoalProgressMessageParser | null;
        const data = parser?.data;

        if(!data) return;

        this.setTimer(data.hasGoalExpired ? 0 : data.timeRemainingInSeconds);
    };
}
