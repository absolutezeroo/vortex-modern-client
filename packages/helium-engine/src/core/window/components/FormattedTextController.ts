import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import {TextController} from './TextController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for formatted (HTML) text windows.
 *
 * Extends TextController and overrides `set text` to use htmlText
 * instead of plain text. In AS3, this set `_field.htmlText` on the
 * underlying TextField.
 *
 * @see sources/win63_version/core/window/components/FormattedTextController.as
 */
export class FormattedTextController extends TextController
{
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
	}

	/**
	 * Sets text content as HTML.
	 *
	 * In AS3 this mirrors TextController localization flow but writes html text.
	 */
	public override get text(): string
	{
		return this.htmlText;
	}

	public override set text(value: string)
	{
		if (value == null) return;

		if (this._localized)
		{
			this.removeLocalizationListenerForCaption();
			this._localized = false;
		}

		this._caption = value;

		if (!this._displayRaw && this.isLocalizationKey(this._caption))
		{
			this._localized = true;
			this.registerLocalizationListenerForCaption();

			return;
		}

		this._htmlText = this._caption;
		this._text = this._caption;
		this.refreshTextImage();
	}

	public set localization(value: string)
	{
		if (value == null) return;

		this._htmlText = this.limitStringLength(value);
		this._text = this._htmlText;
		this.refreshTextImage();
	}
}
