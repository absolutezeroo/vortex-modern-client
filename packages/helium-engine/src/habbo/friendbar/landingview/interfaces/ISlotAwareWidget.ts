/**
 * Optional capability for a landing view widget that needs to know which of
 * the 6 dynamic grid slots it was placed into (e.g. to vary its layout).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/ISlotAwareWidget.as
 */
export interface ISlotAwareWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/ISlotAwareWidget.as::set slot()
    set slot(value: number);
}
