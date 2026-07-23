import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';

/**
 * WiredMenuChestsTab — the "chests" tab: a preview of the room's wired chests and their recent
 * give/transaction activity.
 *
 * TODO(AS3): STUB. The real tab is 264 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_chests/WiredMenuChestsTab.as
 * — it renders TransactionPreviewTableObject rows off the wired-chest controller and refreshes per
 * frame. Only the base-tab lifecycle + the IUpdateReceiver shape are wired here; the chest controller
 * it reads from is itself unported.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_chests/WiredMenuChestsTab.as
 */
export class WiredMenuChestsTab extends WiredMenuDefaultTab implements IUpdateReceiver
{
    // AS3: WiredMenuChestsTab.as::WiredMenuChestsTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
    }

    // AS3: WiredMenuChestsTab.as::update()
    update(_deltaTime: number): void
    {
        // TODO(AS3): refresh the chest transaction preview table.
    }
}
