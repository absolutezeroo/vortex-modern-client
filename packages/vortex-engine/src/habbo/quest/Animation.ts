/**
 * Animation — a tiny sprite compositor: it owns one bitmap-wrapper window and paints a set of
 * {@link IAnimationObject}s into it on every update, stopping by itself once they have all finished.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/Animation.as
 *
 * `draw()` is where the self-stopping lives: it clears the buffer, asks every unfinished object for
 * its frame, and sets `_running` to whether *any* object still had one. So the animation runs
 * exactly as long as its longest-lived object.
 *
 * **TS deviation.** AS3 owns a mutable `BitmapData` and calls `fillRect`/`copyPixels` straight into
 * the window's own bitmap. The port's `IBitmapWrapperWindow.bitmap` is an immutable `ImageBitmap`,
 * so the mutable buffer is an `OffscreenCanvas` here and each finished frame is converted with
 * `createImageBitmap()` — which is async, so a frame lands one microtask after it was composed.
 * At AS3's 100 ms per twinkle frame that is invisible. `_frameGeneration` drops a conversion that
 * finished after a newer one, the same guard the campaign calendar's gradients use.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IAnimationObject} from './IAnimationObject';

export class Animation
{
    /** Derived name — `_SafeStr_4644`: the window this animation paints into. */
    // AS3: Animation.as::_SafeStr_4644
    private _bitmapWindow: IBitmapWrapperWindow | null;

    /** Derived name — `_SafeStr_6367`: milliseconds since `restart()`. */
    // AS3: Animation.as::_SafeStr_6367
    private _elapsedMs: number = 0;

    /** Derived name — `_SafeStr_6466`: whether `update()` still has work to do. */
    // AS3: Animation.as::_SafeStr_6466
    private _running: boolean = false;

    // AS3: Animation.as::_sprites
    private _sprites: IAnimationObject[] | null = [];

    // TS-only: the mutable buffer standing in for AS3's `BitmapData`.
    private _canvas: OffscreenCanvas | null = null;

    // TS-only: see `_canvas`.
    private _ctx: OffscreenCanvasRenderingContext2D | null = null;

    // TS-only: drops an `ImageBitmap` conversion that finished after a newer frame.
    private _frameGeneration: number = 0;

    // AS3: Animation.as::Animation()
    constructor(bitmapWindow: IBitmapWrapperWindow | null)
    {
        this._bitmapWindow = bitmapWindow;

        if(bitmapWindow === null) return;

        const window = bitmapWindow as unknown as IWindow;

        window.visible = false;

        // AS3 allocates an empty transparent BitmapData when the window has none; the port's
        // equivalent is the offscreen buffer, which is allocated either way.
        this._canvas = new OffscreenCanvas(Math.max(1, window.width), Math.max(1, window.height));
        this._ctx = this._canvas.getContext('2d');
    }

    // AS3: Animation.as::get disposed()
    public get disposed(): boolean
    {
        return this._bitmapWindow === null;
    }

    // AS3: Animation.as::addObject()
    public addObject(object: IAnimationObject): void
    {
        this._sprites?.push(object);
    }

    // AS3: Animation.as::stop()
    public stop(): void
    {
        this._running = false;

        if(this._bitmapWindow !== null)
        {
            (this._bitmapWindow as unknown as IWindow).visible = false;
        }
    }

    // AS3: Animation.as::restart()
    public restart(): void
    {
        this._elapsedMs = 0;
        this._running = true;

        for(const sprite of this._sprites ?? [])
        {
            sprite.onAnimationStart();
        }

        this.draw();

        if(this._bitmapWindow !== null)
        {
            (this._bitmapWindow as unknown as IWindow).visible = true;
        }
    }

    // AS3: Animation.as::update()
    public update(deltaMs: number): void
    {
        if(!this._running) return;

        this._elapsedMs += deltaMs;

        this.draw();
    }

    // AS3: Animation.as::draw()
    private draw(): void
    {
        const canvas = this._canvas;
        const ctx = this._ctx;

        if(canvas === null || ctx === null || this._bitmapWindow === null) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let anyRunning = false;

        if(this._running)
        {
            for(const sprite of this._sprites ?? [])
            {
                if(sprite.isFinished(this._elapsedMs)) continue;

                anyRunning = true;

                const bitmap = sprite.getBitmap(this._elapsedMs);

                if(bitmap === null) continue;

                const position = sprite.getPosition(this._elapsedMs);

                ctx.drawImage(bitmap, position?.x ?? 0, position?.y ?? 0);
            }
        }

        const generation = ++this._frameGeneration;

        void createImageBitmap(canvas).then((frame) =>
        {
            if(generation !== this._frameGeneration || this._bitmapWindow === null)
            {
                frame.close();

                return;
            }

            this._bitmapWindow.bitmap = frame;
            (this._bitmapWindow as unknown as IWindow).invalidate();
        });

        this._running = anyRunning;
    }

    // AS3: Animation.as::dispose()
    public dispose(): void
    {
        this._bitmapWindow = null;

        if(this._sprites !== null)
        {
            for(const sprite of this._sprites)
            {
                sprite.dispose();
            }

            this._sprites = null;
        }

        this._canvas = null;
        this._ctx = null;
    }
}
