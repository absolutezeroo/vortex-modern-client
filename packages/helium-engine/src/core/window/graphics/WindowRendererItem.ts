import type {ISkinContainer} from './ISkinContainer';
import type {ISkinRenderer} from './renderer/ISkinRenderer';
import type {IWindow} from '../IWindow';

/**
 * Render queue item holding rendering state for a single window.
 *
 * Manages a per-window OffscreenCanvas buffer. The skin renderer draws
 * into this buffer, and the client reads it via fetchDrawBuffer().
 *
 * AS3 equivalent used BitmapData (TrackedBitmapData); we use OffscreenCanvas.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/WindowRendererItem.as
 */
export class WindowRendererItem
{
    protected static readonly RENDER_TYPE_NULL: number = 0;
    protected static readonly RENDER_TYPE_SKIN: number = 1;
    protected static readonly RENDER_TYPE_FILL: number = 2;

    private _skinContainer: ISkinContainer;
    private _refresh: boolean = false;
    private _previousState: number = 0xFFFFFFFF;
    private _currentState: number = 0;
    private _bufferCtx: OffscreenCanvasRenderingContext2D | null = null;

    constructor(skinContainer: ISkinContainer)
    {
        this._skinContainer = skinContainer;
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    private _buffer: OffscreenCanvas | null = null;

    /**
	 * Returns the cached draw buffer for this window.
	 *
	 * Equivalent of AS3 `WindowRendererItem.buffer` (BitmapData getter).
	 */
    public get buffer(): OffscreenCanvas | null
    {
        return this._buffer;
    }

    /**
	 * Tests whether the window's drawable state has changed.
	 *
	 * @param window - The window to test
	 * @returns True if the state changed since last render
	 */
    public testForStateChange(window: IWindow): boolean
    {
        return this._skinContainer.getTheActualState(window.type, window.style, window.state) !== this._previousState;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/graphics/WindowRendererItem.as::needsRedraw()
    public needsRedraw(window: IWindow): boolean
    {
        return this._refresh || this.testForStateChange(window);
    }

    /**
	 * Marks this item as needing re-render for the given invalidation type.
	 *
	 * Port of AS3 WindowRendererItem.invalidate().
	 *
	 * @param window - The window being invalidated
	 * @param flags - The invalidation flags
	 * @returns True if the invalidation caused a change
	 */
    public invalidate(window: IWindow, flags: number): boolean
    {
        let changed = false;

        switch(flags)
        {
            case 1:
            case 2:
                this._refresh = true;
                changed = true;
                break;
            case 4:
                changed = true;
                break;
            case 8:
                this._currentState = this._skinContainer.getTheActualState(window.type, window.style, window.state);

                if(this._currentState !== this._previousState)
                {
                    this._refresh = true;
                    changed = true;
                }
                break;
            case 16:
                // AS3 only forces a full refresh here when the window shares its
                // parent's graphic context (no independent context to update blend
                // on); otherwise it just sets the context's `blend` and returns
                // false - no redraw needed. WindowComposite.ts reads window.blend
                // fresh on every composite pass for every window regardless, so we
                // never need to refresh the cached skin buffer for a blend change.
                break;
            case 32:
                changed = true;
                break;
        }

        return changed;
    }

    /**
	 * Renders the skin for the given window into its buffer.
	 *
	 * Port of AS3 WindowRendererItem.render(). The AS3 version takes
	 * drawLocation, clipRegion, visibleRegion, targetBitmapData and
	 * composes into a parent buffer. In our architecture, each window
	 * renders into its own OffscreenCanvas; the client handles compositing.
	 *
	 * @param window - The window to render
	 */
    public render(window: IWindow): void
    {
        // Determine render type
        let renderType = window.background ? WindowRendererItem.RENDER_TYPE_FILL : WindowRendererItem.RENDER_TYPE_NULL;

        const renderer: ISkinRenderer | null = this._skinContainer.getSkinRendererByTypeAndStyle(window.type, window.style);

        if(renderer && renderer.isStateDrawable(this._currentState))
        {
            renderType = WindowRendererItem.RENDER_TYPE_SKIN;
        }

        const renderWidth = Math.max(window.renderingWidth, 1);
        const renderHeight = Math.max(window.renderingHeight, 1);

        if(renderType !== WindowRendererItem.RENDER_TYPE_NULL)
        {
            // Create or resize buffer
            if(!this._buffer || this._buffer.width !== renderWidth || this._buffer.height !== renderHeight)
            {
                this._buffer = new OffscreenCanvas(renderWidth, renderHeight);
                this._bufferCtx = this._buffer.getContext('2d');

                if(this._bufferCtx)
                {
                    this._bufferCtx.imageSmoothingEnabled = false;
                }

                this._refresh = true;
            }

            if(!this._bufferCtx) return;

            if(renderType === WindowRendererItem.RENDER_TYPE_SKIN)
            {
                if(this._refresh)
                {
                    this._refresh = false;

                    // Clear buffer and fill with window color (AS3: fillRect with window.color)
                    this._bufferCtx.clearRect(0, 0, renderWidth, renderHeight);

                    const color = window.color;
                    const a = ((color >> 24) & 0xFF) / 255;
                    const r = (color >> 16) & 0xFF;
                    const g = (color >> 8) & 0xFF;
                    const b = color & 0xFF;

                    this._bufferCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
                    this._bufferCtx.fillRect(0, 0, renderWidth, renderHeight);

                    // Draw the skin
                    renderer!.draw(
                        window,
                        this._bufferCtx,
                        {x: 0, y: 0, width: renderWidth, height: renderHeight},
                        this._currentState,
                        false
                    );
                }
            }
            else if(renderType === WindowRendererItem.RENDER_TYPE_FILL)
            {
                // Fill with window color
                this._bufferCtx.clearRect(0, 0, renderWidth, renderHeight);

                const color = window.color;
                const a = ((color >> 24) & 0xFF) / 255;
                const r = (color >> 16) & 0xFF;
                const g = (color >> 8) & 0xFF;
                const b = color & 0xFF;

                this._bufferCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
                this._bufferCtx.fillRect(0, 0, renderWidth, renderHeight);
            }
        }
        else
        {
            // NULL render type — clear any existing buffer
            if(this._refresh)
            {
                this._refresh = false;

                if(this._buffer && this._bufferCtx)
                {
                    this._bufferCtx.clearRect(0, 0, this._buffer.width, this._buffer.height);
                }
            }
        }

        this._previousState = this._currentState;
    }

    /**
	 * Purges cached data, disposing the buffer.
	 */
    public purge(): void
    {
        this._buffer = null;
        this._bufferCtx = null;
        this._refresh = true;
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
            this._buffer = null;
            this._bufferCtx = null;
            this._skinContainer = null!;
        }
    }
}
