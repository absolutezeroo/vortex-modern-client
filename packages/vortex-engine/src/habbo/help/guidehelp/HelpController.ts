import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {QuitMessageComposer} from '@habbo/communication/messages/outgoing/room/session/QuitMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';

import type {GuideHelpManager} from '../GuideHelpManager';
import type {HabboHelp} from '../HabboHelp';

const log = Logger.getLogger('habbo.help.guidehelp.HelpController');

/**
 * The main help window and the new-user tour popup
 *
 * Two unrelated windows sharing a controller because both are entry points into the guide system:
 * `main_help` is the menu the help icon opens, and `welcome_tour_popup` is the unprompted offer of
 * a guided tour that appears shortly after a new player enters their first room.
 *
 * Every button in both windows reports to Google Analytics before acting. The tour popup's events
 * additionally carry how long the popup was on screen, which is why it records the time it opened.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/guidehelp/HelpController.as
 */
export class HelpController
{
    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::_guideHelp
    private _guideHelp: GuideHelpManager | null;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::_mainHelpDialog
    // Name derived (`_SafeStr_5179`): the `main_help` modal this controller owns.
    private _mainHelpDialog: IModalDialog | null = null;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::_tourPopup
    private _tourPopup: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::_tourPopupShowTime
    private _tourPopupShowTime: number = 0;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::HelpController()
    constructor(guideHelp: GuideHelpManager)
    {
        this._habboHelp = guideHelp.habboHelp;
        this._guideHelp = guideHelp;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Open the main help menu
	 */
    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::openWindow()
    openWindow(): void
    {
        if(this._mainHelpDialog !== null || this.disposed) return;

        const dialog = this._habboHelp?.getModalXmlWindow('main_help') ?? null;

        if(!dialog)
        {
            log.error('openWindow: getModalXmlWindow("main_help") returned null - layout not registered?');

            return;
        }

        this._mainHelpDialog = dialog;

        if(this._mainHelpDialog.rootWindow) this._mainHelpDialog.rootWindow.procedure = this.windowEventProcedure;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::closeWindow()
    closeWindow(): void
    {
        if(this._mainHelpDialog === null) return;

        this._mainHelpDialog.dispose();
        this._mainHelpDialog = null;
    }

    /**
	 * The main help menu's buttons
	 */
    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::windowEventProcedure()
    private windowEventProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'header_button_close':
                this.closeWindow();
                break;

            case 'tour_button':
                // A brand-new identity gets the full tour (0); an older account that asked for
                // help gets the shorter one (2).
                this._guideHelp?.createHelpRequest(this._habboHelp?.newIdentity ? 0 : 2);
                this._habboHelp?.trackGoogle('helpWindow', 'click_userTour');
                this.closeWindow();
                break;

            case 'bully_button':
                this.closeWindow();
                this._habboHelp?.toggleNewHelpWindow();
                this._habboHelp?.trackGoogle('helpWindow', 'click_reportBully');
                break;

            case 'instructions_button':
                this._guideHelp?.createHelpRequest(1);
                this._habboHelp?.trackGoogle('helpWindow', 'click_instructions');
                this.closeWindow();
                break;

            case 'self_help_link':
                HabboWebTools.openWebPage(this._habboHelp?.getProperty('zendesk.url') ?? '', 'habboMain');
                this._habboHelp?.trackGoogle('helpWindow', 'click_selfHelp');
                this.closeWindow();
                break;

            case 'habboway_link':
                // The in-client Habbo Way viewer when the hotel ships one, the web page otherwise.
                if(this._habboHelp?.getBoolean('habboway.enabled')) this._habboHelp.showHabboWay();
                else HabboWebTools.openWebPage(this._habboHelp?.getProperty('habboway.url') ?? '', 'habboMain');

                this._habboHelp?.trackGoogle('helpWindow', 'click_habboWay');
                this.closeWindow();
                break;

            case 'safetybooklet_link':
                this._habboHelp?.showSafetyBooklet();
                this._habboHelp?.trackGoogle('helpWindow', 'click_showSafetyBooklet');
                this.closeWindow();
                break;

            case 'emergency_button':
            {
                // The form carries a "leave the room as well" checkbox; honouring it means
                // quitting the room before the report window opens.
                const root = this._mainHelpDialog?.rootWindow as IWindowContainer | null;
                const leaveRoom = root?.findChildByName('leave_room') as unknown as ISelectableWindow | null;

                if(leaveRoom?.isSelected) this._habboHelp?.sendMessage(new QuitMessageComposer());

                this.closeWindow();
                this._habboHelp?.startEmergencyRequest();
                this._habboHelp?.trackGoogle('helpWindow', 'click_emergency');
                break;
            }
        }
    };

    /**
	 * Offer the new player a guided tour
	 *
	 * Sits high on the screen rather than centred — a quarter of the way down — so it does not
	 * cover the room the player just walked into.
	 */
    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::openTourPopup()
    openTourPopup(): void
    {
        if(this._tourPopup !== null || this.disposed) return;

        const popup = this._habboHelp?.getXmlWindow('welcome_tour_popup') as IWindowContainer | null;

        if(!popup)
        {
            log.error('openTourPopup: getXmlWindow("welcome_tour_popup") returned null - layout not registered?');

            return;
        }

        // AS3 reads Flash's `getTimer()`, milliseconds since the player started. Only differences
        // between two reads are ever used, so any monotonic clock does.
        this._tourPopupShowTime = performance.now();

        this._tourPopup = popup;
        this._tourPopup.center();
        this._tourPopup.y *= 0.25;
        this._tourPopup.procedure = this.tourPopupEventProcedure;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::closeTourPopup()
    private closeTourPopup(): void
    {
        if(this._tourPopup === null) return;

        this._tourPopup.dispose();
        this._tourPopup = null;
    }

    /**
	 * The tour popup's three outcomes, each tracked with how long it was on screen
	 */
    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::tourPopupEventProcedure()
    private tourPopupEventProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || event.type !== 'WME_CLICK') return;

        // Ported as written, sign included: AS3 computes `showTime - now`, so this is negative —
        // seconds on screen, counted downwards. Changing it would change what the analytics
        // backend receives.
        const secondsOnScreen = Math.trunc((this._tourPopupShowTime - performance.now()) / 1000);

        switch(window.name)
        {
            case 'refuse_tour':
                this._habboHelp?.tracking?.trackEventLog('Help', '', 'tour.new_user.cancel', '', secondsOnScreen);
                this._habboHelp?.trackGoogle('newbieTourWindow', 'click_refuseTour');
                this.closeTourPopup();
                break;

            case 'header_button_close':
                this._habboHelp?.tracking?.trackEventLog('Help', '', 'tour.new_user.dismiss', '', secondsOnScreen);
                this._habboHelp?.trackGoogle('newbieTourWindow', 'click_closeWindow');
                this.closeTourPopup();
                break;

            case 'take_tour':
                this._guideHelp?.createHelpRequest(0);
                this._habboHelp?.tracking?.trackEventLog('Help', '', 'tour.new_user.accept', '', secondsOnScreen);
                this._habboHelp?.trackGoogle('newbieTourWindow', 'click_acceptTour');
                this.closeTourPopup();
                break;
        }
    };

    /**
	 * Show the guide ticket the player already has open
	 *
	 * @param pendingTicket The ticket payload from the guide-reporting status message
	 */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/guidehelp/HelpController.as::showPendingTicket()
    // picks one of four layouts off `isGuide` and `type` — pending_guide_session,
    // pending_tour_request, pending_instructions_request, pending_bully_request, all four of which
    // ship — and fills the last two from the ticket's description, other-party name and figure,
    // room name and age. The blocker is the payload, not the windows: its AS3 type
    // (`_SafePkg_2970._SafeCls_2969`) is unported, and `GuideReportingStatusMessageParser` does not
    // read a `pendingTicket` field off the wire, so there is nothing to pass in. Porting the DTO
    // and widening that parser comes first; `HabboHelp.handleGuideReportingStatus()` documents the
    // same gap from the other end.
    showPendingTicket(pendingTicket: unknown): void
    {
        log.warn('showPendingTicket: the ticket payload is not parsed yet', pendingTicket);
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.closeWindow();
        this.closeTourPopup();

        this._habboHelp = null;
        this._guideHelp = null;
        this._disposed = true;
    }
}
