/**
 * LoaderUI
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/LoaderUI.as
 *
 * The login flow's toolbox: text fields, balloons, frames, nine-slice shapes, and the anchor
 * helpers every view lays itself out with. Nothing here holds state — the views call these and
 * position the results.
 */
import {Bitmap} from './display/Bitmap';
import {BitmapData} from './display/BitmapData';
import type {DisplayObject} from './display/DisplayObject';
import {Sprite} from './display/DisplayObjectContainer';
import {DropShadowFilter} from './display/Filters';
import {ColorTransform, Point, Rectangle} from './display/Geom';
import {Scale9Shape} from './display/Scale9Shape';
import {LocalizedTextField} from './LocalizedTextField';
import {LoginAssets} from './LoginAssets';
import {NineSplitSprite} from './NineSplitSprite';

// DEVIATION: the AS3 class declares four `[Embed]` font classes — ubuntu_regular, ubuntu_bold,
//   ubuntu_italic, ubuntu_bold_italic. They are the SWF's copy of a font the player's machine may
//   not have; LoginFlow.as, OnBoardingHcFlow.as and HabboWindowManagerCom.as each declare the same
//   four, and the manifest lists them as `application/x-font-truetype` assets. The port embeds
//   them once rather than four times: `App.ts`'s `WEBFONT_FACES` has an entry per face and
//   `loadWebFonts()` reads their bytes out of the asset bundle and registers each through the
//   `FontFace` API — the browser equivalent of `[Embed]`, down to taking the same bytes from the
//   same bundle. See LoginFlow.ts's fuller note.
// AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/LoaderUI.as::ubuntu_regular
export class LoaderUI
{
    // AS3: STYLE_ILLUMINA
    public static readonly STYLE_ILLUMINA: number = 1;

    // AS3: STYLE_HITCH
    public static readonly STYLE_HITCH: number = 2;

    // AS3: ANCHOR_LEFT
    public static readonly ANCHOR_LEFT: string = 'l';

    // AS3: ANCHOR_CENTRE
    public static readonly ANCHOR_CENTRE: string = 'c';

    // AS3: ANCHOR_RIGHT
    public static readonly ANCHOR_RIGHT: string = 'r';

    // AS3: ANCHOR_TOP
    public static readonly ANCHOR_TOP: string = 't';

    // AS3: ANCHOR_MIDDLE
    public static readonly ANCHOR_MIDDLE: string = 'm';

    // AS3: ANCHOR_BOTTOM
    public static readonly ANCHOR_BOTTOM: string = 'b';

    // AS3: HITCH_TEXT_BODY_COLOUR
    public static readonly HITCH_TEXT_BODY_COLOUR: number = 8309486;

    // AS3: HITCH_TEXT_HIGHLIGHT_COLOUR
    public static readonly HITCH_TEXT_HIGHLIGHT_COLOUR: number = 16777215;

    // AS3: ETCHING_FILTER — new DropShadowFilter(1, 90, 0xD1D400, 1, 1, 1)
    private static readonly ETCHING_FILTER: DropShadowFilter = new DropShadowFilter(1, 90, 13751296, 1, 1, 1);

    // AS3: NEGATIVE_ETCHING_FILTER — new DropShadowFilter(1, 270, 0x000000, 0.7, 1, 1)
    private static readonly NEGATIVE_ETCHING_FILTER: DropShadowFilter = new DropShadowFilter(1, 270, 0, 0.7, 1, 1);

    /**
     * AS3: createTextField(_arg_1:String, _arg_2:int, _arg_3:uint, _arg_4:Boolean=false, _arg_5:Boolean=false,
     *      _arg_6:Boolean=false, _arg_7:Boolean=false, _arg_8:String="left", _arg_9:Boolean=false, _arg_10:Boolean=false)
     *
     * `_arg_5` sets multiline AND wordWrap; `_arg_6` makes the field an input. The trailing
     * `width = textWidth; height = textHeight` is AS3 shedding Flash's 2px gutter after autoSize.
     */
    // AS3: .../src/onBoardingHcUi/LoaderUI.as::createTextField()
    public static createTextField(
        text: string,
        size: number,
        color: number,
        bold: boolean = false,
        multiline: boolean = false,
        input: boolean = false,
        italic: boolean = false,
        align: 'left' | 'center' | 'right' = 'left',
        kerning: boolean = false,
        underline: boolean = false
    ): LocalizedTextField
    {
        const field = new LocalizedTextField({
            font: 'Ubuntu',
            size,
            color,
            bold,
            italic,
            underline,
            align,
            kerning,
        });

        field.multiline = multiline;
        field.wordWrap = multiline;
        field.isInput = input;
        field.selectable = input;
        field.htmlText = text;
        field.autoSize = true;
        field.width = field.textWidth;
        field.height = field.textHeight;

        return field;
    }

    /**
     * AS3: addEtching(_arg_1:DisplayObject, _arg_2:Boolean=false)
     *
     * The filters are cloned, as in AS3 — a shared filter instance would be mutated by whoever
     * touched it next.
     */
    // AS3: .../src/onBoardingHcUi/LoaderUI.as::addEtching()
    public static addEtching(target: DisplayObject, negative: boolean = false): void
    {
        target.filters = [negative ? LoaderUI.NEGATIVE_ETCHING_FILTER.clone() : LoaderUI.ETCHING_FILTER.clone()];
    }

    // AS3: lineUpHorizontally(_arg_1:DisplayObject, ...rest)
    public static lineUpHorizontally(anchor: DisplayObject, ...rest: (number | DisplayObject)[]): void
    {
        let previous = anchor;

        for(let i = 0; i < rest.length / 2; i++)
        {
            const gap = rest[i * 2] as number;
            const target = rest[i * 2 + 1] as DisplayObject;

            target.x = previous.x + previous.width + gap;
            previous = target;
        }
    }

    // AS3: lineUpHorizontallyRevers(_arg_1:DisplayObject, ...rest)
    public static lineUpHorizontallyRevers(anchor: DisplayObject, ...rest: (number | DisplayObject)[]): void
    {
        let previous = anchor;

        for(let i = 0; i < rest.length / 2; i++)
        {
            const gap = rest[i * 2] as number;
            const target = rest[i * 2 + 1] as DisplayObject;

            target.x = previous.x - gap - target.width;
            previous = target;
        }
    }

    // AS3: lineUpVertically(_arg_1:DisplayObject, ...rest)
    public static lineUpVertically(anchor: DisplayObject, ...rest: (number | DisplayObject)[]): void
    {
        let previous = anchor;

        for(let i = 0; i < rest.length / 2; i++)
        {
            const gap = rest[i * 2] as number;
            const target = rest[i * 2 + 1] as DisplayObject;

            target.y = previous.y + previous.height + gap;
            previous = target;
        }
    }

    // AS3: lineUpVerticallyRevers(_arg_1:DisplayObject, ...rest)
    public static lineUpVerticallyRevers(anchor: DisplayObject, ...rest: (number | DisplayObject)[]): void
    {
        let previous = anchor;

        for(let i = 0; i < rest.length / 2; i++)
        {
            const gap = rest[i * 2] as number;
            const target = rest[i * 2 + 1] as DisplayObject;

            target.y = previous.y - gap - target.height;
            previous = target;
        }
    }

    // AS3: lineUpElementsVertically(_arg_1:Vector.<DisplayObject>, _arg_2:int)
    public static lineUpElementsVertically(elements: DisplayObject[], gap: number): void
    {
        if(elements == null || elements.length < 2) return;

        let previous = elements[0];

        for(let i = 0; i < elements.length - 1; i++)
        {
            const target = elements[i + 1];

            target.y = previous.y + previous.height + gap;
            previous = target;
        }
    }

    /**
     * AS3: alignAnchors(_arg_1:DisplayObject, _arg_2:int, _arg_3:String, ...rest)
     *
     * `_arg_3` is a string of anchor letters, tested with indexOf — so "lt" applies both.
     */
    // AS3: .../src/onBoardingHcUi/LoaderUI.as::alignAnchors()
    public static alignAnchors(anchor: DisplayObject, offset: number, anchors: string, ...targets: DisplayObject[]): void
    {
        for(const target of targets)
        {
            if(anchors.indexOf('l') >= 0)
            {
                target.x = anchor.x + offset;
            }

            if(anchors.indexOf('c') >= 0)
            {
                target.x = anchor.x + Math.trunc((anchor.width - target.width) / 2);
            }

            if(anchors.indexOf('r') >= 0)
            {
                target.x = anchor.x + anchor.width - target.width - offset;
            }

            if(anchors.indexOf('t') >= 0)
            {
                target.y = anchor.y + offset;
            }

            if(anchors.indexOf('m') >= 0)
            {
                target.y = anchor.y + Math.trunc((anchor.height - target.height) / 2);
            }

            if(anchors.indexOf('b') >= 0)
            {
                target.y = anchor.y + anchor.height - target.height - offset;
            }
        }
    }

    /**
     * AS3: createBalloon(_arg_1:int, _arg_2:int, _arg_3:int, _arg_4:Boolean, _arg_5:uint=0xFFFFFF, _arg_6:String="up")
     *
     * `_arg_4` is declared and never read in the AS3 — kept in the signature so call sites stay
     * a literal transcription.
     */
    // AS3: .../src/onBoardingHcUi/LoaderUI.as::createBalloon()
    public static createBalloon(
        width: number,
        height: number,
        pointOffset: number,
        _unused: boolean,
        color: number = 16777215,
        direction: string = 'up'
    ): Bitmap
    {
        let offset = pointOffset;

        if(offset < 0)
        {
            offset = (width - 9) / 2;
        }

        const nineSlice = NineSplitSprite.DARK_BALLOON;
        let target: BitmapData;

        switch(direction)
        {
            case 'up':
            {
                const point = LoginAssets.get('block_dark_point_up');

                target = new BitmapData(width, height + point.height, true, 860986);
                nineSlice.renderOn(target, new Rectangle(0, point.height, width, height));
                target.copyPixels(point, point.rect, new Point(offset, 0));
                break;
            }

            case 'down':
            {
                const point = LoginAssets.get('block_dark_point_down');

                target = new BitmapData(width, height + point.height, true, 860986);
                nineSlice.renderOn(target, new Rectangle(0, point.height, width, height));
                target.copyPixels(point, point.rect, new Point(offset, height + point.height));
                break;
            }

            case 'left':
            {
                const point = LoginAssets.get('block_dark_point_left');

                target = new BitmapData(width + point.width, height, true, 16777215);
                nineSlice.renderOn(target, new Rectangle(point.width, 0, width, height));
                target.copyPixels(point, point.rect, new Point(0, offset - point.width));
                break;
            }

            case 'right':
            {
                const point = LoginAssets.get('block_dark_point_right');

                target = new BitmapData(width + point.width, height, true, 860986);
                nineSlice.renderOn(target, new Rectangle(0, 0, width, height));
                target.copyPixels(point, point.rect, new Point(width, offset - point.width));
                break;
            }

            default:
            {
                target = new BitmapData(width, height, true, 860986);
                nineSlice.renderOn(target, new Rectangle(0, 0, width, height));
                break;
            }
        }

        target.colorTransform(
            target.rect,
            new ColorTransform(((color >> 16) & 0xFF) / 255, ((color >> 8) & 0xFF) / 255, (color & 0xFF) / 255)
        );

        return new Bitmap(target);
    }

    /**
     * AS3: createFrame(_arg_1:String, _arg_2:String, _arg_3:Rectangle, _arg_4:int=1):Sprite
     *
     * The caption sits ABOVE the frame (negative y), which is what puts an `InputField`'s label
     * over its box.
     */
    // AS3: .../src/onBoardingHcUi/LoaderUI.as::createFrame()
    public static createFrame(caption: string, subCaption: string, area: Rectangle, style: number = 1): Sprite
    {
        const frame = new Sprite();

        frame.x = area.x;
        frame.y = area.y;

        if(style === 1)
        {
            frame.addChild(new Bitmap(NineSplitSprite.FRAME.render(area.width, area.height)));
        }

        const color = style === 2 ? 8309486 : 16777215;
        const size = style === 2 ? 24 : 40;
        const captionField = LoaderUI.createTextField(caption, size, color, false, false, false, false);

        captionField.y = -(size + 8);
        captionField.autoSize = true;
        frame.addChild(captionField);

        if(style === 2)
        {
            captionField.width = area.width;
            captionField.thickness = 50;
        }

        if(subCaption != null && subCaption !== '')
        {
            const subCaptionField = LoaderUI.createTextField(subCaption, 10, 11184810, true);

            subCaptionField.x = 8;
            subCaptionField.y = -(size + 16);
            subCaptionField.autoSize = true;
            frame.addChild(subCaptionField);
        }

        return frame;
    }

    // AS3: resizeFrame(_arg_1:Sprite, _arg_2:int, _arg_3:int)
    public static resizeFrame(frame: Sprite, width: number, height: number): void
    {
        frame.removeChildAt(0);
        frame.addChildAt(new Bitmap(NineSplitSprite.FRAME.render(width, height)), 0);
    }

    /**
     * AS3: createScale9GridShapeFromImage(_arg_1:BitmapData, _arg_2:Rectangle):Shape
     *
     * AS3 draws nine bitmap-filled rectangles and then sets `scale9Grid`, so the shape re-slices
     * on resize; `Scale9Shape` is that behaviour (see its header).
     */
    // AS3: .../src/onBoardingHcUi/LoaderUI.as::createScale9GridShapeFromImage()
    public static createScale9GridShapeFromImage(source: BitmapData, grid: Rectangle): Scale9Shape
    {
        return new Scale9Shape(source, grid);
    }

    // AS3: createTextBorder():Shape
    public static createTextBorder(): Scale9Shape
    {
        return LoaderUI.createScale9GridShapeFromImage(
            LoginAssets.get('border_text_hitch'),
            new Rectangle(10, 10, 10, 10)
        );
    }
}
