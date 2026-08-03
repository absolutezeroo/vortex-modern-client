import {ButtonElementHandler} from './ButtonElementHandler';

/**
 * "Go to my room" button.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4137.as
 * (obfuscated as `_SafeCls_4529` in the primary source).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4529.as
 */
export class GoToHomeRoomButtonElementHandler extends ButtonElementHandler
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4529.as::onClick()
    protected override onClick(): void
    {
        this.landingView?.questEngine?.reenableRoomCompetitionWindow();
        this.landingView?.navigator?.goToHomeRoom();
        this.landingView?.tracking?.trackGoogle('landingView', 'click_gotohomeroom');
    }
}
