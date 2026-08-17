/**
 * CitizenshipPopupController — the one-time "become a citizen" modal a brand-new user gets.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/talent/CitizenshipPopupController.as
 *
 * It waits for the first room entry, then ten seconds more, then shows itself once and
 * unsubscribes. The close button is deliberately hidden — the only ways out are the two buttons in
 * the layout, which is why `hide()` is what both cases call.
 */
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import {
    RoomEntryInfoMessageEvent
} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';
import {GetTalentTrackMessageComposer} from '@habbo/communication/messages/outgoing/talent/GetTalentTrackMessageComposer';
import {TalentEnum} from '@habbo/session/enum/TalentEnum';
import type {HabboTalent} from './HabboTalent';

export class CitizenshipPopupController
{
    /** AS3's literal `10000` — the delay after room entry before the popup appears. */
    // AS3: CitizenshipPopupController.as::onRoomEnter()
    private static readonly POPUP_DELAY_MS: number = 10000;

    // AS3: CitizenshipPopupController.as::_habboTalent
    private _habboTalent: HabboTalent | null;

    /** Derived name — `_SafeStr_4929`: the modal. */
    // AS3: CitizenshipPopupController.as::_SafeStr_4929
    private _modal: IModalDialog | null = null;

    // AS3: CitizenshipPopupController.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_7317`: the room-entry subscription, kept so it can be removed. */
    // AS3: CitizenshipPopupController.as::_SafeStr_7317
    private _roomEnterEvent: IMessageEvent | null = null;

    /** Derived name — `_SafeStr_9349`: set once the popup has been shown, so it never repeats. */
    // AS3: CitizenshipPopupController.as::_SafeStr_9349
    private _shown: boolean = false;

    // TS-only: AS3 uses a one-shot `flash.utils.Timer`; this is its handle.
    private _timer: ReturnType<typeof setTimeout> | null = null;

    // AS3: CitizenshipPopupController.as::CitizenshipPopupController()
    constructor(habboTalent: HabboTalent)
    {
        this._habboTalent = habboTalent;
        this._roomEnterEvent = new RoomEntryInfoMessageEvent(this.onRoomEnter);

        habboTalent.communicationManager?.addMessageEvent(this._roomEnterEvent);
    }

    // AS3: CitizenshipPopupController.as::onRoomEnter()
    private onRoomEnter = (): void =>
    {
        if(this._habboTalent?.newIdentity
            && !this._shown
            && this._habboTalent.getBoolean('new.user.citizenship.popup.enabled'))
        {
            this._timer = setTimeout(this.onCitizenshipPopup, CitizenshipPopupController.POPUP_DELAY_MS);
        }
    };

    // AS3: CitizenshipPopupController.as::onCitizenshipPopup()
    private onCitizenshipPopup = (): void =>
    {
        this._timer = null;

        this.removeRoomEnterListener();
        this.show();

        this._shown = true;
    };

    // AS3: CitizenshipPopupController.as::removeRoomEnterListener()
    private removeRoomEnterListener(): void
    {
        if(this._habboTalent !== null && !this._habboTalent.disposed && this._roomEnterEvent !== null)
        {
            this._habboTalent.communicationManager?.removeMessageEvent(this._roomEnterEvent);
        }

        this._roomEnterEvent = null;
    }

    // AS3: CitizenshipPopupController.as::show()
    public show(): void
    {
        this.hide();

        this._modal = this._habboTalent?.getModalXmlWindow('citizenship_welcome') ?? null;

        const root = this._modal?.rootWindow ?? null;

        if(root === null) return;

        root.procedure = this.onWindowEvent;

        const close = (root as unknown as IWindowContainer).findChildByName('header_button_close');

        if(close !== null) close.visible = false;
    }

    // AS3: CitizenshipPopupController.as::hide()
    private hide(): void
    {
        if(this._modal !== null && !this._modal.disposed)
        {
            this._modal.dispose();
            this._modal = null;
        }
    }

    // AS3: CitizenshipPopupController.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: CitizenshipPopupController.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(this._modal === null || this._modal.disposed || event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'postpone_citizenship':
                this.hide();
                break;

            case 'show_citizenship':
                this.hide();
                this._habboTalent?.tracking?.trackTalentTrackOpen(TalentEnum.CITIZENSHIP, 'citizenshippopup');
                this._habboTalent?.send(new GetTalentTrackMessageComposer(TalentEnum.CITIZENSHIP));
                break;
        }
    };

    /**
     * AS3 never sets `_disposed` here, so a second call repeats the work — harmless, since both
     * halves are idempotent, but the flag it reads is left false on purpose and this port keeps it.
     */
    // AS3: CitizenshipPopupController.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._timer !== null)
        {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this.hide();
        this.removeRoomEnterListener();

        this._habboTalent = null;
    }
}
