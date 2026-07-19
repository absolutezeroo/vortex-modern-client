import {ButtonElementHandler} from './ButtonElementHandler';

/**
 * "Buy credits" button — opens the credits habblet in the catalog.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4134.as
 * (obfuscated as `_SafeCls_4525` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4525.as
 */
export class CreditHabbletButtonElementHandler extends ButtonElementHandler
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4525.as::onClick()
    protected override onClick(): void
    {
        this.landingView?.catalog?.openCreditsHabblet();
        this.landingView?.tracking?.trackGoogle('landingView', 'click_credithabblet');
    }
}
