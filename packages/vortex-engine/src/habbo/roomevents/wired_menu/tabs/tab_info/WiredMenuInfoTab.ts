import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';

/**
 * WiredMenuInfoTab — the static "info" tab. It adds no behaviour of its own; the tab is entirely
 * described by its XML container (help text / links), so the class is just a pass-through to the base.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_info/WiredMenuInfoTab.as
 */
export class WiredMenuInfoTab extends WiredMenuDefaultTab
{
    // AS3: WiredMenuInfoTab.as::WiredMenuInfoTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
    }
}
