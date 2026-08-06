import type {IWindow} from '../IWindow';
import type {ISelectorWindow} from './ISelectorWindow';

/**
 * Interface for selectable windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ISelectableWindow.as
 */
export interface ISelectableWindow extends IWindow
{
    // AS3: .../src/com/sulake/core/window/components/ISelectableWindow.as::get selector()
    readonly selector: ISelectorWindow | null;
    // AS3: .../src/com/sulake/core/window/components/ISelectableWindow.as::get isSelected()
    isSelected: boolean;

    // AS3: .../src/com/sulake/core/window/components/ISelectableWindow.as::select()
    select(): boolean;

    // AS3: .../src/com/sulake/core/window/components/ISelectableWindow.as::unselect()
    unselect(): boolean;
}
