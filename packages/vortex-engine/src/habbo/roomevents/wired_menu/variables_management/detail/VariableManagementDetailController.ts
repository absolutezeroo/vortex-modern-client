import {Component} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import type {IVariableManagementDetailController} from './IVariableManagementDetailController';

/**
 * VariableManagementDetailController — DI component for the per-variable detail window (edit a single
 * permanent user variable: value, config, permissions).
 *
 * TODO(AS3): SPINE STUB. The real controller is 267 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/detail/VariableManagementDetailController.as
 * — full DI dependencies, WiredUserPermanentVariablesList parsers (_SafeCls_3146/_SafeCls_2757), and a
 * VariableManagementDetailView. Only the ctor/dispose surface WiredMenuController owns is wired here;
 * the view and message handling are unported.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/detail/VariableManagementDetailController.as
 */
export class VariableManagementDetailController extends Component implements IVariableManagementDetailController
{
    // AS3: VariableManagementDetailController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: VariableManagementDetailController.as::_disposed
    private _wiredDisposed: boolean = false;

    // AS3: VariableManagementDetailController.as::VariableManagementDetailController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
        this._roomEvents = roomEvents;
        // TODO(AS3): real ctor registers the permanent-variables page/detail handlers.
    }

    // AS3: VariableManagementDetailController.as::dispose()
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

    // AS3: VariableManagementDetailController.as::get disposed()
    override get disposed(): boolean
    {
        return this._wiredDisposed;
    }
}
