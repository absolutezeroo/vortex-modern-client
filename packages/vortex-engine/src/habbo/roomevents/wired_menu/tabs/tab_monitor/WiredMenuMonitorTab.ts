import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';

/**
 * WiredMenuMonitorTab — the "monitor" tab: a live feed of wired executions and errors (auto-refreshing
 * table, error detail popups, room-log entry point).
 *
 * TODO(AS3): STUB. The real tab is 405 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_monitor/WiredMenuMonitorTab.as
 * — it builds an ErrorDataTableObject feed, polls per frame via update(), opens WiredErrorInfoView
 * detail popups, and drives the room-log request. Only the base-tab lifecycle + the IUpdateReceiver
 * shape are wired here; the feed/table/polling are unported.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_monitor/WiredMenuMonitorTab.as
 */
export class WiredMenuMonitorTab extends WiredMenuDefaultTab implements IUpdateReceiver
{
    // AS3: WiredMenuMonitorTab.as::WiredMenuMonitorTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
    }

    // AS3: WiredMenuMonitorTab.as::update()
    update(_deltaTime: number): void
    {
        // TODO(AS3): poll the error/execution feed and refresh the monitor table.
    }
}
