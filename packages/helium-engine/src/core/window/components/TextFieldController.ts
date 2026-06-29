import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {ITextFieldWindow} from './ITextFieldWindow';
import {WindowController} from '../WindowController';
import {TextController} from './TextController';
import {InteractiveController} from './InteractiveController';
import {WindowEvent} from '../events/WindowEvent';
import {WindowKeyboardEvent} from '../events/WindowKeyboardEvent';
import {PropertyStruct} from '../utils/PropertyStruct';

/**
 * Controller for editable text field windows.
 *
 * Extends TextController with input-specific functionality:
 * editable state, focus management, keyboard event dispatching,
 * selection, password display, and max length.
 *
 * In AS3 this wraps a native Flash TextField. In TypeScript/web,
 * we use a hidden HTML input element overlaid on the canvas to
 * capture user input, syncing text back to the window.
 *
 * @see sources/win63_version/com/sulake/core/window/components/TextFieldController.as
 */
export class TextFieldController extends TextController implements ITextFieldWindow
{
	private static readonly _WORD_DELIMS: RegExp = /[~%&!\\;:"',<>?#\s.\-()=\[\]{}\^_]/g;
	protected _inputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
	private _maxLength: number = 0;
	private _focusCapturer: boolean = false;
	private _boundOnInput: EventListener | null = null;
	private _boundOnKeyDown: EventListener | null = null;
	private _boundOnKeyUp: EventListener | null = null;
	private _boundOnFocus: EventListener | null = null;
	private _boundOnBlur: EventListener | null = null;

	constructor(
		name: string,
		type: number,
		style: number,
		param: number,
		context: IWindowContext,
		rect: { x: number; y: number; width: number; height: number },
		parent: IWindow | null = null,
		procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
		tags: string[] | null = null,
		properties: unknown[] | null = null,
		id: number = 0,
		dynamicStyle: string = ''
	)
	{
		param = (param & ~0x10) | 0x01;
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);

		this._editable = true;
		this.createInputElement();
	}

	private _editable: boolean = true;

	/**
	 * Whether the field accepts user input.
	 */
	public get editable(): boolean
	{
		return this._editable;
	}

	public set editable(value: boolean)
	{
		this._editable = value;

		if (this._inputElement)
		{
			this._inputElement.readOnly = !value;
		}
	}

	private _selectable: boolean = true;

	public get selectable(): boolean
	{
		return this._selectable;
	}

	public set selectable(value: boolean)
	{
		this._selectable = value;
	}

	private _displayAsPassword: boolean = false;

	public get displayAsPassword(): boolean
	{
		return this._displayAsPassword;
	}

	public set displayAsPassword(value: boolean)
	{
		this._displayAsPassword = value;

		if (this._inputElement && this._inputElement instanceof HTMLInputElement)
		{
			this._inputElement.type = value ? 'password' : 'text';
		}
	}

	/**
	 * Whether the field currently has focus.
	 *
	 * In AS3, this checks `_field.stage.focus == _field`.
	 * Here we check if our hidden input is the active element.
	 */
	public get focused(): boolean
	{
		if (this._inputElement)
		{
			return document.activeElement === this._inputElement;
		}

		return false;
	}

	private _selectionBeginIndex: number = 0;

	public get selectionBeginIndex(): number
	{
		if (this._inputElement)
		{
			return this._inputElement.selectionStart ?? this._selectionBeginIndex;
		}

		return this._selectionBeginIndex;
	}

	private _selectionEndIndex: number = 0;

	public get selectionEndIndex(): number
	{
		if (this._inputElement)
		{
			return this._inputElement.selectionEnd ?? this._selectionEndIndex;
		}

		return this._selectionEndIndex;
	}

	private _interactiveCursorDisabled: boolean = false;

	public get interactiveCursorDisabled(): boolean
	{
		return this._interactiveCursorDisabled;
	}

	public set interactiveCursorDisabled(value: boolean)
	{
		this._interactiveCursorDisabled = value;
	}

	public get displayRaw(): boolean
	{
		return this._displayRaw;
	}

	public set displayRaw(value: boolean)
	{
		this._displayRaw = value;
	}

	// textBackground, textBackgroundColor, scrollH, scrollV, scrollStepH, scrollStepV
	// inherited from TextController

	private _toolTipCaption: string = '';

	public get toolTipCaption(): string
	{
		return this._toolTipCaption;
	}

	public set toolTipCaption(value: string)
	{
		this._toolTipCaption = value ?? '';
	}

	private _toolTipDelay: number = 500;

	public get toolTipDelay(): number
	{
		return this._toolTipDelay;
	}

	public set toolTipDelay(value: number)
	{
		this._toolTipDelay = value;
	}

	private _toolTipIsDynamic: boolean = false;

	public get toolTipIsDynamic(): boolean
	{
		return this._toolTipIsDynamic;
	}

	public set toolTipIsDynamic(value: boolean)
	{
		this._toolTipIsDynamic = value;
	}

	// bold, italic, underline, fontFace, fontSize, length, numLines,
	// textHeight, textWidth inherited from TextController

	public override get properties(): unknown[]
	{
		const props = InteractiveController.writeInteractiveWindowProperties(this, super.properties);

		props.push(this.createProperty('editable', this._editable));
		props.push(this.createProperty('focus_capturer', this._focusCapturer));
		props.push(this.createProperty('selectable', this._selectable));
		props.push(this.createProperty('display_as_password', this._displayAsPassword));
		props.push(this.createProperty('display_raw', this._displayRaw));

		return props;
	}

	public override set properties(value: unknown[])
	{
		InteractiveController.readInteractiveWindowProperties(this, value);

		for (const item of value)
		{
			const prop = item as PropertyStruct;

			switch (prop.key)
			{
				case 'focus_capturer':
					this._focusCapturer = !!prop.value;
					break;
				case 'selectable':
					this._selectable = !!prop.value;
					break;
				case 'editable':
					this._editable = !!prop.value;
					break;
				case 'display_as_password':
					this._displayAsPassword = !!prop.value;
					break;
				case 'display_raw':
					this._displayRaw = !!prop.value;
					break;
			}
		}

		super.properties = value;
	}

	public override get text(): string
	{
		return super.text;
	}

	/**
	 * Sets the text and refreshes auto-sizing.
	 */
	public override set text(value: string)
	{
		super.text = value;

		if (this._inputElement)
		{
			this._inputElement.value = this._text;
		}
	}

	public override get background(): boolean
	{
		return this._background;
	}

	/**
	 * Sets the background flag and syncs visual state.
	 */
	public override set background(value: boolean)
	{
		this._background = value;
		this._fillColor = this._background
			? this._fillColor | this._alphaColor
			: this._fillColor & 0xFFFFFF;
	}

	// maxScrollH, maxScrollV, visibleRegion, scrollableRegion inherited from TextController

	/**
	 * Returns word boundary positions for the given text.
	 */
	public static getWordPositions(text: string): number[]
	{
		const positions: number[] = [0];
		let match: RegExpExecArray | null;

		TextFieldController._WORD_DELIMS.lastIndex = 0;

		while ((match = TextFieldController._WORD_DELIMS.exec(text)) !== null)
		{
			if (match.index < text.length)
			{
				positions.push(match.index + 1);
			}
		}

		return positions;
	}

	/**
	 * Enables the text field, making it editable.
	 */
	public override enable(): boolean
	{
		if (super.enable())
		{
			this._editable = true;

			if (this._inputElement)
			{
				this._inputElement.readOnly = false;
			}

			return true;
		}

		this._editable = false;

		if (this._inputElement)
		{
			this._inputElement.readOnly = true;
		}

		return false;
	}

	/**
	 * Disables the text field, making it non-editable.
	 */
	public override disable(): boolean
	{
		if (super.disable())
		{
			this._editable = false;

			if (this._inputElement)
			{
				this._inputElement.readOnly = true;
			}

			return true;
		}

		this._editable = true;

		if (this._inputElement)
		{
			this._inputElement.readOnly = false;
		}

		return false;
	}

	/**
	 * Focuses the text field.
	 *
	 * In AS3, calls super.focus() then sets Flash stage focus to the TextField.
	 * Here we focus the hidden HTML input element.
	 */
	public override focus(): boolean
	{
		const result = super.focus();

		if (result)
		{
			if (this._inputElement)
			{
				this.positionInputElement();
				this._inputElement.style.display = '';
				this._inputElement.value = this._text;
				this._inputElement.focus();
			}
		}

		return result;
	}

	/**
	 * Unfocuses the text field.
	 *
	 * In AS3, clears Flash stage focus then calls super.unfocus().
	 * Here we blur the hidden HTML input element.
	 */
	public override unfocus(): boolean
	{
		if (this._inputElement)
		{
			if (document.activeElement === this._inputElement)
			{
				this._inputElement.blur();
			}

			this._inputElement.style.display = 'none';
		}

		return super.unfocus();
	}

	/**
	 * Handles window events for the text field.
	 *
	 * In AS3, WE_ACTIVATED and WME_DOWN trigger focus(),
	 * WE_RESIZED syncs the field dimensions, and interactive
	 * events are processed for tooltips.
	 */
	public override update(source: WindowController, event: WindowEvent): boolean
	{
		const result = super.update(source, event);

		switch (event.type)
		{
			case 'WE_ACTIVATED':
			case 'WME_DOWN':
				this.focus();
				break;
			case 'WE_RESIZED':
				if (source === (this as unknown as WindowController))
				{
					this.positionInputElement();
				}
				break;
		}

		if (source === (this as unknown as WindowController))
		{
			InteractiveController.processInteractiveWindowEvents(this, event);
		}

		return result;
	}

	public appendText(text: string): void
	{
		this._text += text;

		if (this._inputElement)
		{
			this._inputElement.value = this._text;
		}
	}

	public replaceText(beginIndex: number, endIndex: number, newText: string): void
	{
		this._text = this._text.substring(0, beginIndex) + newText + this._text.substring(endIndex);

		if (this._inputElement)
		{
			this._inputElement.value = this._text;
		}
	}

	/**
	 * Sets the selection range on the input element.
	 */
	public setSelection(beginIndex: number, endIndex: number): void
	{
		this._selectionBeginIndex = beginIndex;
		this._selectionEndIndex = endIndex;

		if (this._inputElement)
		{
			this._inputElement.setSelectionRange(beginIndex, endIndex);
		}
	}

	/**
	 * Programmatically triggers a change event.
	 *
	 * In AS3, this calls onChangeEvent(null) which dispatches WE_CHANGE.
	 */
	public requestChangeEvent(): void
	{
		this.onChangeEvent();
	}

	/**
	 * Gets the word at the given pixel position.
	 */
	public getWordAt(_x: number, _y: number): string
	{
		return '';
	}

	public showToolTip(_toolTip: unknown): void
	{
		// Override in subclass
	}

	public hideToolTip(): void
	{
		// Override in subclass
	}

	public setMouseCursorForState(_state: number, _cursor: number): number
	{
		return 0;
	}

	public getMouseCursorByState(_state: number): number
	{
		return 0;
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		this._focusCapturer = false;

		if (this._inputElement)
		{
			if (this.focused)
			{
				this.unfocus();
			}

			if (this._boundOnInput) this._inputElement.removeEventListener('input', this._boundOnInput);
			if (this._boundOnKeyDown) this._inputElement.removeEventListener('keydown', this._boundOnKeyDown);
			if (this._boundOnKeyUp) this._inputElement.removeEventListener('keyup', this._boundOnKeyUp);
			if (this._boundOnFocus) this._inputElement.removeEventListener('focus', this._boundOnFocus);
			if (this._boundOnBlur) this._inputElement.removeEventListener('blur', this._boundOnBlur);

			if (this._inputElement.parentNode)
			{
				this._inputElement.parentNode.removeChild(this._inputElement);
			}

			this._inputElement = null;
		}

		this._boundOnInput = null;
		this._boundOnKeyDown = null;
		this._boundOnKeyUp = null;
		this._boundOnFocus = null;
		this._boundOnBlur = null;

		super.dispose();
	}

	/**
	 * Creates and sets up the hidden HTML input element for text capture.
	 */
	private createInputElement(): void
	{
		if (typeof document === 'undefined') return;

		const el = this._multiline
			? document.createElement('textarea')
			: document.createElement('input');

		if (el instanceof HTMLInputElement)
		{
			el.type = this._displayAsPassword ? 'password' : 'text';
		}

		el.style.position = 'absolute';
		el.style.opacity = '0';
		el.style.pointerEvents = 'none';
		el.style.zIndex = '9999';
		el.style.display = 'none';
		el.style.padding = '0';
		el.style.margin = '0';
		el.style.border = 'none';
		el.style.outline = 'none';
		el.style.background = 'transparent';

		if (this._maxChars > 0)
		{
			el.maxLength = this._maxChars;
		}

		this._boundOnInput = ((e: Event) => this.onInputEvent(e)) as EventListener;
		this._boundOnKeyDown = ((e: Event) => this.onKeyDownEvent(e as KeyboardEvent)) as EventListener;
		this._boundOnKeyUp = ((e: Event) => this.onKeyUpEvent(e as KeyboardEvent)) as EventListener;
		this._boundOnFocus = ((e: Event) => this.onFocusInEvent(e as FocusEvent)) as EventListener;
		this._boundOnBlur = ((e: Event) => this.onFocusOutEvent(e as FocusEvent)) as EventListener;

		el.addEventListener('input', this._boundOnInput);
		el.addEventListener('keydown', this._boundOnKeyDown);
		el.addEventListener('keyup', this._boundOnKeyUp);
		el.addEventListener('focus', this._boundOnFocus);
		el.addEventListener('blur', this._boundOnBlur);

		document.body.appendChild(el);
		this._inputElement = el;
	}

	/**
	 * Positions the hidden input element over the window's global position.
	 */
	private positionInputElement(): void
	{
		if (!this._inputElement) return;

		const pos = {x: 0, y: 0};
		this.getGlobalPosition(pos);

		const canvas = document.querySelector('canvas');

		if (canvas)
		{
			const rect = canvas.getBoundingClientRect();
			this._inputElement.style.left = (rect.left + pos.x) + 'px';
			this._inputElement.style.top = (rect.top + pos.y) + 'px';
		}

		this._inputElement.style.width = this._width + 'px';
		this._inputElement.style.height = this._height + 'px';
		this._inputElement.style.fontSize = this._fontSize + 'px';
	}

	/**
	 * Handles text input from the hidden HTML element.
	 */
	private onInputEvent(_e: Event): void
	{
		if (!this._inputElement) return;

		this._text = this._inputElement.value;
		this._caption = this._text;
		this._context.invalidate(this, null, 1);
		this.onChangeEvent();
	}

	/**
	 * Dispatches a WKE_KEY_DOWN event through the window system.
	 */
	private onKeyDownEvent(e: KeyboardEvent): void
	{
		try
		{
			this._caption = this._inputElement?.value ?? this._text;
			this._text = this._caption;
			this._context.invalidate(this, null, 1);

			const wke = WindowKeyboardEvent.allocateKeyboard(
				WindowKeyboardEvent.KEY_DOWN,
				e.keyCode ?? 0,
				e.key?.charCodeAt(0) ?? 0,
				this,
				null,
				e.altKey,
				e.ctrlKey,
				e.shiftKey,
				e.location
			);

			this.update(this as unknown as WindowController, wke);

			if (this.disposed) return;

			for (const tracker of this._context.inputEventTrackers)
			{
				tracker.eventReceived(wke, this);
			}

			wke.recycle();
		}
		catch (err)
		{
			this._context.handleError(5, err instanceof Error ? err : new Error(String(err)));
		}
	}

	/**
	 * Dispatches a WKE_KEY_UP event through the window system.
	 */
	private onKeyUpEvent(e: KeyboardEvent): void
	{
		try
		{
			this._caption = this._inputElement?.value ?? this._text;
			this._text = this._caption;
			this._context.invalidate(this, null, 1);

			const wke = WindowKeyboardEvent.allocateKeyboard(
				WindowKeyboardEvent.KEY_UP,
				e.keyCode ?? 0,
				e.key?.charCodeAt(0) ?? 0,
				this,
				null,
				e.altKey,
				e.ctrlKey,
				e.shiftKey,
				e.location
			);

			this.update(this as unknown as WindowController, wke);

			if (this.disposed) return;

			for (const tracker of this._context.inputEventTrackers)
			{
				tracker.eventReceived(wke, this);
			}

			wke.recycle();
		}
		catch (err)
		{
			this._context.handleError(5, err instanceof Error ? err : new Error(String(err)));
		}
	}

	/**
	 * Dispatches a WE_CHANGE event through the window system.
	 */
	private onChangeEvent(): void
	{
		try
		{
			const changeEvent = WindowEvent.allocate('WE_CHANGE', this, null);
			this.update(this as unknown as WindowController, changeEvent);
			changeEvent.recycle();
		}
		catch (err)
		{
			this._context.handleError(5, err instanceof Error ? err : new Error(String(err)));
		}
	}

	/**
	 * Handles native focus-in: sets the window focus state.
	 */
	private onFocusInEvent(_e: FocusEvent): void
	{
		try
		{
			if (!this.getStateFlag(2))
			{
				this.focus();
			}
		}
		catch (err)
		{
			this._context.handleError(5, err instanceof Error ? err : new Error(String(err)));
		}
	}

	/**
	 * Handles native focus-out: clears the window focus state.
	 */
	private onFocusOutEvent(_e: FocusEvent): void
	{
		try
		{
			if (this.getStateFlag(2))
			{
				super.unfocus();
			}
		}
		catch (err)
		{
			this._context.handleError(5, err instanceof Error ? err : new Error(String(err)));
		}
	}
}
