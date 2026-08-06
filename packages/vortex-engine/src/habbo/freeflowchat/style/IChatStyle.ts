import type {Container, Rectangle} from 'pixi.js';

/**
 * IChatTextFormat
 *
 * Minimal subset of AS3 flash.text.TextFormat actually populated by
 * ChatStyleLibrary — font face, size, and RGB color.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::initializeStyleFromAssets()
 */
export interface IChatTextFormat
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
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as
 * (readable name recovered from sources/win63_2023_version/com/sulake/habbo/freeflowchat/style/IChatStyle.as)
 */
export interface IChatStyle
{
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::get selectorPreview()
    readonly selectorPreview: ImageBitmap;
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::get isSystemStyle()
    readonly isSystemStyle: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::get purchasable()
    readonly purchasable: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::get isHcOnly()
    readonly isHcOnly: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::get isAmbassadorOnly()
    readonly isAmbassadorOnly: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::get isStaffOverrideable()
    readonly isStaffOverrideable: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::get overlap()
    readonly overlap: Rectangle | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::get textFormat()
    readonly textFormat: IChatTextFormat;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/style/_SafeCls_1775.as::getNewBackgroundSprite()
    getNewBackgroundSprite(tint?: number): Container;
}
