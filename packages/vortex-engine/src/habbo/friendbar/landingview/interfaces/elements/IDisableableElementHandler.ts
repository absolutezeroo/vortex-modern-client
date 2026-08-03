/**
 * Optional capability for an `IElementHandler` that needs explicit teardown
 * separate from disposal (e.g. stop a running timer/poll).
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/interfaces/elements/class_4112.as
 * (obfuscated as `_SafeCls_4521` in the primary source).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/_SafeCls_4521.as
 */
export interface IDisableableElementHandler
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/_SafeCls_4521.as::disable()
    disable(): void;
}
