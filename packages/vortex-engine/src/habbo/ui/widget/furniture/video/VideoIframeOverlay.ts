import type {IWindow} from '@core/window/IWindow';

/**
 * VideoIframeOverlay
 *
 * TS-only: no AS3 counterpart. AS3 embeds a Flash `Loader`/`VimeoPlayer` display object straight
 * into the window tree via `IDisplayObjectWrapper.setDisplayObject()`; a browser iframe cannot be
 * a child of the window system's render tree, so this keeps a real `<iframe>` positioned over the
 * `display_object_wrapper` window it stands in for.
 *
 * Same technique `TextFieldController` already uses for its DOM input bridge: read the target
 * window's `getGlobalPosition()`, offset by the room canvas's `getBoundingClientRect()`, and poll
 * on `requestAnimationFrame` while the target stays visible — a per-frame poll because
 * `WE_PARENT_RESIZED`/`WE_RESIZED` are not re-cascaded to a window nested several levels below the
 * one that actually moved or resized (see `TextFieldController.startInputPositionTracking()`).
 *
 * @see packages/vortex-engine/src/core/window/components/TextFieldController.ts
 */
export class VideoIframeOverlay
{
    private _iframe: HTMLIFrameElement | null = null;
    private _target: IWindow | null = null;
    private _rafHandle: number | null = null;

    /**
     * Creates the iframe and starts tracking `target`'s on-screen rectangle. Replaces any
     * previously mounted iframe.
     */
    mount(target: IWindow, src: string, allow: string): void
    {
        this.destroy();

        if(typeof document === 'undefined') return;

        const iframe = document.createElement('iframe');

        iframe.src = src;
        iframe.allow = allow;
        iframe.allowFullscreen = true;
        iframe.style.position = 'absolute';
        iframe.style.border = 'none';
        iframe.style.zIndex = '9000';
        iframe.style.display = 'none';

        document.body.appendChild(iframe);

        this._iframe = iframe;
        this._target = target;

        this.startTracking();
    }

    get contentWindow(): Window | null
    {
        return this._iframe?.contentWindow ?? null;
    }

    get mounted(): boolean
    {
        return this._iframe !== null;
    }

    /** Replaces the loaded document without moving or resizing the overlay. */
    setSrc(src: string): void
    {
        if(this._iframe && this._iframe.src !== src) this._iframe.src = src;
    }

    /** Sends one command through the provider's postMessage protocol (YouTube/Vimeo both use it). */
    postCommand(message: unknown): void
    {
        this.contentWindow?.postMessage(JSON.stringify(message), '*');
    }

    private startTracking(): void
    {
        if(typeof requestAnimationFrame === 'undefined') return;

        const tick = (): void =>
        {
            if(!this.sync())
            {
                this._rafHandle = null;

                return;
            }

            this._rafHandle = requestAnimationFrame(tick);
        };

        this._rafHandle = requestAnimationFrame(tick);
    }

    /**
     * Repositions the iframe over the target window's current global rectangle.
     *
     * Returns false once the target is gone, so the RAF loop can stop itself.
     */
    sync(): boolean
    {
        const iframe = this._iframe;
        const target = this._target;

        if(!iframe || !target || target.disposed) return false;

        if(!this.isEffectivelyVisible(target))
        {
            iframe.style.display = 'none';

            return true;
        }

        const pos = {x: 0, y: 0};

        target.getGlobalPosition(pos);

        const canvas = typeof document !== 'undefined' ? document.querySelector('canvas') : null;
        const rect = canvas ? canvas.getBoundingClientRect() : {left: 0, top: 0};

        iframe.style.display = '';
        iframe.style.left = (rect.left + pos.x) + 'px';
        iframe.style.top = (rect.top + pos.y) + 'px';
        iframe.style.width = target.width + 'px';
        iframe.style.height = target.height + 'px';

        return true;
    }

    private isEffectivelyVisible(window: IWindow): boolean
    {
        let current: IWindow | null = window;

        while(current !== null)
        {
            if(current.disposed || !current.visible) return false;

            current = current.parent;
        }

        return true;
    }

    /** Stops tracking and removes the iframe from the page. Safe to call more than once. */
    destroy(): void
    {
        if(this._rafHandle !== null && typeof cancelAnimationFrame !== 'undefined')
        {
            cancelAnimationFrame(this._rafHandle);
        }

        this._rafHandle = null;

        if(this._iframe?.parentNode)
        {
            this._iframe.parentNode.removeChild(this._iframe);
        }

        this._iframe = null;
        this._target = null;
    }
}
