import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import {ButtonElementHandler} from './ButtonElementHandler';

/**
 * "Go to room" button — forwards the user into a fixed private room.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4135.as
 * (obfuscated as `_SafeCls_4526` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4526.as
 */
export class GoToRoomButtonElementHandler extends ButtonElementHandler
{
    private _roomId: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4526.as::initialize()
    override initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        super.initialize(landingView, window, params, ownerWidget);
        this._roomId = parseInt(params[2], 10);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4526.as::onClick()
    protected override onClick(): void
    {
        this.landingView?.navigator?.goToPrivateRoom(this._roomId);
        this.landingView?.tracking?.trackGoogle('landingView', 'click_gotoroom');
    }
}
