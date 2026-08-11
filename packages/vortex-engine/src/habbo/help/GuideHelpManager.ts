import {ChatReviewReporterFeedbackCtrl} from './ChatReviewReporterFeedbackCtrl';
import {HelpController} from './guidehelp/HelpController';
import {GuideSessionData} from './GuideSessionData';
import {Logger} from '@core/utils/Logger';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.GuideHelpManager');

/**
 * Guide help coordination manager
 *
 * In AS3 this class holds almost no logic of its own: it is a façade over three sub-controllers
 * and forwards to them. Two of the three are ported:
 *
 * - `guidehelp/HelpController.as` (271 lines) — the main help menu and the new-user tour popup.
 *   Backs `openTourPopup()` and `showPendingTicket()`. **Ported**, except the pending-ticket view,
 *   which waits on a payload the wire parser does not read yet.
 * - `ChatReviewReporterFeedbackCtrl.as` (117 lines) — the post-report feedback panel. Backs
 *   `showFeedback()`. **Ported.**
 * - `guidehelp/GuideSessionController.as` (1,826 lines) — the guide tool, help requests and the
 *   whole guide-session conversation. Backs `showGuideTool()`, `createHelpRequest()` and
 *   `openReportWindow()`. **Unported**, and the one thing still standing between a guide report
 *   and a working guide system.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/GuideHelpManager.as
 */
export class GuideHelpManager
{
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::GuideHelpManager()
    // AS3 also constructs the three sub-controllers listed in the class header and subscribes
    // `onRoomEnter` (the new-user tour timer) here; both wait on those controllers.
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
        this._guideData = new GuideSessionData();
        this._reporterFeedbackCtrl = new ChatReviewReporterFeedbackCtrl(habboHelp);
        this._helpController = new HelpController(this);

        log.debug('GuideHelpManager initialized');
    }

    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::_reporterFeedbackCtrl
    private _reporterFeedbackCtrl: ChatReviewReporterFeedbackCtrl | null;

    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::_helpController
    private _helpController: HelpController | null;

    /**
	 * The post-report feedback panel
	 */
    // TS-only: AS3 keeps this private and only reaches it through `showFeedback()`. Exposed here
    // because `HelpMessageHandler` owns the two ticket subscriptions AS3 makes inside the panel
    // itself, and has to hand their outcome codes back.
    get reporterFeedbackCtrl(): ChatReviewReporterFeedbackCtrl | null
    {
        return this._reporterFeedbackCtrl;
    }

    /**
	 * The owning help component
	 */
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::get habboHelp()
    get habboHelp(): HabboHelp | null
    {
        return this._habboHelp;
    }

    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::_disposed
    private _disposed: boolean = false;

    /**
	 * Whether this manager has been disposed
	 */
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    private _guideData: GuideSessionData;

    /**
	 * Get the guide session data
	 */
    get guideData(): GuideSessionData
    {
        return this._guideData;
    }

    /**
	 * Show the guide tool window
	 */
    // TODO(AS3): .../src/com/sulake/habbo/help/GuideHelpManager.as::showGuideTool()
    // forwards to `GuideSessionController.showGuideTool()`, unported (see the class header).
    showGuideTool(): void
    {
        log.warn('showGuideTool: GuideSessionController is not ported');
    }

    /**
	 * Create a help request
	 *
	 * @param type The request type (0 = help, 1 = tour, 2 = bully)
	 */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/GuideHelpManager.as::createHelpRequest()
    // forwards to `GuideSessionController.createHelpRequest(param1)`, which is unported (see the
    // class header). AS3 takes one argument; `message` is this port's own addition with no AS3
    // counterpart and no current caller.
    createHelpRequest(type: number, _message?: string): void
    {
        log.warn('createHelpRequest: GuideSessionController is not ported - request type', type, 'was dropped');
    }

    /**
	 * Show the user their already-open guide ticket
	 *
	 * @param pendingTicket The ticket payload from the guide-reporting status message
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/GuideHelpManager.as::showPendingTicket()
    // The argument stays `unknown`: its AS3 type (`_SafePkg_2970._SafeCls_2969`) is unported and
    // `GuideReportingStatusMessageParser` reads no `pendingTicket` field, so nothing can call this
    // yet. `HelpController.showPendingTicket()` carries the detail of what remains.
    showPendingTicket(pendingTicket: unknown): void
    {
        this._helpController?.showPendingTicket(pendingTicket);
    }

    /**
	 * Open the report window for guide reporting
	 */
    // TODO(AS3): .../src/com/sulake/habbo/help/GuideHelpManager.as::openReportWindow()
    // forwards to `GuideSessionController.openReportWindow()`, unported. This is the one
    // `HabboHelp.proceedWithReporting()` reaches for REPORT_TYPE_GUIDE, so a guide report gets
    // as far as the server round trip and then stops here.
    openReportWindow(): void
    {
        log.warn('openReportWindow: GuideSessionController is not ported - the guide report form did not open');
    }

    /**
	 * Open the tour popup
	 */
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::openTourPopup()
    // TODO(AS3): AS3 also opens this on a timer started from `onRoomEnter()` when the new-user
    // tour is enabled, the identity is new and the session is not a real noob. That timer is not
    // wired here: this manager makes no subscriptions of its own, since every help subscription in
    // this port lives in `HelpMessageHandler`.
    openTourPopup(): void
    {
        this._helpController?.openTourPopup();
        this._tourPopupShown = true;
    }

    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::_tourPopupShown
    // Name derived (`_SafeStr_9610`): latched once the popup has been offered so the room-enter
    // timer never offers it twice in a session.
    private _tourPopupShown: boolean = false;

    /**
	 * Whether the new-user tour has already been offered this session
	 */
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::_tourPopupShown
    get tourPopupShown(): boolean
    {
        return this._tourPopupShown;
    }

    /**
	 * Show feedback with a localization code
	 *
	 * @param localizationCode The localization key for the feedback message
	 */
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::showFeedback()
    showFeedback(localizationCode: string): void
    {
        this._reporterFeedbackCtrl?.show(localizationCode);
    }

    /**
	 * Dispose of this manager
	 */
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        // AS3 also disposes GuideSessionController here and resets the tour timer; both are still
        // unported.
        if(this._reporterFeedbackCtrl)
        {
            this._reporterFeedbackCtrl.dispose();
            this._reporterFeedbackCtrl = null;
        }

        if(this._helpController)
        {
            this._helpController.dispose();
            this._helpController = null;
        }

        this._habboHelp = null;
        this._disposed = true;
    }
}
