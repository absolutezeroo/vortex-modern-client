/**
 * Optional capability for a landing view widget that needs to react to the
 * desktop being resized. Checked with a structural `instanceof`-style test
 * by `WidgetContainer.windowResized()`.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/IResizeAwareWidget.as
 */
export interface IResizeAwareWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/IResizeAwareWidget.as::windowResized()
    windowResized(): void;
}
