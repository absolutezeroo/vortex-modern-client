import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';

/**
 * WiredMenuOverviewTab — the "variable overview" tab: a searchable table of every wired variable in
 * the room with its current value, plus jump-to-variable navigation from deep links.
 *
 * TODO(AS3): STUB. The real tab is 605 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_variable_overview/WiredMenuOverviewTab.as
 * — it drives the variables synchronizer, renders VariableTableObject/PropertyTableObject rows, shows
 * VariableInfoBubbleView tooltips, and highlights holders. Only the base-tab lifecycle + the
 * IUpdateReceiver shape and the jumpToVariableByName link entry point are wired here.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_variable_overview/WiredMenuOverviewTab.as
 */
export class WiredMenuOverviewTab extends WiredMenuDefaultTab implements IUpdateReceiver
{
    // AS3: WiredMenuOverviewTab.as::WiredMenuOverviewTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
    }

    // AS3: WiredMenuOverviewTab.as::update()
    update(_deltaTime: number): void
    {
        // TODO(AS3): refresh the variable table / pending highlight animations.
    }

    // AS3: WiredMenuOverviewTab.as::jumpToVariableByName()
    jumpToVariableByName(_name: string): void
    {
        // TODO(AS3): scroll to and highlight the named variable row (deep-link target).
    }
}
