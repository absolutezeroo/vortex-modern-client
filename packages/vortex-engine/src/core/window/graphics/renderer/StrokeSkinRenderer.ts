import type {IWindow} from '../../IWindow';
import type {StrokeController} from '../../components/StrokeController';
import {SkinRenderer} from './SkinRenderer';

/**
 * Draws a stroke-only outline, either as a single rounded-rect stroke
 * (when all sides are enabled and a corner radius is set) or as up to
 * four independent per-side filled strips (sharp corners).
 *
 * @see sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/StrokeSkinRenderer.as
 */
export class StrokeSkinRenderer extends SkinRenderer
{
    private static readonly SIDE_MASK_ALL: number = 15;

    constructor(name: string)
    {
        super(name);
    }

    private static toCss(color: number): string
    {
        const alphaByte = (color >>> 24) & 0xFF;
        const alpha = alphaByte === 0 ? 1 : alphaByte / 255;
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        return `rgba(${r},${g},${b},${alpha})`;
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/StrokeSkinRenderer.as::draw()
    public override draw(
        window: IWindow,
        ctx: OffscreenCanvasRenderingContext2D,
        rect: { x: number; y: number; width: number; height: number },
        _state: number,
        _colorize: boolean
    ): void
    {
        const strokeWindow = window as unknown as StrokeController;

        if(!strokeWindow || !rect || rect.width <= 0 || rect.height <= 0)
        {
            return;
        }

        ctx.clearRect(rect.x, rect.y, rect.width, rect.height);

        if(strokeWindow.strokeThickness <= 0)
        {
            return;
        }

        const thickness = Math.max(1, Math.round(strokeWindow.strokeThickness));
        const sideMask = strokeWindow.sideMask;

        ctx.fillStyle = StrokeSkinRenderer.toCss(window.color);

        if(sideMask === StrokeSkinRenderer.SIDE_MASK_ALL && strokeWindow.radius > 0)
        {
            const inset = thickness / 2;
            const radius = Math.max(0, Math.min(rect.width / 2, rect.height / 2, strokeWindow.radius));
            const path = new Path2D();

            path.roundRect(rect.x + inset, rect.y + inset, rect.width - thickness, rect.height - thickness, radius);

            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = thickness;
            ctx.stroke(path);

            return;
        }

        const top = (sideMask & 1) !== 0;
        const right = (sideMask & 2) !== 0;
        const bottom = (sideMask & 4) !== 0;
        const left = (sideMask & 8) !== 0;

        if(top)
        {
            ctx.fillRect(rect.x, rect.y, rect.width, thickness);
        }

        if(right)
        {
            ctx.fillRect(rect.x + rect.width - thickness, rect.y, thickness, rect.height);
        }

        if(bottom)
        {
            ctx.fillRect(rect.x, rect.y + rect.height - thickness, rect.width, thickness);
        }

        if(left)
        {
            ctx.fillRect(rect.x, rect.y, thickness, rect.height);
        }
    }

    // AS3: sources/win63_2026_crypted_version/com/sulake/core/window/graphics/renderer/StrokeSkinRenderer.as::isStateDrawable()
    public override isStateDrawable(_state: number): boolean
    {
        return true;
    }
}
