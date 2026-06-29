import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {ILabelWindow} from './ILabelWindow';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';
import {TextStyleManager} from '../utils/TextStyleManager';
import {resolveLocalizationTokens} from '../utils/WindowParser';

/**
 * Controller for label windows.
 *
 * A lightweight text display that uses shared TextFieldCache instances
 * rather than owning a dedicated TextField. Unlike TextController,
 * this extends WindowController directly per AS3.
 *
 * @see sources/win63_version/core/window/components/TextLabelController.as
 */
export class TextLabelController extends WindowController implements ILabelWindow
{
	/**
	 * Shared canvas for text measurement.
	 */
	private static _measureCtx: OffscreenCanvasRenderingContext2D | null = null;
	private _textStyleName: string = '';
	private _refreshing: boolean = false;
	private _marginLeft: number = 0;
	private _marginTop: number = 0;
	private _marginRight: number = 0;
	private _marginBottom: number = 0;
	private _spacing: number = 0;
	private _leading: number = 0;

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
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);

		this._hasVisualContent = true;
	}

	private _text: string = '';

	public get text(): string
	{
		return this._text;
	}

	public set text(value: string)
	{
		if (value == null) return;

		this._text = resolveLocalizationTokens(value);
		this._caption = this._text;
		this.refresh();
	}

	private _textColor: number | null = null;

	public get textColor(): number
	{
		return this._textColor ?? 0;
	}

	public set textColor(value: number)
	{
		if (value !== this._textColor)
		{
			this._textColor = value;
			this.refresh();
		}
	}

	private _textWidth: number = 0;

	public get textWidth(): number
	{
		return this._textWidth;
	}

	private _textHeight: number = 0;

	public get textHeight(): number
	{
		return this._textHeight;
	}

	private _vertical: boolean = false;

	public get vertical(): boolean
	{
		return this._vertical;
	}

	public set vertical(value: boolean)
	{
		this._vertical = value;
		this.refresh();
	}

	private _fontFace: string = '';

	public get fontFace(): string
	{
		return this._fontFace;
	}

	private _fontSize: number = 12;

	public get fontSize(): number
	{
		return this._fontSize;
	}

	private _bold: boolean = false;

	public get bold(): boolean
	{
		return this._bold;
	}

	private _italic: boolean = false;

	public get italic(): boolean
	{
		return this._italic;
	}

	private _underline: boolean = false;

	public get underline(): boolean
	{
		return this._underline;
	}

	private _etchingColor: number = 0;

	public get etchingColor(): number
	{
		return this._etchingColor;
	}

	private _etchingPosition: string = 'bottom';

	public get etchingPosition(): string
	{
		return this._etchingPosition;
	}

	public override get caption(): string
	{
		return this._text;
	}

	public override set caption(value: string)
	{
		this.text = value;
	}

	/**
	 * Whether a text color has been explicitly set.
	 */
	public get hasTextColor(): boolean
	{
		return this._textColor !== null;
	}

	public get textBackground(): boolean
	{
		return this.background;
	}

	public set textBackground(value: boolean)
	{
		this.background = value;
	}

	public get textBackgroundColor(): number
	{
		return this.color;
	}

	public set textBackgroundColor(value: number)
	{
		this.color = value;
	}

	public get length(): number
	{
		return this._text.length;
	}

	/**
	 * Draw offset X (margin left).
	 */
	public get drawOffsetX(): number
	{
		return this._marginLeft;
	}

	/**
	 * Draw offset Y (margin top).
	 */
	public get drawOffsetY(): number
	{
		return this._marginTop;
	}

	public override get properties(): unknown[]
	{
		const props = super.properties;

		props.push(this.createProperty('text_style', this._textStyleName));
		props.push(this.createProperty('text_color', this._textColor ?? 0));
		props.push(this.createProperty('vertical', this._vertical));
		props.push(this.createProperty('margin_left', this._marginLeft));
		props.push(this.createProperty('margin_top', this._marginTop));
		props.push(this.createProperty('margin_right', this._marginRight));
		props.push(this.createProperty('margin_bottom', this._marginBottom));

		return props;
	}

	public override set properties(value: unknown[])
	{
		for (const item of value)
		{
			const prop = item as PropertyStruct;

			switch (prop.key)
			{
				case 'text_style':
				{
					this._textStyleName = prop.value as string;

					const resolved = TextStyleManager.getStyle(this._textStyleName);

					if (resolved)
					{
						if (resolved.fontFamily != null) this._fontFace = resolved.fontFamily;
						if (resolved.fontSize != null) this._fontSize = resolved.fontSize;
					if (resolved.fontWeight === 'bold') this._bold = true;
					if (resolved.fontStyle === 'italic') this._italic = true;
					if (resolved.textDecoration === 'underline') this._underline = true;
					if (resolved.color != null && this._textColor === null) this._textColor = resolved.color;
					if (resolved.etchingColor != null) this._etchingColor = resolved.etchingColor;
					if (resolved.etchingPosition != null) this._etchingPosition = resolved.etchingPosition;
					if (resolved.letterSpacing != null) this._spacing = resolved.letterSpacing;
					if (resolved.leading != null) this._leading = resolved.leading;
				}

					break;
				}
				case 'text_color':
					this._textColor = prop.value as number;
					break;
				case 'margin_left':
					this._marginLeft = prop.value as number;
					break;
				case 'margin_top':
					this._marginTop = prop.value as number;
					break;
				case 'margin_right':
					this._marginRight = prop.value as number;
					break;
				case 'margin_bottom':
					this._marginBottom = prop.value as number;
					break;
				case 'vertical':
					this._vertical = !!prop.value;
					break;
			}
		}

		super.properties = value;
		this.refresh();
	}

	private static getMeasureCtx(): OffscreenCanvasRenderingContext2D
	{
		if (!TextLabelController._measureCtx)
		{
			TextLabelController._measureCtx = new OffscreenCanvas(1, 1).getContext('2d')!;
		}

		return TextLabelController._measureCtx;
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		super.dispose();
	}

	/**
	 * Refreshes text layout, recalculating dimensions and auto-sizing.
	 *
	 * Port of AS3 TextLabelController.refresh(). Gets a configured TextField
	 * via TextFieldCache, measures text, then auto-sizes the window to fit
	 * text content + margins.
	 *
	 * @see sources/win63_version/core/window/components/TextLabelController.as refresh()
	 */
	private refresh(fromResize: boolean = false): void
	{
		if (this._refreshing) return;

		this._refreshing = true;

		if (!this._text)
		{
			this._textWidth = 0;
			this._textHeight = 0;
			this._refreshing = false;
			this._context.invalidate(this, null, 1);

			return;
		}

		// Measure text using shared canvas context
		const ctx = TextLabelController.getMeasureCtx();
		let fontStr = '';

		if (this._italic) fontStr += 'italic ';
		if (this._bold) fontStr += 'bold ';
		fontStr += `${this._fontSize}px ${this._fontFace || 'Ubuntu, Arial, sans-serif'}`;
		ctx.font = fontStr;

		const metrics = ctx.measureText(this._text);
		const measuredWidth = Math.ceil(metrics.width + (Math.max(0, this._text.length - 1) * this._spacing));
		const measuredHeight = Math.ceil(this._fontSize + Math.max(0, this._leading));

		this._textWidth = measuredWidth;
		this._textHeight = measuredHeight;

		// Auto-size: AS3 compares textField dimensions to available space and resizes
		const hMargins = this._marginLeft + this._marginRight;
		const vMargins = this._marginTop + this._marginBottom;
		const availWidth = this._width - hMargins;
		const availHeight = this._height - vMargins;

		let resized = false;

		if (!this._vertical)
		{
			if (measuredWidth !== availWidth)
			{
				this.setRectangle(this._x, this._y, measuredWidth + hMargins, Math.floor(measuredHeight) + vMargins);
				resized = true;
			}

			if (measuredHeight > availHeight && !resized)
			{
				this.setRectangle(this._x, this._y, measuredWidth + hMargins, Math.floor(measuredHeight) + vMargins);
				resized = true;
			}
		}
		else
		{
			if (measuredWidth !== availHeight)
			{
				this.setRectangle(this._x, this._y, Math.floor(measuredHeight) + hMargins, measuredWidth + vMargins);
				resized = true;
			}

			if (measuredHeight > availWidth && !resized)
			{
				this.setRectangle(this._x, this._y, Math.floor(measuredHeight) + hMargins, measuredWidth + vMargins);
				resized = true;
			}
		}

		this._refreshing = false;
		this._context.invalidate(this, null, 1);
	}
}
