import {ButtonElementHandler} from './ButtonElementHandler';

/**
 * "Buy HC" button — opens the club center in the catalog.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4145.as
 * (obfuscated as `_SafeCls_4536` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4536.as
 */
export class BuyVipButtonElementHandler extends ButtonElementHandler
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4536.as::onClick()
    protected override onClick(): void
    {
        this.landingView?.catalog?.openClubCenter();
        this.landingView?.tracking?.trackGoogle('landingView', 'click_buyVip');
    }
}
