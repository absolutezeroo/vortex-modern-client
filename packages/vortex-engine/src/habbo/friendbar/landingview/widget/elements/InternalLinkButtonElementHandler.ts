import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import {ButtonElementHandler} from './ButtonElementHandler';

/**
 * Button that fires an internal client-link event (deep link handled by the
 * shell), tracked against the owning widget's configuration code.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4144.as
 * (obfuscated as `_SafeCls_4535` in the primary source). NOTE: win63_version's
 * class_4144 is actually the requestbadgebutton handler content-wise (see
 * RequestBadgeButtonElementHandler.ts) - this file is named/shaped to match
 * _SafeCls_4535 (internallinkbutton) read directly from the primary source,
 * since the win63_version positional listing does not correspond 1:1.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4535.as
 */
export class InternalLinkButtonElementHandler extends ButtonElementHandler
{
    private _linkTarget: string = '';
    private _configurationCode: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4535.as::initialize()
    override initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        super.initialize(landingView, window, params, ownerWidget);
        this._linkTarget = params[2];
        this._configurationCode = ownerWidget.configurationCode ?? '';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4535.as::onClick()
    protected override onClick(): void
    {
        this.landingView?.context.createLinkEvent(this._linkTarget);
        this.landingView?.tracking?.trackEventLog('LandingView', this._configurationCode, 'client_link', this._linkTarget);
    }
}
