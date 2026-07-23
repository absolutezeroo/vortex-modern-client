import type {IDisposable} from '@core/runtime/IDisposable';

/**
 * IWiredMenuTab — the contract every wired-menu tab implements: activation/deactivation hooks,
 * viewing lifecycle (called when the tab's container is shown/hidden), and a permissions-changed
 * notification. Extends IDisposable.
 *
 * Name derived: fully obfuscated in AS3 (interface `_SafeCls_2512`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/_SafeCls_2512.as
 */
export interface IWiredMenuTab extends IDisposable
{
    // AS3: _SafeCls_2512.as::setTabActive()
    setTabActive(): void;

    // AS3: _SafeCls_2512.as::setTabInactive()
    setTabInactive(): void;

    // AS3: _SafeCls_2512.as::startViewing()
    startViewing(): void;

    // AS3: _SafeCls_2512.as::stopViewing()
    stopViewing(): void;

    // AS3: _SafeCls_2512.as::permissionsUpdated()
    permissionsUpdated(): void;
}
