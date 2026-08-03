/**
 * Optional capability for an `IElementHandler` that uses a shared XML layout
 * instead of the default `element_<type>` name.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/ILayoutNameProvider.as
 */
export interface ILayoutNameProvider
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/ILayoutNameProvider.as::get layoutName()
    readonly layoutName: string;
}
