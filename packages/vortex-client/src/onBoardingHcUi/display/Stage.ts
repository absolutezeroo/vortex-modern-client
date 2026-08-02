/**
 * Stage of the login display list.
 *
 * TS-only: stand-in for `flash.display.Stage`. It owns the canvas the login flow paints on, runs
 * the frame loop, routes pointer and keyboard events into the display list, and reports
 * `stageWidth`/`stageHeight` — which every login view lays itself out against
 * (`LoginFlow.layoutMainElements()`, `Background.resize()`, `Dimmer.onStageResize()`).
 *
 * Text entry is the one place Flash has no browser equivalent. AS3 sets `stage.focus = _field` on
 * a real editable `TextField`; here the glyphs are painted on the canvas and a transparent
 * `<input>` is parked over the focused field to contribute the caret, selection, IME and clipboard
 * — the same split the engine's `TextFieldController` already uses for window text fields.
 */
import {Logger} from '@core/utils/Logger';
import {DisplayEvent, DisplayKeyboardEvent, DisplayMouseEvent, DisplayObject} from './DisplayObject';
import {DisplayObjectContainer} from './DisplayObjectContainer';
import {Rectangle} from './Geom';
import {TextField} from './TextField';

const log = Logger.getLogger('client.onBoardingHcUi.Stage');

export class Stage extends DisplayObjectContainer
{
    private readonly _canvas: HTMLCanvasElement;
    private readonly _context: CanvasRenderingContext2D;
    private readonly _input: HTMLInputElement;
    private readonly _form: HTMLFormElement;
    private _stageWidth: number = 0;
    private _stageHeight: number = 0;
    private _frameHandle: number = 0;
    private _hovered: DisplayObject | null = null;
    private _focus: TextField | null = null;
    private _disposed: boolean = false;

    /** TEMPORARY PROBE — hit tests run between two slow-frame reports; mousemove drives them. */
    private _hitTestsSinceReport: number = 0;

    constructor(container: HTMLElement)
    {
        super();

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'vortex-login-canvas';
        this._canvas.style.position = 'absolute';
        this._canvas.style.top = '0';
        this._canvas.style.left = '0';
        this._canvas.style.zIndex = '10000';
        this._canvas.style.imageRendering = 'pixelated';
        container.appendChild(this._canvas);

        const context = this._canvas.getContext('2d');

        if(!context)
        {
            throw new Error('[Stage] Failed to acquire a 2D context');
        }

        this._context = context;
        this._input = Stage.createInputElement();
        this._form = Stage.createInputForm(this._input);
        container.appendChild(this._form);

        this._stage = this;

        this.resize();

        window.addEventListener('resize', this._onWindowResize);
        this._canvas.addEventListener('mousedown', this._onMouseDown);
        this._canvas.addEventListener('mouseup', this._onMouseUp);
        this._canvas.addEventListener('mousemove', this._onMouseMove);

        // The overlay covers part of the canvas, so the same three handlers run on it as well —
        // otherwise half a gesture (the press routed, the release lost) reaches the display list and
        // no `click` is ever dispatched. They no-op on the field the overlay is actually serving.
        this._input.addEventListener('mousedown', this._onMouseDown);
        this._input.addEventListener('mouseup', this._onMouseUp);
        this._input.addEventListener('mousemove', this._onMouseMove);
        this._input.addEventListener('input', this._onInputChanged);
        this._input.addEventListener('keydown', this._onInputKeyDown);

        this._frameHandle = window.requestAnimationFrame(this._onFrame);
    }

    /** AS3: `get stageWidth()`. */
    public get stageWidth(): number
    {
        return this._stageWidth;
    }

    /** AS3: `get stageHeight()`. */
    public get stageHeight(): number
    {
        return this._stageHeight;
    }

    /** TS-only: the canvas this stage paints on. */
    public get canvas(): HTMLCanvasElement
    {
        return this._canvas;
    }

    /**
     * AS3: `set focus()` — `InputField.onInputBackgroundClicked()` assigns the field it wants
     * typed into.
     */
    public get focus(): TextField | null
    {
        return this._focus;
    }

    public set focus(field: TextField | null)
    {
        if(this._focus === field)
        {
            // Re-assigning the field already focused still has to put the caret back — the element
            // can have lost it without the stage hearing about it (a click outside the canvas, a
            // tab switch), and the widgets assign `stage.focus` expecting Flash's "focus it now".
            if(field && document.activeElement !== this._input)
            {
                this._input.focus();
            }

            return;
        }

        this._focus = field;

        if(!field)
        {
            this._input.blur();
            this._input.style.display = 'none';

            return;
        }

        this._input.type = field.displayAsPassword ? 'password' : 'text';
        this._input.autocomplete = field.autoComplete;
        this._input.name = field.displayAsPassword ? 'password' : 'username';
        this._input.value = field.text;
        this._input.maxLength = field.maxChars > 0 ? field.maxChars : 524288;
        this._input.style.display = 'block';
        this.positionInputElement();
        this._input.focus();
    }

    /**
     * TS-only: this stage never scales, so a display object's stage position is the sum of its
     * ancestors' offsets. Needed to park the `<input>` over the focused field.
     */
    public getStagePosition(object: DisplayObject): Rectangle
    {
        let x = 0;
        let y = 0;
        let node: DisplayObject | null = object;

        while(node && node !== this)
        {
            x += node.x;
            y += node.y;
            node = node.parent;
        }

        return new Rectangle(x, y, object.width, object.height);
    }

    /** TS-only: matches the canvas to the viewport and tells the display list. */
    public resize(): void
    {
        this._stageWidth = window.innerWidth;
        this._stageHeight = window.innerHeight;
        this._canvas.width = this._stageWidth;
        this._canvas.height = this._stageHeight;
        this._canvas.style.width = `${this._stageWidth}px`;
        this._canvas.style.height = `${this._stageHeight}px`;

        this.dispatchEvent(new DisplayEvent('resize'));
    }

    public override getContentBounds(): Rectangle
    {
        return new Rectangle(0, 0, this._stageWidth, this._stageHeight);
    }

    /** TS-only: one frame — `enterFrame` to whoever listens, then a full repaint. */
    private _onFrame = (): void =>
    {
        if(this._disposed) return;

        this._frameHandle = window.requestAnimationFrame(this._onFrame);

        // TEMPORARY PROBE — remove once the AvatarView slowness is understood. A frame this long is
        // not jank, it is a stall, and the breakdown says which half owns it: the enterFrame walk
        // (per-object listeners) or the repaint (the display list itself).
        const probeStart = performance.now();

        this.dispatchEnterFrame(this);

        if(this._focus)
        {
            // A view is dismissed by hiding it, not by tearing it down (`startRoomPicking()` sets
            // `_nameArea.visible = false`, `LoginFlow` hides the screen it leaves), and nothing in
            // that path clears the focus. The `<input>` would then stay parked over a field nobody
            // can see any more — an invisible band, above the canvas, eating every click that lands
            // in it. That is the same defect whether the band sits over another input or over the
            // room picker's thumbnails.
            if(!this.isFieldLive(this._focus))
            {
                this.focus = null;
            }
            else
            {
                this.positionInputElement();
            }
        }

        const probeAfterEnterFrame = performance.now();

        this._context.setTransform(1, 0, 0, 1, 0, 0);
        this._context.clearRect(0, 0, this._stageWidth, this._stageHeight);
        this.render(this._context);

        const probeEnd = performance.now();

        if((probeEnd - probeStart) > 100)
        {
            log.warn(
                `Slow frame: ${Math.round(probeEnd - probeStart)}ms `
                + `(enterFrame ${Math.round(probeAfterEnterFrame - probeStart)}ms, `
                + `render ${Math.round(probeEnd - probeAfterEnterFrame)}ms, `
                + `${Stage.countNodes(this)} nodes, ${this._hitTestsSinceReport} hit tests since last report)`
            );
            this._hitTestsSinceReport = 0;
        }
    };

    /** TEMPORARY PROBE — display-list size, to tell a heavy tree from a heavy node. */
    private static countNodes(node: DisplayObject): number
    {
        if(!(node instanceof DisplayObjectContainer)) return 1;

        let total = 1;

        for(let i = 0; i < node.numChildren; i++)
        {
            total += Stage.countNodes(node.getChildAt(i));
        }

        return total;
    }

    /**
     * TS-only: Flash broadcasts `enterFrame` to every display object; the login tree is a few
     * dozen nodes, so a walk per frame is cheaper than maintaining a subscription registry.
     */
    private dispatchEnterFrame(node: DisplayObject): void
    {
        if(node.hasEventListener('enterFrame'))
        {
            const event = new DisplayEvent('enterFrame');

            event.target = node;
            event.currentTarget = node;
            DisplayObject.prototype.dispatchEvent.call(node, event);
        }

        if(!(node instanceof DisplayObjectContainer)) return;

        for(let i = 0; i < node.numChildren; i++)
        {
            this.dispatchEnterFrame(node.getChildAt(i));
        }
    }

    /**
     * TS-only: whether the focused field is still a visible part of this stage's display list.
     *
     * Flash drops the focus by itself when a focused field is hidden or removed; nothing does that
     * here, so the frame loop checks it.
     */
    private isFieldLive(field: TextField): boolean
    {
        let node: DisplayObject | null = field;

        while(node && node !== this)
        {
            if(!node.visible) return false;

            node = node.parent;
        }

        return node === this;
    }

    /** TS-only: pointer position in stage coordinates. */
    private toStagePoint(event: MouseEvent): {x: number; y: number}
    {
        const bounds = this._canvas.getBoundingClientRect();

        return {x: event.clientX - bounds.left, y: event.clientY - bounds.top};
    }

    private _onWindowResize = (): void =>
    {
        this.resize();
    };

    private _onMouseDown = (event: MouseEvent): void =>
    {
        const point = this.toStagePoint(event);
        const target = this.hitTest(point.x, point.y);

        // The overlay is a real element ON TOP of the canvas, so it takes presses the display list
        // was meant to get. Only a press on the field it is actually serving belongs to the browser
        // — that is what places the caret. Anything else is routed through the display list here,
        // so the overlay can never swallow a click even if it is mispositioned or stale.
        if(event.target === this._input && target === this._focus) return;

        // The default action of a mousedown moves the document focus to whatever is under the
        // pointer — here the canvas — and it runs AFTER this handler, so it took the caret straight
        // back off the `<input>` this handler had just focused. That is why an input needed two
        // clicks: the first only parked the element (which then covers the field, so the second
        // click landed on the `<input>` itself and the browser focused it natively).
        event.preventDefault();

        // Flash focuses an editable TextField on mouse down by itself, so AS3 only assigns
        // `stage.focus` from the sprite BEHIND the field (`InputField.onInputBackgroundClicked()`).
        // Nothing here does that natively, and `InputField.onInputClicked()` — the one handler that
        // did — removes itself after the first click, so a second click on the same box focused
        // nothing: the field is a SIBLING of the background sprite, so the click never bubbles to
        // the background's listener either.
        this.focus = target instanceof TextField && target.isInput ? target : null;

        if(!target) return;

        target.dispatchEvent(new DisplayMouseEvent('mouseDown', point.x, point.y));
    };

    private _onMouseUp = (event: MouseEvent): void =>
    {
        const point = this.toStagePoint(event);
        const target = this.hitTest(point.x, point.y);

        // AS3 buttons listen for mouseUp on themselves AND on the stage (to cancel a press that
        // ends elsewhere), so the stage dispatch has to happen either way.
        if(target)
        {
            const up = new DisplayMouseEvent('mouseUp', point.x, point.y);

            target.dispatchEvent(up);

            if(!up.stopped)
            {
                target.dispatchEvent(new DisplayMouseEvent('click', point.x, point.y));
            }
        }

        const stageUp = new DisplayMouseEvent('mouseUp', point.x, point.y, false);

        stageUp.target = target ?? this;
        DisplayObject.prototype.dispatchEvent.call(this, stageUp);
    };

    private _onMouseMove = (event: MouseEvent): void =>
    {
        const point = this.toStagePoint(event);

        // TEMPORARY PROBE — a hit test walks the whole tree and measures every node it touches.
        this._hitTestsSinceReport++;

        const target = this.hitTest(point.x, point.y);

        if(target === this._hovered)
        {
            this.updateCursor(target);

            return;
        }

        if(this._hovered)
        {
            this._hovered.dispatchEvent(new DisplayMouseEvent('mouseOut', point.x, point.y));
        }

        this._hovered = target;

        if(target)
        {
            target.dispatchEvent(new DisplayMouseEvent('mouseOver', point.x, point.y));
        }

        this.updateCursor(target);
    };

    /** TS-only: Flash's `buttonMode` cursor. */
    private updateCursor(target: DisplayObject | null): void
    {
        let node: DisplayObject | null = target;

        while(node)
        {
            if(node instanceof DisplayObjectContainer && node.buttonMode)
            {
                this._canvas.style.cursor = 'pointer';

                return;
            }

            node = node.parent;
        }

        this._canvas.style.cursor = 'default';
    }

    private _onInputChanged = (): void =>
    {
        if(!this._focus) return;

        this._focus.text = this._input.value;
        this._focus.dispatchEvent(new DisplayEvent('change', true));
    };

    /**
     * TS-only: forwards the browser's keydown to the focused field as AS3's `KeyboardEvent`.
     *
     * `key` and `keyCode` are read defensively, as `TextFieldController.resolveCharCode()` already
     * does in the engine: a 'keydown' here is not necessarily one the browser built. Password
     * managers and other extensions dispatch synthetic events on a login field — some from a bare
     * `Event`, carrying neither property — and `event.key.length` threw on those.
     */
    private _onInputKeyDown = (event: KeyboardEvent): void =>
    {
        if(!this._focus) return;

        const key = event.key ?? '';
        const charCode = key.length === 1 ? key.charCodeAt(0) : (key === 'Enter' ? 13 : 0);

        this._focus.dispatchEvent(new DisplayKeyboardEvent('keyDown', charCode, event.keyCode ?? 0));
    };

    /** TS-only: keeps the `<input>` over the focused field. */
    private positionInputElement(): void
    {
        const field = this._focus;

        if(!field) return;

        const position = this.getStagePosition(field);
        const red = (field.textColor >> 16) & 0xFF;
        const green = (field.textColor >> 8) & 0xFF;
        const blue = field.textColor & 0xFF;

        this._input.style.left = `${position.x}px`;
        this._input.style.top = `${position.y}px`;
        this._input.style.width = `${Math.max(1, position.width)}px`;
        this._input.style.height = `${Math.max(1, field.lineHeight)}px`;
        this._input.style.font = field.cssFont;
        this._input.style.caretColor = `rgb(${red}, ${green}, ${blue})`;
    }

    /**
     * TS-only: the shared editing element — visible (so the browser draws its caret) but with
     * transparent text, since the canvas paints the glyphs.
     */
    private static createInputElement(): HTMLInputElement
    {
        const input = document.createElement('input');

        // Addressable from the console: it is invisible by design, so `#vortex-login-input` is the
        // only way to see where it actually sits when a click goes missing.
        input.id = 'vortex-login-input';
        input.type = 'text';
        // Overwritten from the focused field's own hint (`set focus()`); this is only what the
        // element carries before anything has been focused.
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.style.position = 'absolute';
        input.style.display = 'none';
        input.style.zIndex = '10001';
        input.style.padding = '0';
        input.style.margin = '0';
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.background = 'transparent';
        input.style.color = 'transparent';
        input.style.boxSizing = 'border-box';

        return input;
    }

    /**
     * TS-only: the `<form>` the editing element lives in.
     *
     * Chrome logs "Password field is not contained in a form" for a bare `input[type=password]`, and
     * the shared element becomes one whenever an `InputField` was built with `isPassword`. The form
     * is `display: contents`, so it adds no box: the input keeps positioning against the same
     * containing block `positionInputElement()` computes stage coordinates for.
     *
     * Submission is cancelled — a form with a single text field submits implicitly on Enter, which
     * would reload the page out from under the login flow. Enter has a job already: `onInputKeyDown`
     * forwards it to the focused field, which is how `SsoTokenView` accepts a pasted ticket.
     */
    private static createInputForm(input: HTMLInputElement): HTMLFormElement
    {
        const form = document.createElement('form');

        form.style.display = 'contents';
        form.addEventListener('submit', event => event.preventDefault());
        form.appendChild(input);

        return form;
    }

    /** TS-only: tears the stage down — frame loop, listeners and DOM nodes. */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._frameHandle)
        {
            window.cancelAnimationFrame(this._frameHandle);
            this._frameHandle = 0;
        }

        window.removeEventListener('resize', this._onWindowResize);
        this._canvas.removeEventListener('mousedown', this._onMouseDown);
        this._canvas.removeEventListener('mouseup', this._onMouseUp);
        this._canvas.removeEventListener('mousemove', this._onMouseMove);
        this._input.removeEventListener('mousedown', this._onMouseDown);
        this._input.removeEventListener('mouseup', this._onMouseUp);
        this._input.removeEventListener('mousemove', this._onMouseMove);
        this._input.removeEventListener('input', this._onInputChanged);
        this._input.removeEventListener('keydown', this._onInputKeyDown);

        while(this.numChildren > 0)
        {
            this.removeChildAt(0);
        }

        this._input.remove();
        this._form.remove();
        this._canvas.remove();

        log.debug('Login stage disposed');
    }
}
