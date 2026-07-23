import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';

/**
 * WiredMenuInspectionTab — the "inspection" tab: pick a furni or user and inspect the wired variables
 * that reference it, with a per-holder value table.
 *
 * TODO(AS3): STUB. The real tab is 743 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_inspection/WiredMenuInspectionTab.as
 * — it drives furni/user picking, VariableHolderPreviewer previews, VariableValueTableObject rows, and
 * per-frame refresh. Only the base-tab lifecycle + the IUpdateReceiver shape and the
 * inspectFurni/inspectUser link entry points are wired here.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_inspection/WiredMenuInspectionTab.as
 */
export class WiredMenuInspectionTab extends WiredMenuDefaultTab implements IUpdateReceiver
{
    // AS3: WiredMenuInspectionTab.as::WiredMenuInspectionTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
    }

    // AS3: WiredMenuInspectionTab.as::update()
    update(_deltaTime: number): void
    {
        // TODO(AS3): refresh the inspected holder's variable values.
    }

    // AS3: WiredMenuInspectionTab.as::inspectFurni()
    inspectFurni(_id: number, _fromLink: boolean = false): void
    {
        // TODO(AS3): select the furni and populate the inspection table (fromLink drives auto-open).
    }

    // AS3: WiredMenuInspectionTab.as::inspectUser()
    inspectUser(_id: number, _fromLink: boolean = false): void
    {
        // TODO(AS3): select the user and populate the inspection table (fromLink drives auto-open).
    }
}
