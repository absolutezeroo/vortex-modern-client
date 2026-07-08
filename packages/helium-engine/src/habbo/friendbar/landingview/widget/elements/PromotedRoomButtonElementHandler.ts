import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import {ButtonElementHandler} from './ButtonElementHandler';

/**
 * Button that forwards the user into a random room from a promoted category.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4153.as
 * (obfuscated as `_SafeCls_4544` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4544.as
 */
export class PromotedRoomButtonElementHandler extends ButtonElementHandler
{
    private _categoryCode: string | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4544.as::initialize()
    override initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        super.initialize(landingView, window, params, ownerWidget);

        if(params.length > 1)
        {
            this._categoryCode = params[2];
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4544.as::onClick()
    protected override onClick(): void
    {
        this.landingView?.goToRoom(this._categoryCode ?? null);
        this.landingView?.tracking?.trackGoogle('landingView', 'click_promotedroom' + (this._categoryCode ?? ''));
    }
}
