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
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get bold()
    readonly bold: boolean;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get italic()
    readonly italic: boolean;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get underline()
    readonly underline: boolean;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get fontFace()
    readonly fontFace: string;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get fontSize()
    readonly fontSize: number;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get length()
    readonly length: number;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get textHeight()
    readonly textHeight: number;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get textWidth()
    readonly textWidth: number;

    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get text()
    text: string;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get textColor()
    textColor: number;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get textBackground()
    textBackground: boolean;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get textBackgroundColor()
    textBackgroundColor: number;
    // AS3: .../src/com/sulake/core/window/components/ILabelWindow.as::get vertical()
    vertical: boolean;
}
