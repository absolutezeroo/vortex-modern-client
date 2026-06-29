import type {IWindow} from '../IWindow';

/**
 * Interface for label windows.
 *
 * A lightweight text display that uses shared TextFieldCache instances
 * rather than owning a dedicated text field.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ILabelWindow.as
 */
export interface ILabelWindow extends IWindow
{
	readonly bold: boolean;
	readonly italic: boolean;
	readonly underline: boolean;
	readonly fontFace: string;
	readonly fontSize: number;
	readonly length: number;
	readonly textHeight: number;
	readonly textWidth: number;

	text: string;
	textColor: number;
	textBackground: boolean;
	textBackgroundColor: number;
	vertical: boolean;
}
