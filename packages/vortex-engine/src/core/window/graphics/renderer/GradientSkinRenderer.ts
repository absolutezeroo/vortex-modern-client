import type {IWindow} from '../../IWindow';
import type {GradientController} from '../../components/GradientController';
import {SkinRenderer} from './SkinRenderer';

/**
 * Draws a two-color gradient fill.
 *
 * The AS3 original always calls `beginGradientFill("radial", ...)` regardless
 * of the controller's `mode` property (linear vs. radial) — this looks like
 * a bug, but per project convention the real client behavior is preserved
 * as-is rather than "fixed". The gradient box (rotated ellipse inscribed in
 * the target rect, clamped beyond its edge) is reproduced with a clip +
 * transformed `createRadialGradient`, matching Flash's `createGradientBox()`
 * + `beginGradientFill()` idiom.
 *
 * @see sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/GradientSkinRenderer.as
 */
export class GradientSkinRenderer extends SkinRenderer
{
    constructor(name: string)
    {
        super(name);
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/GradientSkinRenderer.as::angleForDirection()
    public static angleForDirection(direction: string): number
    {
        switch(direction)
        {
            case 'right':
                return 0;
            case 'down':
                return Math.PI / 2;
            case 'left':
                return Math.PI;
            case 'up':
                return -Math.PI / 2;
            case 'down_right':
                return Math.PI / 4;
            case 'down_left':
                return (3 * Math.PI) / 4;
            case 'up_left':
                return (-3 * Math.PI) / 4;
            case 'up_right':
                return -Math.PI / 4;
            default:
                return Math.PI / 2;
        }
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/GradientSkinRenderer.as::rgbFromColor()
    public static rgbFromColor(color: number): number
    {
        return color & 0xFFFFFF;
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/GradientSkinRenderer.as::alphaFromColor()
    public static alphaFromColor(color: number): number
    {
        const alphaByte = (color >>> 24) & 0xFF;

        return alphaByte === 0 ? 1 : alphaByte / 255;
    }

    private static toCss(color: number): string
    {
        const rgb = GradientSkinRenderer.rgbFromColor(color);
        const a = GradientSkinRenderer.alphaFromColor(color);
        const r = (rgb >> 16) & 0xFF;
        const g = (rgb >> 8) & 0xFF;
        const b = rgb & 0xFF;

        return `rgba(${r},${g},${b},${a})`;
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/GradientSkinRenderer.as::drawGradient()
    public static drawGradient(
        ctx: OffscreenCanvasRenderingContext2D,
        rect: { x: number; y: number; width: number; height: number },
        color1: number,
        color2: number,
        _mode: string,
        direction: string
    ): void
    {
        if(rect.width <= 0 || rect.height <= 0)
        {
            return;
        }

        const angle = GradientSkinRenderer.angleForDirection(direction);

        ctx.save();
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.clip();

        ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        ctx.rotate(angle);
        ctx.scale(rect.width / 2, rect.height / 2);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        gradient.addColorStop(0, GradientSkinRenderer.toCss(color1));
        gradient.addColorStop(1, GradientSkinRenderer.toCss(color2));

        ctx.fillStyle = gradient;
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/GradientSkinRenderer.as::draw()
    public override draw(
        window: IWindow,
        ctx: OffscreenCanvasRenderingContext2D,
        rect: { x: number; y: number; width: number; height: number },
        _state: number,
        _colorize: boolean
    ): void
    {
        const gradientWindow = window as unknown as GradientController;

        if(!gradientWindow || !rect || rect.width <= 0 || rect.height <= 0)
        {
            return;
        }

        GradientSkinRenderer.drawGradient(ctx, rect, gradientWindow.color1, gradientWindow.color2, gradientWindow.mode, gradientWindow.direction);
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/GradientSkinRenderer.as::isStateDrawable()
    public override isStateDrawable(_state: number): boolean
    {
        return true;
    }
}
