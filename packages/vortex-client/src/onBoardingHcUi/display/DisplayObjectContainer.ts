/**
 * Container and sprite nodes of the login display list.
 *
 * TS-only: stand-ins for `flash.display.DisplayObjectContainer`, `flash.display.Sprite` and the
 * subset of `flash.display.Graphics` the login screens draw with — `Background` fills a gradient
 * and tiles a bitmap over it, `Dimmer` fills a 2×2 bitmap across the stage.
 */
import type {BitmapData} from './BitmapData';
import {DisplayObject, EMPTY_BOUNDS} from './DisplayObject';
import type { Matrix} from './Geom';
import {GRADIENT_BOX_EXTENT, Rectangle} from './Geom';
import type {Stage} from './Stage';

/** TS-only: one recorded drawing command. */
interface IGraphicsCommand
{
    kind: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: IGraphicsFill | null;

    /**
     * TS-only: the paint style built for this command, kept because it was being rebuilt on every
     * frame. Both users of a bitmap fill — the login `Background`'s tile and `Dimmer`'s 2x2 — cover
     * the whole stage, so each frame was calling `createPattern()` on a `willReadFrequently` canvas
     * (system memory, by construction) and handing the result straight to a full-screen `fillRect`.
     * The gradient was rebuilt stop by stop the same way. Nothing about either can change without a
     * `clear()`, which drops these commands and the cache with them: the fill is fixed when the
     * command is recorded, and both bitmaps are fully painted before that happens.
     */
    style?: CanvasPattern | CanvasGradient | null;
}

/** TS-only: the active fill when a shape is recorded. */
interface IGraphicsFill
{
    kind: 'bitmap' | 'gradient';
    bitmap: BitmapData | null;
    colors: number[];
    alphas: number[];
    ratios: number[];
    matrix: Matrix | null;
}

/**
 * TS-only: `flash.display.Graphics`, recording the commands so they can be replayed each frame.
 */
export class Graphics
{
    private _commands: IGraphicsCommand[] = [];
    private _fill: IGraphicsFill | null = null;

    /** TS-only: `clear()`. */
    public clear(): void
    {
        this._commands = [];
        this._fill = null;
    }

    /** TS-only: `beginBitmapFill(bitmap)`. */
    public beginBitmapFill(bitmap: BitmapData): void
    {
        this._fill = {kind: 'bitmap', bitmap, colors: [], alphas: [], ratios: [], matrix: null};
    }

    /**
     * TS-only: `beginGradientFill(type, colors, alphas, ratios, matrix, spreadMethod)`.
     *
     * Only the linear form is honoured, which is the only one the login `Background` uses. The
     * matrix is Flash's gradient box (`createGradientBox()` + rotate + scale); the gradient runs
     * along the box's local x axis, so the port derives the two endpoints from it directly.
     */
    public beginGradientFill(colors: number[], alphas: number[], ratios: number[], matrix: Matrix): void
    {
        this._fill = {kind: 'gradient', bitmap: null, colors, alphas, ratios, matrix};
    }

    /** TS-only: `endFill()`. */
    public endFill(): void
    {
        this._fill = null;
    }

    /** TS-only: `drawRect(x, y, width, height)`. */
    public drawRect(x: number, y: number, width: number, height: number): void
    {
        this._commands.push({kind: 'rect', x, y, width, height, fill: this._fill});
    }

    /** TS-only: bounds of everything recorded so far. */
    public getBounds(): Rectangle
    {
        if(this._commands.length === 0) return EMPTY_BOUNDS;

        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for(const command of this._commands)
        {
            minX = Math.min(minX, command.x);
            minY = Math.min(minY, command.y);
            maxX = Math.max(maxX, command.x + command.width);
            maxY = Math.max(maxY, command.y + command.height);
        }

        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    /** TS-only: replays the recorded commands. */
    public render(context: CanvasRenderingContext2D): void
    {
        for(const command of this._commands)
        {
            const style = this.createFillStyle(context, command);

            if(!style) continue;

            context.fillStyle = style;
            context.fillRect(command.x, command.y, command.width, command.height);
        }
    }

    /** TS-only: turns a recorded fill into a canvas paint style, once per recorded command. */
    private createFillStyle(
        context: CanvasRenderingContext2D,
        command: IGraphicsCommand
    ): CanvasPattern | CanvasGradient | null
    {
        if(command.style !== undefined) return command.style;

        command.style = this.buildFillStyle(context, command);

        return command.style;
    }

    private buildFillStyle(
        context: CanvasRenderingContext2D,
        command: IGraphicsCommand
    ): CanvasPattern | CanvasGradient | null
    {
        const fill = command.fill;

        if(!fill) return null;

        if(fill.kind === 'bitmap')
        {
            return fill.bitmap ? context.createPattern(fill.bitmap.source, 'repeat') : null;
        }

        const matrix = fill.matrix;

        if(!matrix) return null;

        // Flash runs a linear gradient along its gradient box's x axis, from -819.2 to +819.2,
        // so the two endpoints are those run through the matrix. Deriving them from the matrix's
        // translation alone would collapse the gradient to a point.
        const start = matrix.transformPoint(-GRADIENT_BOX_EXTENT, 0);
        const end = matrix.transformPoint(GRADIENT_BOX_EXTENT, 0);
        const gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);

        for(let i = 0; i < fill.colors.length; i++)
        {
            const color = fill.colors[i];
            const alpha = fill.alphas[i] ?? 1;
            const ratio = (fill.ratios[i] ?? 0) / 255;
            const red = (color >> 16) & 0xFF;
            const green = (color >> 8) & 0xFF;
            const blue = color & 0xFF;

            gradient.addColorStop(Math.min(1, Math.max(0, ratio)), `rgba(${red}, ${green}, ${blue}, ${alpha})`);
        }

        return gradient;
    }
}

/**
 * TS-only: `flash.display.DisplayObjectContainer`.
 */
export class DisplayObjectContainer extends DisplayObject
{
    /** TS-only: `mouseChildren` — the widgets set it false so the whole widget is the hit target. */
    public mouseChildren: boolean = true;

    /** TS-only: `buttonMode` — drives the cursor, as in Flash. */
    public buttonMode: boolean = false;

    protected _children: DisplayObject[] = [];

    /** TS-only: `get numChildren()`. */
    public get numChildren(): number
    {
        return this._children.length;
    }

    /** TS-only: `addChild(child)`. */
    public addChild<T extends DisplayObject>(child: T): T
    {
        return this.addChildAt(child, this._children.length);
    }

    /** TS-only: `addChildAt(child, index)`. */
    public addChildAt<T extends DisplayObject>(child: T, index: number): T
    {
        const parent = child.parent;

        if(parent)
        {
            parent.removeChild(child);
        }

        this._children.splice(index, 0, child);
        child.setParent(this);
        child.setStage(this._stage);

        return child;
    }

    /** TS-only: `removeChild(child)`. */
    public removeChild<T extends DisplayObject>(child: T): T
    {
        const index = this._children.indexOf(child);

        if(index < 0) return child;

        return this.removeChildAt(index) as T;
    }

    /** TS-only: `removeChildAt(index)`. */
    public removeChildAt(index: number): DisplayObject
    {
        const [child] = this._children.splice(index, 1);

        child.setStage(null);
        child.setParent(null);

        return child;
    }

    /** TS-only: `getChildAt(index)`. */
    public getChildAt(index: number): DisplayObject
    {
        return this._children[index];
    }

    /** TS-only: `contains(child)`. */
    public contains(child: DisplayObject): boolean
    {
        return this._children.indexOf(child) >= 0;
    }

    /**
     * TS-only: propagates the stage down the subtree, so `addedToStage` reaches every descendant
     * the way Flash delivers it.
     */
    public override setStage(stage: Stage | null): void
    {
        if(this._stage === stage) return;

        super.setStage(stage);

        for(const child of this._children.slice())
        {
            child.setStage(stage);
        }
    }

    /**
     * TS-only: union of the children's bounds, which is what Flash reports for a container and
     * what `LoaderUI.alignAnchors()` measures.
     */
    public getContentBounds(): Rectangle
    {
        if(this._children.length === 0) return EMPTY_BOUNDS;

        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for(const child of this._children)
        {
            const bounds = child.getContentBounds();
            const left = child.x + bounds.x * child.scaleX;
            const top = child.y + bounds.y * child.scaleY;
            const right = left + bounds.width * child.scaleX;
            const bottom = top + bounds.height * child.scaleY;

            minX = Math.min(minX, left);
            minY = Math.min(minY, top);
            maxX = Math.max(maxX, right);
            maxY = Math.max(maxY, bottom);
        }

        if(!isFinite(minX)) return EMPTY_BOUNDS;

        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    /**
     * TS-only: front-to-back hit test. With `mouseChildren` false the container itself is
     * reported, which is how `Button` receives the click its children were under.
     */
    public override hitTest(localX: number, localY: number): DisplayObject | null
    {
        if(!this.visible || !this.mouseEnabled) return null;

        for(let i = this._children.length - 1; i >= 0; i--)
        {
            const child = this._children[i];
            const childX = (localX - child.x) / (child.scaleX || 1);
            const childY = (localY - child.y) / (child.scaleY || 1);
            const hit = child.hitTest(childX, childY);

            if(hit)
            {
                return this.mouseChildren ? hit : this;
            }
        }

        return null;
    }

    protected draw(context: CanvasRenderingContext2D): void
    {
        for(const child of this._children)
        {
            child.render(context);
        }
    }
}

/**
 * TS-only: `flash.display.Sprite` — a container with a `graphics` surface.
 */
export class Sprite extends DisplayObjectContainer
{
    private readonly _graphics: Graphics = new Graphics();

    /** TS-only: `get graphics()`. */
    public get graphics(): Graphics
    {
        return this._graphics;
    }

    public override getContentBounds(): Rectangle
    {
        const children = super.getContentBounds();
        const drawn = this._graphics.getBounds();

        if(drawn.width === 0 && drawn.height === 0) return children;

        if(children.width === 0 && children.height === 0) return drawn;

        const minX = Math.min(children.x, drawn.x);
        const minY = Math.min(children.y, drawn.y);
        const maxX = Math.max(children.x + children.width, drawn.x + drawn.width);
        const maxY = Math.max(children.y + children.height, drawn.y + drawn.height);

        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    protected override draw(context: CanvasRenderingContext2D): void
    {
        this._graphics.render(context);
        super.draw(context);
    }
}
