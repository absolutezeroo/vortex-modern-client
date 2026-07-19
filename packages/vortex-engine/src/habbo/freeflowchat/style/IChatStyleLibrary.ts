import type {IChatStyle} from './IChatStyle';

/**
 * IChatStyleLibrary Interface
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/style/_SafeCls_1946.as
 * (readable name recovered from sources/win63_2023_version/com/sulake/habbo/freeflowchat/style/IChatStyleLibrary.as)
 */
export interface IChatStyleLibrary
{
    getStyleIds(): number[];

    getStyle(styleId: number): IChatStyle | null;
}
