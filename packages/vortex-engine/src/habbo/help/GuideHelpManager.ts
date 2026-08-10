import {GuideSessionData} from './GuideSessionData';
import {Logger} from '@core/utils/Logger';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.GuideHelpManager');

/**
 * Guide help coordination manager
 *
 * In AS3 this class holds almost no logic of its own: it is a façade over three sub-controllers
 * and forwards to them. None of the three is ported, so every forward below is still a stub, and
 * each one now names the class it is waiting on rather than describing the gap loosely:
 *
 * - `guidehelp/GuideSessionController.as` (1,826 lines) — the guide tool, help requests and the
 *   whole guide-session conversation. Backs `showGuideTool()`, `createHelpRequest()` and
 *   `openReportWindow()`.
 * - `guidehelp/HelpController.as` (271 lines) — the tour popup and the pending-ticket view.
 *   Backs `openTourPopup()` and `showPendingTicket()`.
 * - `ChatReviewReporterFeedbackCtrl.as` (117 lines) — the post-report feedback panel. Backs
 *   `showFeedback()`.
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

        log.debug('GuideHelpManager initialized');
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
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/GuideHelpManager.as::showPendingTicket()
    // forwards to `HelpController.showPendingTicket()`, unported. The argument is typed `unknown`
    // because its AS3 type (`_SafePkg_2970._SafeCls_2969`) is not ported either, and because
    // `GuideReportingStatusMessageParser` does not read a `pendingTicket` field off the wire yet —
    // so there is currently nothing to pass in. Declared so the member is visible rather than
    // silently missing; `HabboHelp.handleGuideReportingStatus()` documents the same gap.
    showPendingTicket(pendingTicket: unknown): void
    {
        log.warn('showPendingTicket: HelpController is not ported', pendingTicket);
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
    // TODO(AS3): .../src/com/sulake/habbo/help/GuideHelpManager.as::openTourPopup()
    // forwards to `HelpController.openTourPopup()` and latches `_tourPopupShown`, unported. AS3
    // also opens this on a timer started from `onRoomEnter()` when the new-user tour is enabled
    // and the session is not a real noob; that timer waits on the same controller.
    openTourPopup(): void
    {
        log.warn('openTourPopup: HelpController is not ported');
    }

    /**
	 * Show feedback with a localization code
	 *
	 * @param localizationCode The localization key for the feedback message
	 */
    // TODO(AS3): .../src/com/sulake/habbo/help/GuideHelpManager.as::showFeedback()
    // forwards to `ChatReviewReporterFeedbackCtrl.show()` (117 lines, unported). Reached from
    // `HabboHelp.handleGuideReportingStatus()` for every status code past 1.
    showFeedback(localizationCode: string): void
    {
        log.warn('showFeedback: ChatReviewReporterFeedbackCtrl is not ported -', localizationCode);
    }

    /**
	 * Dispose of this manager
	 */
    // AS3: .../src/com/sulake/habbo/help/GuideHelpManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        // AS3 disposes the three sub-controllers and resets the tour timer here; none is ported.
        this._habboHelp = null;
        this._disposed = true;
    }
}
