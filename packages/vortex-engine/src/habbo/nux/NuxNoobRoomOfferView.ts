import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboNuxDialogs} from './HabboNuxDialogs';

/**
 * The "come to the noob lobby" nag, parked in the top-left corner rather than centred.
 *
 * Opened either by the `nux/lobbyoffer/show` link event or by the timer `HabboNuxDialogs` arms
 * when a real noob enters their home room. Its Go button fires a navigator link rather than
 * talking to the component.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/nux/NuxNoobRoomOfferView.as
 */
export class NuxNoobRoomOfferView
{
    // AS3: .../nux/NuxNoobRoomOfferView.as::_frame
    private _frame: IWindowContainer | null = null;

    // AS3: .../nux/NuxNoobRoomOfferView.as::_SafeStr_4617
    private _nuxDialogs: HabboNuxDialogs | null;

    // AS3: .../nux/NuxNoobRoomOfferView.as::NuxNoobRoomOfferView()
    constructor(nuxDialogs: HabboNuxDialogs)
    {
        this._nuxDialogs = nuxDialogs;

        this.show();
    }

    // AS3: .../nux/NuxNoobRoomOfferView.as::show()
    private show(): void
    {
        if(this._frame != null) return;

        this._frame = this._nuxDialogs?.windowManager
            ?.buildWidgetLayout('nux_noob_room_offer_xml') as IWindowContainer | null ?? null;

        if(this._frame == null)
        {
            throw new Error('Failed to construct window from XML!');
        }

        this._frame.y = 20;
        this._frame.x = 20;

        this._frame.findChildByName('btnGo')?.addEventListener(
            WindowMouseEvent.CLICK,
            () => { this.onGo(); }
        );
        this._frame.findChildByTag('close')?.addEventListener(
            WindowMouseEvent.CLICK,
            () => { this.onClose(); }
        );
    }

    /**
     * AS3: .../nux/NuxNoobRoomOfferView.as::hide()
     *
     * Dead in AS3, and wrong where it stands: nothing calls it, and it destroys the *phone-offer*
     * view rather than this one — a copy-paste leftover from `NuxOfferOldUserView`, whose `hide()`
     * is identical. `onClose()` below is what actually closes this view. Ported unchanged so the
     * class's member list matches the source.
     */
    // AS3: .../src/com/sulake/habbo/nux/NuxNoobRoomOfferView.as::hide()
    private hide(): void
    {
        this._nuxDialogs?.destroyNuxOfferView();
    }

    /**
     * AS3: .../nux/NuxNoobRoomOfferView.as::onGo()
     *
     * Leaves the view standing — the link event takes the player out of the room, and the
     * resulting RSE_ENDED is what tears it down.
     */
    // AS3: .../src/com/sulake/habbo/nux/NuxNoobRoomOfferView.as::onGo()
    private onGo(): void
    {
        this._nuxDialogs?.context.createLinkEvent('navigator/goto/predefined_noob_lobby');
    }

    // AS3: .../nux/NuxNoobRoomOfferView.as::onClose()
    private onClose(): void
    {
        this._nuxDialogs?.destroyNoobRoomOfferView();
    }

    // AS3: .../nux/NuxNoobRoomOfferView.as::dispose()
    dispose(): void
    {
        if(this._frame)
        {
            this._frame.dispose();
            this._frame = null;
        }

        this._nuxDialogs = null;
    }
}
