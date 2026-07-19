/**
 * Optional capability for a landing view widget that needs explicit teardown
 * when the landing view is disabled (e.g. entering a room), separate from
 * `dispose()`. Checked with a structural test by `WidgetContainer.disable()`.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/interfaces/class_4081.as
 * (obfuscated as `_SafeCls_4473` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/_SafeCls_4473.as
 */
export interface IDisableableWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/_SafeCls_4473.as::disable()
    disable(): void;
}
