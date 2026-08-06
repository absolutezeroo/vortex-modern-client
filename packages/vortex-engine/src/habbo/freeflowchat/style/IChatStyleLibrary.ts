import type {IChatStyle} from './IChatStyle';

/**
 * IChatStyleLibrary Interface
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/style/_SafeCls_1946.as
 * (readable name recovered from sources/win63_2023_version/com/sulake/habbo/freeflowchat/style/IChatStyleLibrary.as)
 */
export interface IChatStyleLibrary
{
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1946.as::getStyleIds()
    getStyleIds(): number[];

    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1946.as::getStyle()
    getStyle(styleId: number): IChatStyle | null;
}
