import type {Container, Rectangle} from 'pixi.js';

/**
 * ChatTextFormat
 *
 * Minimal subset of AS3 flash.text.TextFormat actually populated by
 * ChatStyleLibrary — font face, size, and RGB color.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::initializeStyleFromAssets()
 */
export interface ChatTextFormat
{
    fontFace: string;
    fontSize: number;
    color: number;
}

/**
 * IChatStyle Interface
 *
 * Public-facing chat bubble style contract, implemented by ChatStyle and
 * consumed outside the freeflowchat viewer package (e.g. by a chat style
 * selector / preference UI).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as
 * (readable name recovered from sources/win63_2023_version/com/sulake/habbo/freeflowchat/style/IChatStyle.as)
 */
export interface IChatStyle
{
    readonly selectorPreview: ImageBitmap;
    readonly isSystemStyle: boolean;
    readonly purchasable: boolean;
    readonly isHcOnly: boolean;
    readonly isAmbassadorOnly: boolean;
    readonly isStaffOverrideable: boolean;
    readonly overlap: Rectangle | null;
    readonly textFormat: ChatTextFormat;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::getNewBackgroundSprite()
    getNewBackgroundSprite(tint?: number): Container;
}
