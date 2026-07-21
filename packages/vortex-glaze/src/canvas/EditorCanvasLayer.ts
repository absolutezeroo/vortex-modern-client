import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {EditorEvents, type EditorState} from '../state/EditorState';
import type {CanvasSurface} from './CanvasSurface';

interface IRect { x: number; y: number; width: number; height: number; }
interface IHandle { dir: string; l: boolean; r: boolean; t: boolean; b: boolean; }

const HANDLES: IHandle[] = [
    {dir: 'nw', l: true, r: false, t: true, b: false},
    {dir: 'n', l: false, r: false, t: true, b: false},
    {dir: 'ne', l: false, r: true, t: true, b: false},
    {dir: 'e', l: false, r: true, t: false, b: false},
    {dir: 'se', l: false, r: true, t: false, b: true},
    {dir: 's', l: false, r: false, t: false, b: true},
    {dir: 'sw', l: true, r: false, t: false, b: true},
    {dir: 'w', l: true, r: false, t: false, b: false}
];

const HANDLE_HIT = 7;

/**
 * EditorCanvasLayer — direct manipulation of the edited layout in the centre.
 *
 * Intercepts mouse events in the canvas centre (the gap between the chrome
 * panels) to select, move and resize the edited layout's windows, and paints the
 * selection outline + eight resize handles directly onto the 2D canvas after each
 * composite (no DOM). Clicks over the chrome panels pass through untouched so the
 * Habbo widget toolbar/tree/inspector keep working.
 */
export class EditorCanvasLayer
{
    private readonly _state: EditorState;
    private readonly _surface: CanvasSurface;
    private readonly _getInsets: () => { top: number; left: number; right: number; bottom: number };
    private readonly _rectScratch: IRect = {x: 0, y: 0, width: 0, height: 0};

    private _docMove: ((e: MouseEvent) => void) | null = null;
    private _docUp: (() => void) | null = null;
    private _pushedForDrag = false;

    public constructor(state: EditorState, surface: CanvasSurface, getInsets: () => { top: number; left: number; right: number; bottom: number })
    {
        this._state = state;
        this._surface = surface;
        this._getInsets = getInsets;

        const canvas = surface.canvas;

        if(canvas)
        {
            canvas.addEventListener('mousedown', this._onMouseDown, true);
            canvas.addEventListener('mousemove', this._onMouseMove);
        }

        surface.setOverlayPainter((ctx, w, h) => this.paint(ctx, w, h));
        surface.setBackgroundPainter((ctx, w, h) => this.paintBackground(ctx, w, h));
    }

    private paintBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void
    {
        const {top, left, right, bottom} = this._getInsets();
        const cw = Math.max(0, w - left - right);
        const ch = Math.max(0, h - top - bottom);

        if(cw <= 0 || ch <= 0) return;

        const bg = this._state.canvasBg;

        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, cw, ch);
        ctx.clip();

        if(bg.image)
        {
            ctx.drawImage(bg.image, left, top, cw, ch);
        }
        else if(bg.mode === 'solid')
        {
            ctx.fillStyle = this.cssColor(bg.color);
            ctx.fillRect(left, top, cw, ch);
        }
        else
        {
            this.drawChecker(ctx, left, top, cw, ch);
        }

        ctx.restore();
    }

    private drawChecker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void
    {
        const size = 12;

        ctx.fillStyle = '#f6f7fb';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#e5e7f0';

        for(let iy = 0; iy * size < h; iy++)
        {
            for(let ix = 0; ix * size < w; ix++)
            {
                if((ix + iy) % 2 === 0) ctx.fillRect(x + ix * size, y + iy * size, size, size);
            }
        }
    }

    private cssColor(argb: number): string
    {
        const a = ((argb >>> 24) & 0xff) / 255;
        const r = (argb >>> 16) & 0xff;
        const g = (argb >>> 8) & 0xff;
        const b = argb & 0xff;

        return `rgba(${r},${g},${b},${a})`;
    }

    private readonly _onMouseMove = (e: MouseEvent): void =>
    {
        const {x, y} = this._surface.toCanvasCoords(e);

        this._state.mouse.x = Math.round(x);
        this._state.mouse.y = Math.round(y);
    };

    private inCentre(x: number, y: number): boolean
    {
        const canvas = this._surface.canvas;

        if(!canvas) return false;

        const {top, left, right, bottom} = this._getInsets();

        return x >= left && x <= canvas.width - right && y >= top && y <= canvas.height - bottom;
    }

    private readonly _onMouseDown = (e: MouseEvent): void =>
    {
        if(this._state.modalOpen)
        {
            return; // a popup (e.g. gallery) is on top — let the window system handle it
        }

        const {x, y} = this._surface.toCanvasCoords(e);

        if(!this.inCentre(x, y))
        {
            return; // over the chrome — let the window system handle it
        }

        // In the editor centre: we own the interaction (select / move / resize).
        e.preventDefault();
        e.stopImmediatePropagation();

        const start = this._surface.toCanvasCoords(e);
        const handle = this.handleAt(x, y);

        if(handle)
        {
            this.beginResize(handle, start);

            return;
        }

        const hits = this.collectAtPoint(x, y);
        const top = hits[0] ?? null;

        if(top && top === this._state.selected)
        {
            this.beginMove(start);
        }
        else
        {
            this._state.select(top);

            if(top)
            {
                this.beginMove(start);
            }
        }
    };

    // ---- Interaction -------------------------------------------------------

    private beginMove(origin: { x: number; y: number }): void
    {
        const win = this._state.selected as unknown as WindowController | null;

        if(!win || win.disposed) return;

        const sx = win.x;
        const sy = win.y;

        this.startDrag(origin, (dx, dy) =>
        {
            win.rectangle = {
                x: this._state.snapValue(sx + dx),
                y: this._state.snapValue(sy + dy),
                width: win.width,
                height: win.height
            };
        });
    }

    private beginResize(handle: IHandle, origin: { x: number; y: number }): void
    {
        const win = this._state.selected as unknown as WindowController | null;

        if(!win || win.disposed) return;

        const sx = win.x;
        const sy = win.y;
        const sw = win.width;
        const sh = win.height;

        this.startDrag(origin, (dx, dy) =>
        {
            let x = sx;
            let y = sy;
            let w = sw;
            let h = sh;

            if(handle.l) { x = sx + dx; w = sw - dx; }
            if(handle.r) { w = sw + dx; }
            if(handle.t) { y = sy + dy; h = sh - dy; }
            if(handle.b) { h = sh + dy; }

            win.rectangle = {
                x: this._state.snapValue(x),
                y: this._state.snapValue(y),
                width: Math.max(1, this._state.snapValue(w)),
                height: Math.max(1, this._state.snapValue(h))
            };
        });
    }

    private startDrag(origin: { x: number; y: number }, apply: (dx: number, dy: number) => void): void
    {
        this._pushedForDrag = false;

        this._docMove = (ev: MouseEvent): void =>
        {
            const now = this._surface.toCanvasCoords(ev);
            const dx = now.x - origin.x;
            const dy = now.y - origin.y;

            // Snapshot once, on the first real movement — a click that selects
            // without dragging must not create an undo step.
            if(!this._pushedForDrag && (dx !== 0 || dy !== 0))
            {
                this._pushedForDrag = true;
                this._state.pushHistory();
            }

            apply(dx, dy);
            this._state.events.emit(EditorEvents.GEOMETRY_CHANGED);
        };

        this._docUp = (): void =>
        {
            document.removeEventListener('mousemove', this._docMove!);
            document.removeEventListener('mouseup', this._docUp!);
            this._docMove = null;
            this._docUp = null;
            this._pushedForDrag = false;
            this._state.notifyGeometryChanged();
        };

        document.addEventListener('mousemove', this._docMove);
        document.addEventListener('mouseup', this._docUp);
    }

    private collectAtPoint(x: number, y: number): IWindow[]
    {
        const root = this._state.rootWindow;

        if(!root || root.disposed) return [];

        const hits: Array<{ window: IWindow; depth: number; order: number }> = [];
        let order = 0;

        const visit = (window: IWindow, depth: number): void =>
        {
            if(window.disposed || !window.visible) return;

            const r = this._rectScratch;

            window.getGlobalRectangle(r);

            if(x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height)
            {
                hits.push({window, depth, order: order++});
            }

            const container = window as unknown as { numChildren?: number; getChildAt?: (i: number) => IWindow | null };

            if(typeof container.numChildren === 'number' && typeof container.getChildAt === 'function')
            {
                for(let i = container.numChildren - 1; i >= 0; i--)
                {
                    const child = container.getChildAt(i);

                    if(child) visit(child, depth + 1);
                }
            }
        };

        visit(root, 0);
        hits.sort((a, b) => (b.depth - a.depth) || (b.order - a.order));

        return hits.map((h) => h.window);
    }

    private handleAt(x: number, y: number): IHandle | null
    {
        const selected = this._state.selected;

        if(!selected || selected.disposed) return null;

        const r = this._rectScratch;

        selected.getGlobalRectangle(r);

        for(const spec of HANDLES)
        {
            const hx = spec.l ? r.x : (spec.r ? r.x + r.width : r.x + r.width / 2);
            const hy = spec.t ? r.y : (spec.b ? r.y + r.height : r.y + r.height / 2);

            if(Math.abs(x - hx) <= HANDLE_HIT && Math.abs(y - hy) <= HANDLE_HIT)
            {
                return spec;
            }
        }

        return null;
    }

    // ---- Overlay paint -----------------------------------------------------

    private paint(ctx: CanvasRenderingContext2D, w: number, h: number): void
    {
        const {top, left, right, bottom} = this._getInsets();

        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, Math.max(0, w - left - right), Math.max(0, h - top - bottom));
        ctx.clip();

        if(this._state.debugRects)
        {
            this.paintDebugRects(ctx);
        }

        const selected = this._state.selected;

        if(selected && !selected.disposed)
        {
            const r = this._rectScratch;

            selected.getGlobalRectangle(r);

            ctx.strokeStyle = '#12b5c9';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.width - 1, r.height - 1);

            if(this._state.showScaler)
            {
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#6c5ce7';
                ctx.lineWidth = 1.5;

                for(const spec of HANDLES)
                {
                    const hx = spec.l ? r.x : (spec.r ? r.x + r.width : r.x + r.width / 2);
                    const hy = spec.t ? r.y : (spec.b ? r.y + r.height : r.y + r.height / 2);

                    ctx.beginPath();
                    ctx.rect(hx - 4, hy - 4, 8, 8);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }

        ctx.restore();
    }

    /** Outlines every window in the edited layout (Glaze's "Debug Rects"). */
    private paintDebugRects(ctx: CanvasRenderingContext2D): void
    {
        const root = this._state.rootWindow;

        if(!root || root.disposed) return;

        ctx.strokeStyle = 'rgba(233,30,99,0.5)';
        ctx.lineWidth = 1;

        const r = this._rectScratch;
        const visit = (win: IWindow): void =>
        {
            if(win.disposed || !win.visible) return;

            win.getGlobalRectangle(r);
            ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.width - 1, r.height - 1);

            const c = win as unknown as { numChildren?: number; getChildAt?: (i: number) => IWindow | null };

            if(typeof c.numChildren === 'number' && typeof c.getChildAt === 'function')
            {
                for(let i = 0; i < c.numChildren; i++)
                {
                    const child = c.getChildAt(i);

                    if(child) visit(child);
                }
            }
        };

        visit(root);
    }

    public dispose(): void
    {
        const canvas = this._surface.canvas;

        if(canvas)
        {
            canvas.removeEventListener('mousedown', this._onMouseDown, true);
            canvas.removeEventListener('mousemove', this._onMouseMove);
        }

        if(this._docMove) document.removeEventListener('mousemove', this._docMove);
        if(this._docUp) document.removeEventListener('mouseup', this._docUp);
        this._surface.setOverlayPainter(null);
        this._surface.setBackgroundPainter(null);
    }
}
