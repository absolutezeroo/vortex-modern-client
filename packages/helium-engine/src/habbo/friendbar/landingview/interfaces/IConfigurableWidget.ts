/**
 * Optional capability for a landing view widget that reads its content spec
 * from a `landing.view.<code>.*` configuration namespace (e.g. `GenericWidget`,
 * `WidgetContainerWidget`, `DailyQuestWidget`).
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/interfaces/class_4080.as
 * (obfuscated as `_SafeCls_4474` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/_SafeCls_4474.as
 */
export interface IConfigurableWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/_SafeCls_4474.as::set configurationCode()
    set configurationCode(value: string);
}
