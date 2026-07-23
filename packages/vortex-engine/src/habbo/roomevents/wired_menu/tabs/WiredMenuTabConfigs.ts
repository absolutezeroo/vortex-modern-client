import type {WiredMenuController} from '../WiredMenuController';
import {WiredMenuTabConfig} from './WiredMenuTabConfig';
import {WiredMenuMonitorTab} from './tab_monitor/WiredMenuMonitorTab';
import {WiredMenuOverviewTab} from './tab_variable_overview/WiredMenuOverviewTab';
import {WiredMenuInspectionTab} from './tab_inspection/WiredMenuInspectionTab';
import {WiredMenuChestsTab} from './tab_chests/WiredMenuChestsTab';
import {WiredMenuSettingsTab} from './tab_settings/WiredMenuSettingsTab';
import {WiredMenuInfoTab} from './tab_info/WiredMenuInfoTab';

/**
 * WiredMenuTabConfigs — the ordered registry of the six wired-menu tabs. The order here is the tab
 * display order; the info tab is registered disabled (isEnabled=false) so it participates in layout
 * but is not selectable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/WiredMenuTabConfigs.as
 */
export class WiredMenuTabConfigs
{
    // AS3: WiredMenuTabConfigs.as::TAB_MONITOR_ID
    static readonly TAB_MONITOR_ID: string = 'monitor';

    // AS3: WiredMenuTabConfigs.as::TAB_OVERVIEW_ID
    static readonly TAB_OVERVIEW_ID: string = 'variable_overview';

    // AS3: WiredMenuTabConfigs.as::TAB_INSPECTION_ID
    static readonly TAB_INSPECTION_ID: string = 'inspection';

    // AS3: WiredMenuTabConfigs.as::TAB_CHESTS_ID
    static readonly TAB_CHESTS_ID: string = 'chests';

    // AS3: WiredMenuTabConfigs.as::TAB_SETTINGS_ID
    static readonly TAB_SETTINGS_ID: string = 'settings';

    // AS3: WiredMenuTabConfigs.as::TAB_INFO_ID
    static readonly TAB_INFO_ID: string = 'info';

    // AS3: WiredMenuTabConfigs.as::_SafeStr_9422 (name derived: the tab list)
    private _menuTabs: WiredMenuTabConfig[];

    // AS3: WiredMenuTabConfigs.as::WiredMenuTabConfigs()
    // The controller is passed through by AS3 but only used later (createTab receives it); the config
    // list itself does not read it.
    constructor(_controller: WiredMenuController)
    {
        this._menuTabs = [
            new WiredMenuTabConfig(WiredMenuTabConfigs.TAB_MONITOR_ID, WiredMenuMonitorTab),
            new WiredMenuTabConfig(WiredMenuTabConfigs.TAB_OVERVIEW_ID, WiredMenuOverviewTab),
            new WiredMenuTabConfig(WiredMenuTabConfigs.TAB_INSPECTION_ID, WiredMenuInspectionTab),
            new WiredMenuTabConfig(WiredMenuTabConfigs.TAB_CHESTS_ID, WiredMenuChestsTab),
            new WiredMenuTabConfig(WiredMenuTabConfigs.TAB_SETTINGS_ID, WiredMenuSettingsTab),
            new WiredMenuTabConfig(WiredMenuTabConfigs.TAB_INFO_ID, WiredMenuInfoTab, true, true, false)
        ];
    }

    // AS3: WiredMenuTabConfigs.as::get menuTabs()
    get menuTabs(): WiredMenuTabConfig[]
    {
        return this._menuTabs;
    }
}
