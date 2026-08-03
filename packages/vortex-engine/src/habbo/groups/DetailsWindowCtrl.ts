import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {HabboGroupDetailsData} from '@habbo/communication/messages/incoming/users/HabboGroupDetailsData';
import {GroupDetailsCtrl} from './GroupDetailsCtrl';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('habbo.groups.DetailsWindowCtrl');

/**
 * DetailsWindowCtrl
 *
 * The standalone group window: a frame whose whole body is a `GroupDetailsCtrl` card.
 *
 * It reacts to every incoming group-details message, but only opens on the ones that ask
 * for it (`openDetails`); the rest refresh the card if — and only if — the window is
 * already up and showing that same group, so a details reply fetched for the toolbar
 * panel or a profile never pops a window at the player.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/DetailsWindowCtrl.as
 */
export class DetailsWindowCtrl
{
    // AS3: .../DetailsWindowCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;

    // AS3: .../DetailsWindowCtrl.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: .../DetailsWindowCtrl.as::_SafeStr_6738
    private _groupDetailsCtrl: GroupDetailsCtrl | null;

    // AS3: .../DetailsWindowCtrl.as::_groupId
    private _groupId: number = 0;

    // AS3: .../DetailsWindowCtrl.as::DetailsWindowCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
        this._groupDetailsCtrl = new GroupDetailsCtrl(groupsManager, true);
    }

    // AS3: .../DetailsWindowCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: .../DetailsWindowCtrl.as::isDisplayingGroup()
    isDisplayingGroup(groupId: number): boolean
    {
        return this._window !== null && this._window.visible && groupId === this._groupId;
    }

    // AS3: .../DetailsWindowCtrl.as::onGroupDetails()
    onGroupDetails(group: HabboGroupDetailsData): void
    {
        const alreadyShowing = this._window !== null && this._window.visible && group.groupId === this._groupId;

        if(!alreadyShowing && !group.openDetails) return;

        this._groupId = group.groupId;

        this.prepareWindow();

        const container = this._window?.findChildByName('group_cont') as IWindowContainer | null;

        if(container === null)
        {
            log.warn('onGroupDetails: group_info_window has no "group_cont" child');

            return;
        }

        this._groupDetailsCtrl?.onGroupDetails(container, group);

        if(group.openDetails && this._window !== null)
        {
            this._window.visible = true;
            this._window.activate();
        }
    }

    // AS3: .../DetailsWindowCtrl.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null) return;

        const window = this._groupsManager?.getXmlWindow('group_info_window') as IFrameWindow | null;

        if(!window)
        {
            log.error('prepareWindow: getXmlWindow("group_info_window") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const closeButton = window.findChildByTag('close');

        if(closeButton) closeButton.procedure = this.onClose;

        window.center();
    }

    // AS3: .../DetailsWindowCtrl.as::onClose()
    private onClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.close();
    };

    /** Hidden, never disposed: the card and its bindings are built once and reused. */
    // AS3: .../DetailsWindowCtrl.as::close()
    close(): void
    {
        if(this._window === null) return;

        this._groupId = 0;
        this._window.visible = false;
    }

    // AS3: .../DetailsWindowCtrl.as::onGroupDeactivated()
    onGroupDeactivated(groupId: number): void
    {
        if(this._groupId === groupId) this.close();
    }

    // AS3: .../DetailsWindowCtrl.as::dispose()
    dispose(): void
    {
        this._groupsManager = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._groupDetailsCtrl)
        {
            this._groupDetailsCtrl.dispose();
            this._groupDetailsCtrl = null;
        }
    }
}
