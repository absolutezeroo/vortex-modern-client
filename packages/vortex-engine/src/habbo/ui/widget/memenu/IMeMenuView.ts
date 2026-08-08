import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {MeMenuWidget} from './MeMenuWidget';

/**
 * The contract every me-menu page implements. Four lines, and they are the whole navigation model:
 * the widget builds a view, calls `init`, and drops `window` into its content slot.
 *
 * `init` receives the view's own name as well as the widget, because the widget later reads it
 * back off `window.name` to decide which view is showing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/IMeMenuView.as
 */
export interface IMeMenuView
{
    // AS3: .../widget/memenu/IMeMenuView.as::init()
    init(widget: MeMenuWidget, name: string): void;

    // AS3: .../widget/memenu/IMeMenuView.as::dispose()
    dispose(): void;

    // AS3: .../widget/memenu/IMeMenuView.as::get window()
    readonly window: IWindowContainer | null;

    // AS3: .../widget/memenu/IMeMenuView.as::updateUnseenItemCount()
    updateUnseenItemCount(category: string, count: number): void;
}
