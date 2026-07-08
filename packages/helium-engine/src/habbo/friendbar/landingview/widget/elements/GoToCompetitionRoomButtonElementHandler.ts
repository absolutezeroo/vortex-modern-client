import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import {ButtonElementHandler} from './ButtonElementHandler';
import {ForwardToRandomCompetitionRoomMessageComposer} from '@habbo/communication/messages/outgoing/competition/ForwardToRandomCompetitionRoomMessageComposer';

/**
 * Button that forwards the user into a random room submitted to a
 * competition goal.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4146.as
 * (obfuscated as `_SafeCls_4538` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4538.as
 */
export class GoToCompetitionRoomButtonElementHandler extends ButtonElementHandler
{
    private _goalCode: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4538.as::initialize()
    override initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        super.initialize(landingView, window, params, ownerWidget);
        this._goalCode = params[2];
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4538.as::onClick()
    protected override onClick(): void
    {
        this.landingView?.questEngine?.reenableRoomCompetitionWindow();
        this.landingView?.send(new ForwardToRandomCompetitionRoomMessageComposer(this._goalCode));
        this.landingView?.tracking?.trackGoogle('landingView', 'click_gotocompetitionroom');
    }
}
