/**
 * Layout entity for skin rendering.
 *
 * Defines the destination placement of a single piece in the skin layout.
 * Scale modes control how the piece adapts to changes in window dimensions.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/core/window/graphics/renderer/SkinLayoutEntity.as
 */
export class SkinLayoutEntity
{
    public static readonly SCALE_FIXED: number = 0;
    public static readonly SCALE_MOVE: number = 1;
    public static readonly SCALE_STRETCH: number = 2;
    public static readonly SCALE_TILED: number = 4;
    public static readonly SCALE_CENTER: number = 8;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/graphics/renderer/SkinLayoutEntity.as::COLORIZE_METHOD_MULTIPLY
    public static readonly COLORIZE_METHOD_MULTIPLY: string = 'multiply';
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/graphics/renderer/SkinLayoutEntity.as::COLORIZE_METHOD_HSV_LAYER
    public static readonly COLORIZE_METHOD_HSV_LAYER: string = 'hsv_layer';

    public readonly id: number;
    public readonly name: string;
    public readonly colorize: boolean;
    public readonly color: number;
    public readonly blend: number;
    public readonly scaleH: number;
    public readonly scaleV: number;
    public readonly region: { x: number; y: number; width: number; height: number };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/graphics/renderer/SkinLayoutEntity.as::colorizeMethod
    public colorizeMethod: string = SkinLayoutEntity.COLORIZE_METHOD_MULTIPLY;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/graphics/renderer/SkinLayoutEntity.as::shade
    public shade: number = 0;

    constructor(
        id: number,
        name: string,
        colorize: boolean,
        color: number,
        blend: number,
        scaleH: number,
        scaleV: number,
        region: { x: number; y: number; width: number; height: number }
    )
    {
        this.id = id;
        this.name = name;
        this.colorize = colorize;
        this.color = color;
        this.blend = blend;
        this.scaleH = scaleH;
        this.scaleV = scaleV;
        this.region = {...region};
    }
}
