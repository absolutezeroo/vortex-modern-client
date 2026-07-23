import {Component} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import type {IVariableManagementOverviewController} from './IVariableManagementOverviewController';

/**
 * VariableManagementOverviewController — DI component for the "manage user variables" overview window
 * (list of the room's saved user variables, with create/rename/delete flows).
 *
 * TODO(AS3): SPINE STUB. The real controller is 251 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/overview/VariableManagementOverviewController.as
 * — full DI dependencies, a WiredUserVariablesPage parser (_SafeCls_2492), and a
 * VariableManagementOverviewView. Only the ctor/dispose surface WiredMenuController owns is wired
 * here; the view and message handling are unported.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/overview/VariableManagementOverviewController.as
 */
export class VariableManagementOverviewController extends Component implements IVariableManagementOverviewController
{
    // AS3: VariableManagementOverviewController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: VariableManagementOverviewController.as::_disposed
    private _wiredDisposed: boolean = false;

    // AS3: VariableManagementOverviewController.as::VariableManagementOverviewController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
        this._roomEvents = roomEvents;
        // TODO(AS3): real ctor registers `new _SafeCls_2492(onGetPage)` (WiredUserVariablesPage handler).
    }

    // AS3: VariableManagementOverviewController.as::dispose()
    override dispose(): void
    {
        if(this._wiredDisposed)
        {
            return;
        }

        this._wiredDisposed = true;
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        super.dispose();
    }

    // AS3: VariableManagementOverviewController.as::get disposed()
    override get disposed(): boolean
    {
        return this._wiredDisposed;
    }
}
