/**
 * Interface for a button caption with text, tooltip, and visibility.
 *
 * In AS3 this was the obfuscated `class_3562` / `ICaption` interface.
 * Extracted here as a clean TypeScript interface alongside its
 * implementation.
 *
 * @see sources/win63_version/habbo/window/utils/AlertDialogCaption.as
 * @see sources/flash_version/com/sulake/habbo/window/utils/ICaption.as
 */
export interface ICaption
{
	text: string;
	toolTip: string;
	visible: boolean;
}

/**
 * Concrete caption for alert dialog buttons.
 *
 * Stores the display text, tooltip, and visibility state of a
 * dialog button. Used by {@link AlertDialog.getButtonCaption} and
 * {@link AlertDialog.setButtonCaption} to read/write button labels.
 *
 * @see sources/win63_version/habbo/window/utils/AlertDialogCaption.as
 */
export class AlertDialogCaption implements ICaption
{
	constructor(text: string, toolTip: string, visible: boolean)
	{
		this._text = text;
		this._toolTip = toolTip;
		this._visible = visible;
	}

	private _text: string;

	public get text(): string
	{
		return this._text;
	}

	public set text(value: string)
	{
		this._text = value;
	}

	private _toolTip: string;

	public get toolTip(): string
	{
		return this._toolTip;
	}

	public set toolTip(value: string)
	{
		this._toolTip = value;
	}

	private _visible: boolean;

	public get visible(): boolean
	{
		return this._visible;
	}

	public set visible(value: boolean)
	{
		this._visible = value;
	}
}
