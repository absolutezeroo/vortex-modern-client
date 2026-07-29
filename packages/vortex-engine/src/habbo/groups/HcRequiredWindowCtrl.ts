import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {HabboGroupsManager} from './HabboGroupsManager';

const log = Logger.getLogger('habbo.groups.HcRequiredWindowCtrl');

/**
 * HcRequiredWindowCtrl
 *
 * Shown when the server refuses a group action for want of an active HC subscription —
 * with one of two texts depending on whether the player was trying to manage a group or
 * to join one.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/HcRequiredWindowCtrl.as
 */
export class HcRequiredWindowCtrl
{
    // AS3: .../HcRequiredWindowCtrl.as::_SafeStr_4571
    private _groupsManager: HabboGroupsManager | null;
    // AS3: .../HcRequiredWindowCtrl.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../HcRequiredWindowCtrl.as::HcRequiredWindowCtrl()
    constructor(groupsManager: HabboGroupsManager)
    {
        this._groupsManager = groupsManager;
    }

    // AS3: .../HcRequiredWindowCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._groupsManager === null;
    }

    // AS3: .../HcRequiredWindowCtrl.as::show()
    show(isManaging: boolean): void
    {
        this.prepareWindow();

        if(!this._window) return;

        const info = this._window.findChildByName('info_txt');

        if(info) info.caption = isManaging ? '${group.hcrequired.info.manage}' : '${group.hcrequired.info.join}';

        this._window.visible = true;
        this._window.activate();
    }

    // AS3: .../HcRequiredWindowCtrl.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null) return;

        const window = this._groupsManager?.getXmlWindow('club_required') as IWindowContainer | null;

        if(!window)
        {
            log.error('prepareWindow: getXmlWindow("club_required") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const closeButton = window.findChildByTag('close');

        if(closeButton) closeButton.procedure = this.onClose;

        const cancelRegion = window.findChildByName('cancel_link_region');

        if(cancelRegion) cancelRegion.procedure = this.onClose;

        const joinButton = window.findChildByName('join_button');

        if(joinButton) joinButton.procedure = this.onOpenCatalog;

        const moreInfoRegion = window.findChildByName('more_info_link_region');

        if(moreInfoRegion) moreInfoRegion.procedure = this.onOpenCatalog;

        window.center();
    }

    // AS3: .../HcRequiredWindowCtrl.as::onClose()
    private onClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK') this.close();
    };

    // AS3: .../HcRequiredWindowCtrl.as::onOpenCatalog()
    private onOpenCatalog = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._groupsManager?.openVipPurchase('HcRequiredWindowCtrl');
        this.close();
    };

    // AS3: .../HcRequiredWindowCtrl.as::close()
    close(): void
    {
        if(this._window !== null) this._window.visible = false;
    }

    // AS3: .../HcRequiredWindowCtrl.as::dispose()
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
