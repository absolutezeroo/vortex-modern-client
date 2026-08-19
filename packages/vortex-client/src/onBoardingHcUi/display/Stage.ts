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
    /** TS-only: the glyph a browser substitutes for every character of an `input[type=password]`. */
    private static readonly PASSWORD_BULLET: string = '•';

    /** TS-only: id of the one `<style>` the stage installs, so a second stage reuses it. */
    private static readonly STYLE_ELEMENT_ID: string = 'vortex-login-input-style';

    /** TS-only: class every overlay carries — the one `<style>` this stage installs targets it. */
    private static readonly INPUT_CLASS: string = 'vortex-login-input';

    private readonly _canvas: HTMLCanvasElement;
    private readonly _context: CanvasRenderingContext2D;
    private readonly _form: HTMLFormElement;

    /**
     * TS-only: one `<input>` per live editable field, not one element shared by whichever field
     * happens to hold the focus.
     *
     * A password manager fills a *pair*. It looks for a login field and a password field present in
     * the same form at the same time and fills both from one credential, so a single element that
     * changes `type` on focus is never a pair: at the moment the e-mail box is clicked the page
     * holds no password field at all, so nothing is offered, and picking a saved account fills the
     * one element with the login and has nowhere to put the password. It is the same reason the
     * browser never proposed to remember anything — the two values never coexisted in the DOM.
     */
    private readonly _elements: Map<TextField, HTMLInputElement> = new Map();

    /** TS-only: the reverse of `_elements` — an event carries the element, the handlers want the field. */
    private readonly _fields: Map<HTMLInputElement, TextField> = new Map();

    /** TS-only: geometry last written to each overlay, so a frame that changed nothing writes nothing. */
    private readonly _geometry: Map<HTMLInputElement, string> = new Map();

    /** TS-only: suffix of the next element id — the ids exist only to be addressable from the console. */
    private _elementSeq: number = 0;
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
        Stage.installInputStyles();
        this._form = Stage.createInputForm();
        container.appendChild(this._form);

        this._stage = this;

        this.resize();

        window.addEventListener('resize', this._onWindowResize);
        this._canvas.addEventListener('mousedown', this._onMouseDown);
        this._canvas.addEventListener('mouseup', this._onMouseUp);
        this._canvas.addEventListener('mousemove', this._onMouseMove);

        // The overlays cover part of the canvas, so the same three handlers run on them as well —
        // otherwise half a gesture (the press routed, the release lost) reaches the display list and
        // no `click` is ever dispatched. They no-op on the field the overlay under the pointer is
        // actually serving. The listeners go on the form rather than on each element: it is the
        // parent of every one of them, and all five of these events bubble.
        this._form.addEventListener('mousedown', this._onMouseDown);
        this._form.addEventListener('mouseup', this._onMouseUp);
        this._form.addEventListener('mousemove', this._onMouseMove);
        this._form.addEventListener('input', this._onInputChanged);
        this._form.addEventListener('keydown', this._onInputKeyDown);

        // `focus` does not bubble, `focusin` does. The document focus moves without the stage being
        // told — Tab between the two boxes, and the password manager focusing the box it has just
        // filled — and the display list has to follow it, or the canvas paints a caret on one field
        // while the keystrokes reach another.
        this._form.addEventListener('focusin', this._onInputFocusIn);

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
        // A widget can assign the focus in the very frame its field is built, before the sync walk
        // has seen it — `InputField.onInputBackgroundClicked()` does exactly that.
        if(field && !this._elements.has(field))
        {
            this.syncInputElements();
        }

        const element = field ? this._elements.get(field) ?? null : null;

        if(this._focus === field)
        {
            // Re-assigning the field already focused still has to put the caret back — the element
            // can have lost it without the stage hearing about it (a click outside the canvas, a
            // tab switch), and the widgets assign `stage.focus` expecting Flash's "focus it now".
            if(element && document.activeElement !== element)
            {
                element.focus();
            }

            return;
        }

        this._focus = field;

        if(!element)
        {
            const active = document.activeElement;

            // Only ever blur one of our own overlays: by now the document focus can be anywhere.
            if(active instanceof HTMLInputElement && this._fields.has(active))
            {
                active.blur();
            }

            return;
        }

        element.focus();
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

        // A view is dismissed by hiding it, not by tearing it down (`startRoomPicking()` sets
        // `_nameArea.visible = false`, `LoginFlow.hideViews()` removes the screen it leaves), and
        // nothing in that path touches the overlays. One would then stay parked over a field nobody
        // can see any more — an invisible band, above the canvas, eating every click that lands in
        // it. That is the same defect whether the band sits over another input or over the room
        // picker's thumbnails.
        this.syncInputElements();

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
     * TS-only: matches the set of overlays to the editable fields currently on the stage.
     *
     * Flash drops the focus by itself when a focused field is hidden or removed, and needs no
     * element in the first place; here both are this walk's job. It runs every frame — the login
     * tree is a few dozen nodes — and it is also what lets the browser see the login form appear
     * and disappear: a password manager offers to remember a credential when a form holding a
     * filled password leaves the page, which is precisely what `LoginFlow.hideViews()` does once
     * `initLogin()` has been called.
     */
    private syncInputElements(): void
    {
        const live: TextField[] = [];

        Stage.collectInputFields(this, live);

        for(const [field, element] of this._elements)
        {
            if(live.indexOf(field) >= 0) continue;

            this.destroyInputElement(field, element);
        }

        for(let i = 0; i < live.length; i++)
        {
            const field = live[i];
            const element = this._elements.get(field) ?? this.createInputElementFor(field, live, i);

            Stage.configureInputElement(field, element);
            this.positionInputElement(field, element);
        }

        if(this._focus && !this._elements.has(this._focus))
        {
            this.focus = null;
        }
    }

    /**
     * TS-only: the editable fields under `node`, in tree order, skipping anything hidden.
     *
     * Tree order is what the overlays' DOM order is built from, and a password manager reads it:
     * the login box has to come before the password box for the pair to be recognised as one.
     */
    private static collectInputFields(node: DisplayObject, out: TextField[]): void
    {
        if(!node.visible) return;

        if(node instanceof TextField)
        {
            if(node.isInput) out.push(node);

            return;
        }

        if(!(node instanceof DisplayObjectContainer)) return;

        for(let i = 0; i < node.numChildren; i++)
        {
            Stage.collectInputFields(node.getChildAt(i), out);
        }
    }

    /**
     * TS-only: builds the overlay for one field and inserts it in tree order.
     *
     * The insertion point matters as much as the element: inserting before the next field that
     * already has one keeps the DOM in the order the walk found them, and reordering afterwards is
     * not an option — moving an `<input>` in the DOM blurs it.
     */
    private createInputElementFor(field: TextField, live: TextField[], index: number): HTMLInputElement
    {
        const element = document.createElement('input');

        this._elementSeq++;

        // Addressable from the console: they are invisible by design, so `.vortex-login-input` is
        // the only way to see where one actually sits when a click goes missing.
        element.id = `${Stage.INPUT_CLASS}-${this._elementSeq}`;
        element.className = Stage.INPUT_CLASS;
        element.spellcheck = false;
        element.style.position = 'absolute';
        element.style.zIndex = '10001';
        element.style.padding = '0';
        element.style.margin = '0';
        element.style.border = 'none';
        element.style.outline = 'none';
        element.style.background = 'transparent';
        element.style.color = 'transparent';
        element.style.boxSizing = 'border-box';

        let before: HTMLInputElement | null = null;

        for(let i = index + 1; i < live.length; i++)
        {
            const next = this._elements.get(live[i]) ?? null;

            if(next)
            {
                before = next;

                break;
            }
        }

        this._form.insertBefore(element, before);
        this._elements.set(field, element);
        this._fields.set(element, field);

        return element;
    }

    /**
     * TS-only: keeps an overlay's browser-facing identity in step with its field.
     *
     * The hints are assigned after the field itself is built — `InputField.init()` for the type,
     * then the view for the boxes that are neither a login nor a current password — so an element
     * cannot be configured once at creation and left alone. Every write is guarded: this runs on
     * each field, every frame.
     */
    private static configureInputElement(field: TextField, element: HTMLInputElement): void
    {
        const type = field.displayAsPassword ? 'password' : 'text';
        const name = Stage.inputName(field);
        const maxLength = field.maxChars > 0 ? field.maxChars : 524288;

        if(element.type !== type) element.type = type;

        if(element.autocomplete !== field.autoComplete) element.autocomplete = field.autoComplete;

        if(element.name !== name) element.name = name;

        if(element.maxLength !== maxLength) element.maxLength = maxLength;

        // A view assigns the field's text directly (the stored-credential pre-fill, a reset), and
        // the element has to follow — but never while it is the one being typed into, or the caret
        // would be thrown to the end of the value on every frame.
        if(element.value !== field.text && document.activeElement !== element)
        {
            element.value = field.text;
        }
    }

    /**
     * TS-only: the `name` a password manager reads the element by.
     *
     * `autocomplete` alone carries Chrome, but the older managers still lean on the name, and the
     * field's own hint is the only thing that knows which box is which — the SSO ticket screen is
     * an input that is neither a login nor a password and must be named as neither.
     */
    private static inputName(field: TextField): string
    {
        if(field.autoComplete === 'username' || field.autoComplete === 'email') return 'username';

        if(field.autoComplete === 'current-password' || field.autoComplete === 'new-password') return 'password';

        return '';
    }

    /** TS-only: drops the overlay of a field that has left the stage. */
    private destroyInputElement(field: TextField, element: HTMLInputElement): void
    {
        this._elements.delete(field);
        this._fields.delete(element);
        this._geometry.delete(element);
        element.remove();
    }

    /** TS-only: the field an overlay event came from. */
    private fieldFor(target: EventTarget | null): TextField | null
    {
        if(!(target instanceof HTMLInputElement)) return null;

        return this._fields.get(target) ?? null;
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

        // An overlay is a real element ON TOP of the canvas, so it takes presses the display list
        // was meant to get. Only a press on the element serving the field actually under the
        // pointer belongs to the browser — that is what places the caret, and `focusin` is what
        // tells the stage about it afterwards. Anything else is routed through the display list
        // here, so an overlay can never swallow a click even if it is mispositioned or stale.
        if(target instanceof TextField && event.target === this._elements.get(target)) return;

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

    /**
     * TS-only: copies an overlay's value into the field it serves.
     *
     * Deliberately NOT keyed on the focused field: a password manager fills both boxes from one
     * click, and the one it does not focus would otherwise keep the text the canvas is painting —
     * which is how a filled-in password stayed empty as far as `LoginView.saveOutfit()` was
     * concerned.
     */
    private _onInputChanged = (event: Event): void =>
    {
        const field = this.fieldFor(event.target);

        if(!field) return;

        field.text = (event.target as HTMLInputElement).value;
        field.dispatchEvent(new DisplayEvent('change', true));
    };

    /** TS-only: the document focus moved onto one of the overlays — the display list follows it. */
    private _onInputFocusIn = (event: FocusEvent): void =>
    {
        const field = this.fieldFor(event.target);

        if(!field) return;

        this._focus = field;
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
        const field = this.fieldFor(event.target);

        if(!field) return;

        const key = event.key ?? '';
        const charCode = key.length === 1 ? key.charCodeAt(0) : (key === 'Enter' ? 13 : 0);

        field.dispatchEvent(new DisplayKeyboardEvent('keyDown', charCode, event.keyCode ?? 0));
    };

    /**
     * TS-only: keeps an `<input>` over the field it serves.
     *
     * Every live field is repositioned each frame, so the write is guarded by the geometry it last
     * produced: assigning the same seven styles sixty times a second invalidates layout for nothing.
     */
    private positionInputElement(field: TextField, element: HTMLInputElement): void
    {
        const position = this.getStagePosition(field);
        const red = (field.textColor >> 16) & 0xFF;
        const green = (field.textColor >> 8) & 0xFF;
        const blue = field.textColor & 0xFF;
        const left = `${position.x}px`;
        const top = `${position.y}px`;
        const width = `${Math.max(1, position.width)}px`;
        const height = `${Math.max(1, field.lineHeight)}px`;
        const font = field.cssFont;
        const caretColor = `rgb(${red}, ${green}, ${blue})`;
        const letterSpacing = Stage.maskLetterSpacing(field);
        const signature = `${left}|${top}|${width}|${height}|${font}|${caretColor}|${letterSpacing}`;

        if(this._geometry.get(element) === signature) return;

        this._geometry.set(element, signature);
        element.style.left = left;
        element.style.top = top;
        element.style.width = width;
        element.style.height = height;
        element.style.font = font;
        element.style.caretColor = caretColor;
        element.style.letterSpacing = letterSpacing;
    }

    /**
     * TS-only: the letter spacing that makes the overlay's caret land on the canvas's glyphs.
     *
     * The two halves of an editing field disagree on what a masked character is. Flash — and so
     * `TextField.displayText`, which is what the canvas paints — substitutes an asterisk;
     * `input[type=password]` lays its value out as U+2022 bullets, which are the wider glyph. The
     * element's text is transparent, so only its caret shows the difference, and it showed it as a
     * caret drifting a little further right of the last asterisk with every character typed.
     *
     * Spacing the overlay by the difference makes one bullet advance exactly one asterisk, so the
     * caret after N characters sits at N asterisks — where the canvas has just painted them.
     */
    private static maskLetterSpacing(field: TextField): string
    {
        if(!field.displayAsPassword) return 'normal';

        const mask = field.measureString(TextField.PASSWORD_MASK);
        const bullet = field.measureString(Stage.PASSWORD_BULLET);

        return `${mask - bullet}px`;
    }

    /**
     * TS-only: hides the controls a browser hangs inside its own password fields.
     *
     * Edge decorates every `input[type=password]` with a reveal eye, and WebKit/Chrome with the
     * password-manager buttons. They are drawn by the engine, not by us, so they are the one part
     * of the overlay that is not transparent — an eye appearing inside a Flash hitch box the moment
     * a password is typed. None of them can be turned off from an inline style, since they are
     * pseudo-elements; hence the one stylesheet.
     *
     * Nothing is lost with them gone: the element exists to carry the caret, IME and the password
     * manager's fill, and revealing a field whose glyphs the canvas paints would show nothing.
     *
     * The second rule is the other half of that. `:-webkit-autofill` overrides `color` and
     * `background` from the engine, so an autofilled overlay paints its own value in its own
     * highlight, on top of the canvas that is already painting the same text: transparency is not
     * a hiding mechanism a browser respects. `background-clip: text` over a transparent fill
     * colour is, and the absurd transition delay keeps the highlight from ever animating in.
     */
    private static installInputStyles(): void
    {
        if(document.getElementById(Stage.STYLE_ELEMENT_ID)) return;

        const style = document.createElement('style');

        style.id = Stage.STYLE_ELEMENT_ID;
        style.textContent = `
            .${Stage.INPUT_CLASS}::-ms-reveal,
            .${Stage.INPUT_CLASS}::-ms-clear,
            .${Stage.INPUT_CLASS}::-webkit-credentials-auto-fill-button,
            .${Stage.INPUT_CLASS}::-webkit-strong-password-auto-fill-button,
            .${Stage.INPUT_CLASS}::-webkit-caps-lock-indicator
            {
                display: none !important;
                visibility: hidden;
                pointer-events: none;
                width: 0;
                margin: 0;
            }

            .${Stage.INPUT_CLASS}:-webkit-autofill,
            .${Stage.INPUT_CLASS}:-webkit-autofill:hover,
            .${Stage.INPUT_CLASS}:-webkit-autofill:focus,
            .${Stage.INPUT_CLASS}:-webkit-autofill:active
            {
                -webkit-text-fill-color: transparent !important;
                -webkit-box-shadow: none !important;
                box-shadow: none !important;
                background-clip: text !important;
                transition: background-color 100000s ease-in-out 0s !important;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * TS-only: the `<form>` the editing elements live in.
     *
     * Chrome logs "Password field is not contained in a form" for a bare `input[type=password]`, and
     * a form is also what pairs a login box with a password box, which is the whole point. The form
     * is `display: contents`, so it adds no box: the inputs keep positioning against the same
     * containing block `positionInputElement()` computes stage coordinates for.
     *
     * Submission is cancelled — a form with a single text field submits implicitly on Enter, which
     * would reload the page out from under the login flow. Enter has a job already: `onInputKeyDown`
     * forwards it to the focused field, which is how `SsoTokenView` accepts a pasted ticket.
     */
    private static createInputForm(): HTMLFormElement
    {
        const form = document.createElement('form');

        form.id = 'vortex-login-form';
        form.style.display = 'contents';
        form.addEventListener('submit', event => event.preventDefault());

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
        this._form.removeEventListener('mousedown', this._onMouseDown);
        this._form.removeEventListener('mouseup', this._onMouseUp);
        this._form.removeEventListener('mousemove', this._onMouseMove);
        this._form.removeEventListener('input', this._onInputChanged);
        this._form.removeEventListener('keydown', this._onInputKeyDown);
        this._form.removeEventListener('focusin', this._onInputFocusIn);

        while(this.numChildren > 0)
        {
            this.removeChildAt(0);
        }

        for(const [field, element] of this._elements)
        {
            this.destroyInputElement(field, element);
        }

        this._focus = null;
        this._form.remove();
        this._canvas.remove();

        log.debug('Login stage disposed');
    }
}
