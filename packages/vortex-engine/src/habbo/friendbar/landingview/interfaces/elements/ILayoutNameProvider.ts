/**
 * Optional capability for an `IElementHandler` that uses a shared XML layout
 * instead of the default `element_<type>` name.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/ILayoutNameProvider.as
 */
export interface ILayoutNameProvider
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/ILayoutNameProvider.as::get layoutName()
    readonly layoutName: string;
}
