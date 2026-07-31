import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * ITab
 *
 * One slot in the friend bar — a friend, a request, or a token. `recycled` is what
 * lets the bar reuse a slot window when the friend behind it changes instead of
 * rebuilding it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/ITab.as
 */
export interface ITab extends IDisposable
{
    // AS3: .../view/tabs/ITab.as::get window()
    readonly window: IWindowContainer | null;

    // AS3: .../view/tabs/ITab.as::get selected()
    readonly selected: boolean;

    // AS3: .../view/tabs/ITab.as::get recycled()
    readonly recycled: boolean;

    // AS3: .../view/tabs/ITab.as::select()
    select(animate: boolean): void;

    // AS3: .../view/tabs/ITab.as::deselect()
    deselect(animate: boolean): void;

    // AS3: .../view/tabs/ITab.as::recycle()
    recycle(): void;
}
