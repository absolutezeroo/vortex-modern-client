import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {GetHabboGroupDetailsMessageComposer} from '@habbo/communication/messages/outgoing/users/GetHabboGroupDetailsMessageComposer';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('habbo.groups.GroupCreatedWindowCtrl');

/**
 * GroupCreatedWindowCtrl
 *
 * The congratulations window shown once the server confirms the purchase. Closing it
 * requests the new group's details, which is what opens its info panel straight after.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/GroupCreatedWindowCtrl.as
 */
export class GroupCreatedWindowCtrl
{
    // AS3: .../GroupCreatedWindowCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../GroupCreatedWindowCtrl.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: .../GroupCreatedWindowCtrl.as::_groupId
    private _groupId: number = 0;

    // AS3: .../GroupCreatedWindowCtrl.as::GroupCreatedWindowCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
    }

    // AS3: .../GroupCreatedWindowCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: .../GroupCreatedWindowCtrl.as::show()
    show(groupId: number): void
    {
        this._groupId = groupId;

        this.prepareWindow();

        if(!this._window) return;

        this._window.visible = true;
        this._window.activate();
    }

    // AS3: .../GroupCreatedWindowCtrl.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null) return;

        const window = this._groupsManager?.getXmlWindow('group_created_window') as IWindowContainer | null;

        if(!window)
        {
            log.error('prepareWindow: getXmlWindow("group_created_window") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const closeButton = window.findChildByTag('close');

        if(closeButton) closeButton.procedure = this.onClose;

        const okButton = window.findChildByName('ok_button');

        if(okButton) okButton.procedure = this.onClose;

        window.center();
    }

    // AS3: .../GroupCreatedWindowCtrl.as::onClose()
    private onClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.close();
        this._groupsManager?.send(new GetHabboGroupDetailsMessageComposer(this._groupId, false));
    };

    // AS3: .../GroupCreatedWindowCtrl.as::close()
    close(): void
    {
        if(this._window !== null) this._window.visible = false;
    }

    // AS3: .../GroupCreatedWindowCtrl.as::dispose()
    dispose(): void
    {
        this._groupsManager = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
