import {ChatReviewReporterFeedbackCtrl} from './ChatReviewReporterFeedbackCtrl';
import {HelpController} from './guidehelp/HelpController';
import {GuideSessionController} from './guidehelp/GuideSessionController';
import {GuideSessionData} from './GuideSessionData';
import type {PendingGuideTicket} from '@habbo/communication/messages/parser/help/PendingGuideTicket';
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
 *   `openReportWindow()`. **Ported** on 2026-08-11.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/GuideHelpManager.as
 */
export class GuideHelpManager
{
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::GuideHelpManager()
    // AS3 also subscribes `onRoomEnter` (the new-user tour timer) here; that one still waits on a
    // room-session hook, see `openTourPopup()` below.
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
        this._guideData = new GuideSessionData();
        this._reporterFeedbackCtrl = new ChatReviewReporterFeedbackCtrl(habboHelp);
        this._helpController = new HelpController(this);
        this._guideSessionController = new GuideSessionController(this);

        log.debug('GuideHelpManager initialized');
    }

    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::_SafeStr_6054
    // Field name DERIVED: obfuscated in every tree, named after the class it holds.
    private _guideSessionController: GuideSessionController | null;

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
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::showGuideTool()
    showGuideTool(): void
    {
        this._guideSessionController?.showGuideTool();
    }

    /**
	 * Create a help request
	 *
	 * @param type The request type (0 = help, 1 = tour, 2 = bully)
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/GuideHelpManager.as::createHelpRequest()
    // AS3 takes one argument; `message` is this port's own addition with no AS3 counterpart and no
    // current caller, so it is not forwarded.
    createHelpRequest(type: number, _message?: string): void
    {
        this._guideSessionController?.createHelpRequest(type);
    }

    /**
	 * Show the user their already-open guide ticket
	 *
	 * @param pendingTicket The ticket payload from the guide-reporting status message
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/GuideHelpManager.as::showPendingTicket()
    showPendingTicket(pendingTicket: PendingGuideTicket | null): void
    {
        this._helpController?.showPendingTicket(pendingTicket);
    }

    /**
	 * Open the report window for guide reporting
	 */
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::openReportWindow()
    // Called back by `HabboHelp.proceedWithReporting()` for REPORT_TYPE_GUIDE, once the server has
    // answered that the player may file another report.
    openReportWindow(): void
    {
        this._guideSessionController?.openReportWindow();
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

        // AS3 also resets the tour timer here; that one is still unported (see openTourPopup()).
        if(this._guideSessionController)
        {
            this._guideSessionController.dispose();
            this._guideSessionController = null;
        }

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
