import {Container, Rectangle} from 'pixi.js';
import type {IChatLinkStyleSheet, IChatStyleInternal} from './IChatStyleInternal';
import type {IChatTextFormat} from '@habbo/freeflowchat/style/IChatStyle';

/**
 * BlankStyle
 *
 * A no-op chat style used for spacer/empty-space bubbles — an invisible,
 * pointer-less, anonymous, system style with a fixed 20x29 footprint.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/BlankStyle.as
 */
export class BlankStyle implements IChatStyleInternal
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/BlankStyle.as::getNewBackgroundSprite()
    getNewBackgroundSprite(_tint: number = 0xFFFFFF): Container
    {
        // AS3 draws an invisible (alpha 0) 20x29 filled rect — an empty, correctly-sized spacer.
        return new Container();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/BlankStyle.as::get textFormat()
    get textFormat(): IChatTextFormat
    {
        return {fontFace: 'Volter', fontSize: 9, color: 0};
    }

    get styleSheet(): IChatLinkStyleSheet | null
    {
        return null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/BlankStyle.as::get pointer()
    get pointer(): ImageBitmap
    {
        // AS3 returns `new BitmapData(1, 10, true, 0)` — a fully transparent 1x10 placeholder.
        return new OffscreenCanvas(1, 10).transferToImageBitmap();
    }

    get pointerOffsetToBubbleBottom(): number
    {
        return 19;
    }

    getPointerLeftMargin(defaultValue: number): number
    {
        return defaultValue;
    }

    getPointerRightMargin(defaultValue: number): number
    {
        return defaultValue;
    }

    get faceOffset(): null
    {
        return null;
    }

    getEmblem(_multiline: boolean = false): null
    {
        return null;
    }

    getEmblemOffset(_multiline: boolean = false): null
    {
        return null;
    }

    get isAnonymous(): boolean
    {
        return true;
    }

    get isSystemStyle(): boolean
    {
        return true;
    }

    get textFieldMargins(): Rectangle
    {
        return new Rectangle(0, 0, 0, 0);
    }

    get overlap(): Rectangle
    {
        return new Rectangle(0, 0, 0, 0);
    }

    get allowHTML(): boolean
    {
        return false;
    }

    get isNotification(): boolean
    {
        return false;
    }
}
