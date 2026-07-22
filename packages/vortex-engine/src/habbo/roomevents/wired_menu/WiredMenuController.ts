import {Component} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';

/**
 * WiredMenuController — the room-events menu controller (permissions, monitor/settings/variables
 * tabs, room logs, play-test mode).
 *
 * TODO(AS3): STUB for the wired_menu bloc (out of scope for the wired_setup milestone). The real
 * controller is 657 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/WiredMenuController.as
 * It is stubbed here because the HabboUserDefinedRoomEvents component and WiredEnvironment read its
 * read/write permission surface. The permission flow IS ported (isEnabled / hasRead/WritePermission /
 * isRoomOwnerOrStaff / applyPermissions from WiredPermissionsEvent); the rest (menu tabs, monitor,
 * variables management, chests, play-test UI) remains a no-op stub. Do not treat those as ported.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/WiredMenuController.as
 */
export class WiredMenuController extends Component
{
    // AS3: WiredMenuController.as::_roomEvents (parent wired component)
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredMenuController.as::_canModify (from WiredPermissionsEvent)
    private _canModify: boolean = false;

    // AS3: WiredMenuController.as::_canRead (from WiredPermissionsEvent)
    private _canRead: boolean = false;

    // AS3: WiredMenuController.as::wiredWhisperDisabled (backing field)
    private _wiredWhisperDisabled: boolean = false;

    // AS3: WiredMenuController.as::playTestMode (backing field)
    private _playTestMode: boolean = false;

    // AS3: WiredMenuController.as::WiredMenuController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
        this._roomEvents = roomEvents;
    }

    // AS3: WiredMenuController.as::onWiredPermissions()
    // Applies the WiredPermissionsEvent payload. Registered via the wired IncomingMessages hub (the
    // port centralises wired incoming handlers there; AS3 registers it in this controller's ctor).
    // TODO(AS3): AS3 also notifies wiredChest.onPermissionsChanged() (wired_menu bloc, not ported).
    applyPermissions(canModify: boolean, canRead: boolean): void
    {
        this._canModify = canModify;
        this._canRead = canRead;
    }

    // AS3: WiredMenuController.as::get isEnabled()
    get isEnabled(): boolean
    {
        return this.getBoolean('wired.menu.enabled');
    }

    // AS3: WiredMenuController.as::isRoomOwnerOrStaff()
    isRoomOwnerOrStaff(): boolean
    {
        const session = this._roomEvents.roomSession;

        if(session == null)
        {
            return false;
        }

        const hasStaff = this._roomEvents.sessionDataManager?.hasSecurity(4) ?? false;

        return hasStaff || session.isRoomOwner;
    }

    // AS3: WiredMenuController.as::get hasReadPermission()
    get hasReadPermission(): boolean
    {
        if(this.isRoomOwnerOrStaff())
        {
            return true;
        }

        return this._canRead;
    }

    // AS3: WiredMenuController.as::get hasWritePermission()
    get hasWritePermission(): boolean
    {
        if(this.isRoomOwnerOrStaff())
        {
            return true;
        }

        return this._canModify;
    }

    // AS3: WiredMenuController.as::get wiredMenuButton()
    get wiredMenuButton(): boolean
    {
        // TODO(AS3): wired_menu bloc.
        return false;
    }

    // AS3: WiredMenuController.as::get wiredInspectButton()
    get wiredInspectButton(): boolean
    {
        // TODO(AS3): wired_menu bloc.
        return false;
    }

    // AS3: WiredMenuController.as::get wiredWhisperDisabled()
    get wiredWhisperDisabled(): boolean
    {
        return this._wiredWhisperDisabled;
    }

    // AS3: WiredMenuController.as::set wiredWhisperDisabled()
    set wiredWhisperDisabled(value: boolean)
    {
        // TODO(AS3): wired_menu bloc — real setter also notifies the whisper widget.
        this._wiredWhisperDisabled = value;
    }

    // AS3: WiredMenuController.as::get playTestMode()
    get playTestMode(): boolean
    {
        return this._playTestMode;
    }

    // AS3: WiredMenuController.as::setPlayTestMode()
    setPlayTestMode(value: boolean, _sendToServer: boolean = false, _updateUI: boolean = false): void
    {
        // TODO(AS3): wired_menu bloc — real impl syncs server + UI.
        this._playTestMode = value;
    }

    // AS3: WiredMenuController.as::toggleView()
    toggleView(): void
    {
        // TODO(AS3): wired_menu bloc — open/close the wired menu window.
    }

    // AS3: WiredMenuController.as::furniSelected()
    furniSelected(_id: number): void
    {
        // TODO(AS3): wired_menu bloc.
    }

    // AS3: WiredMenuController.as::userSelected()
    userSelected(_id: number): void
    {
        // TODO(AS3): wired_menu bloc.
    }

    // AS3: WiredMenuController.as::hasUIOpen()
    hasUIOpen(): boolean
    {
        // TODO(AS3): wired_menu bloc.
        return false;
    }
}
