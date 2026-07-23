import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';

/**
 * WiredMenuSettingsTab — the "settings" tab: the wired preferences UI (menu/inspect buttons,
 * play-test mode, whisper suppression, notification level, UI style) that reads/writes the account
 * preferences via the controller.
 *
 * TODO(AS3): STUB. The real tab is 471 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_settings/WiredMenuSettingsTab.as
 * — it wires every preference checkbox/dropdown to the controller and pushes changes via
 * sendPreferences(). Only the base-tab lifecycle + the updatePreferencesUI() entry point the
 * controller calls after a play-test toggle are wired here.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_settings/WiredMenuSettingsTab.as
 */
export class WiredMenuSettingsTab extends WiredMenuDefaultTab
{
    // AS3: WiredMenuSettingsTab.as::WiredMenuSettingsTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
    }

    // AS3: WiredMenuSettingsTab.as::updatePreferencesUI()
    updatePreferencesUI(): void
    {
        // TODO(AS3): re-sync every preference control from the controller's current preference state.
    }
}
