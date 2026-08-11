import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {QuitMessageComposer} from '@habbo/communication/messages/outgoing/room/session/QuitMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {UpdatingTimeStampWidget} from '@habbo/window/widgets/UpdatingTimeStampWidget';
import {PendingGuideTicket} from '@habbo/communication/messages/parser/help/PendingGuideTicket';

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

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::_SafeStr_5122
    // Name DERIVED: obfuscated in every tree. The "you already have a ticket open" window.
    private _pendingRequestWindow: IWindowContainer | null = null;

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
	 * Show the guide ticket the player already has open.
	 *
	 * One of four layouts, chosen by `isGuide` first and `type` second — a guide always sees the
	 * plain "session in progress" window and nothing about the other party, which is why the
	 * populate step returns early for them rather than reading fields the wire did not send.
	 *
	 * Nothing calls this on the current server: `vortex-emulator`'s
	 * `GuideReportingStatusMessageComposer` is an empty record and its handler a no-op, so status 1
	 * never arrives. Ported anyway — the read side has to exist before the write side can be
	 * checked against it, and this is the half that can be got right from the source alone.
	 *
	 * @param pendingTicket The ticket payload from the guide-reporting status message
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/guidehelp/HelpController.as::showPendingTicket()
    showPendingTicket(pendingTicket: PendingGuideTicket | null): void
    {
        if(pendingTicket == null) return;

        let layoutName: string;

        if(pendingTicket.isGuide)
        {
            layoutName = 'pending_guide_session';
        }
        else
        {
            switch(pendingTicket.type)
            {
                case PendingGuideTicket.TYPE_TOUR:
                case PendingGuideTicket.TYPE_TOUR_ALT:
                    layoutName = 'pending_tour_request';
                    break;
                case PendingGuideTicket.TYPE_INSTRUCTIONS:
                    layoutName = 'pending_instructions_request';
                    break;
                case PendingGuideTicket.TYPE_BULLY:
                    layoutName = 'pending_bully_request';
                    break;
                default:
                    return;
            }
        }

        this._pendingRequestWindow = this._habboHelp?.getXmlWindow(layoutName) as IWindowContainer | null;

        if(this._pendingRequestWindow == null)
        {
            log.warn(`showPendingTicket: no layout "${layoutName}" - the open-ticket window did not appear`);

            return;
        }

        this._pendingRequestWindow.center();
        this._pendingRequestWindow.procedure = this.onPendingRequestEvent;

        if(pendingTicket.isGuide) return;

        const ageMs = new Date().getTime() - (pendingTicket.secondsAgo * 1000);

        switch(pendingTicket.type)
        {
            case PendingGuideTicket.TYPE_INSTRUCTIONS:
            {
                const description = this._pendingRequestWindow.findChildByName('description');

                if(description) description.caption = pendingTicket.description;

                this.setTimeStamp(ageMs);

                break;
            }
            case PendingGuideTicket.TYPE_BULLY:
            {
                const userName = this._pendingRequestWindow.findChildByName('user_name');

                if(userName) userName.caption = pendingTicket.otherPartyName;

                const avatar = (this._pendingRequestWindow.findChildByName('user_avatar') as unknown as IWidgetWindow | null)?.widget as IAvatarImageWidget | null;

                if(avatar) avatar.figure = pendingTicket.otherPartyFigure;

                this.setTimeStamp(ageMs);

                this._habboHelp?.localization?.registerParameter('guide.pending.bully.room', 'room', pendingTicket.roomName);

                break;
            }
        }
    }

    // TS-only: the timestamp lookup AS3 repeats inline in both populated branches.
    private setTimeStamp(timeStamp: number): void
    {
        const widget = (this._pendingRequestWindow?.findChildByName('timestamp') as unknown as IWidgetWindow | null)?.widget as UpdatingTimeStampWidget | null;

        if(widget) widget.timeStamp = timeStamp;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/HelpController.as::onPendingReuqestEvent()
    // The AS3 method name is misspelled ("Reuqest"); corrected here, since nothing matches on it.
    private onPendingRequestEvent = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(target?.name)
        {
            case 'header_button_close':
            case 'close_button':
                if(this._pendingRequestWindow != null && !this._pendingRequestWindow.disposed)
                {
                    this._pendingRequestWindow.dispose();
                    this._pendingRequestWindow = null;
                }
        }
    };

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
