/**
 * Optional capability for a landing view widget that needs to react to the
 * desktop being resized. Checked with a structural `instanceof`-style test
 * by `WidgetContainer.windowResized()`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/IResizeAwareWidget.as
 */
export interface IResizeAwareWidget
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/IResizeAwareWidget.as::windowResized()
    windowResized(): void;
}
