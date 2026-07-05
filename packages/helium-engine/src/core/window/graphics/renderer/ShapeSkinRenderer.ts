import type {IWindow} from '../../IWindow';
import type {ShapeController} from '../../components/ShapeController';
import {SkinRenderer} from './SkinRenderer';
import {HsvLayerColor} from './HsvLayerColor';

/**
 * Draws a vector shape (rectangle, round rectangle, ellipse, rhombus) with
 * an optional inset stroke, using canvas path drawing.
 *
 * The AS3 original rasterizes shapes pixel-by-pixel into a `BitmapData`;
 * this port uses native Canvas2D path fill/stroke, which is visually
 * equivalent and far cheaper under a canvas-based renderer.
 *
 * @see sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/ShapeSkinRenderer.as
 */
export class ShapeSkinRenderer extends SkinRenderer
{
    constructor(name: string)
    {
        super(name);
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/ShapeSkinRenderer.as::alphaFromColor()
    public static alphaFromColor(color: number): number
    {
        const alphaByte = (color >>> 24) & 0xFF;

        return alphaByte === 0 ? 1 : alphaByte / 255;
    }

    private static snappedThickness(value: number): number
    {
        return Number.isNaN(value) || value <= 0 ? 0 : Math.max(1, Math.round(value));
    }

    private static toCss(color: number, alpha: number): string
    {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        return `rgba(${r},${g},${b},${alpha})`;
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/ShapeSkinRenderer.as::draw()
    public override draw(
        window: IWindow,
        ctx: OffscreenCanvasRenderingContext2D,
        rect: { x: number; y: number; width: number; height: number },
        _state: number,
        _colorize: boolean
    ): void
    {
        const shapeWindow = window as unknown as ShapeController;

        if(!shapeWindow || !rect || rect.width <= 0 || rect.height <= 0)
        {
            return;
        }

        ctx.clearRect(rect.x, rect.y, rect.width, rect.height);

        const thickness = ShapeSkinRenderer.snappedThickness(shapeWindow.strokeThickness);
        const strokeColor = shapeWindow.strokeHsvShade !== 0
            ? HsvLayerColor.deriveColor(window.color, shapeWindow.strokeHsvShade)
            : shapeWindow.strokeColor;

        const fillAlpha = ShapeSkinRenderer.alphaFromColor(window.color);
        const strokeAlpha = ShapeSkinRenderer.alphaFromColor(strokeColor);

        ctx.fillStyle = ShapeSkinRenderer.toCss(window.color, fillAlpha);

        if(thickness > 0)
        {
            ctx.strokeStyle = ShapeSkinRenderer.toCss(strokeColor, strokeAlpha);
            ctx.lineWidth = thickness;
        }

        const path = ShapeSkinRenderer.buildPath(shapeWindow.shape, rect, thickness, shapeWindow.radius);

        ctx.fill(path);

        if(thickness > 0)
        {
            ctx.stroke(path);
        }
    }

    private static buildPath(
        shape: string,
        rect: { x: number; y: number; width: number; height: number },
        thickness: number,
        radius: number
    ): Path2D
    {
        const path = new Path2D();
        const inset = thickness / 2;

        switch(shape)
        {
            case 'round_rectangle':
            {
                const clampedRadius = Math.max(0, Math.min(rect.width / 2, rect.height / 2, radius));

                path.roundRect(rect.x + inset, rect.y + inset, rect.width - thickness, rect.height - thickness, clampedRadius);
                break;
            }
            case 'ellipse':
            {
                const cx = rect.x + rect.width / 2;
                const cy = rect.y + rect.height / 2;
                const rx = Math.max(0, rect.width / 2 - inset);
                const ry = Math.max(0, rect.height / 2 - inset);

                path.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                break;
            }
            case 'rhombus':
            {
                const x = rect.x + inset;
                const y = rect.y + inset;
                const width = rect.width - thickness;
                const height = rect.height - thickness;
                const cx = x + width / 2;
                const cy = y + height / 2;

                path.moveTo(cx, y);
                path.lineTo(x + width, cy);
                path.lineTo(cx, y + height);
                path.lineTo(x, cy);
                path.closePath();
                break;
            }
            default:
                path.rect(rect.x + inset, rect.y + inset, rect.width - thickness, rect.height - thickness);
        }

        return path;
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/ShapeSkinRenderer.as::isStateDrawable()
    public override isStateDrawable(_state: number): boolean
    {
        return true;
    }
}
