import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import {
    CallForHelpDisabledNotifyMessageEvent,
    CallForHelpPendingCallsDeletedMessageEvent,
    CallForHelpPendingCallsMessageEvent,
    CallForHelpReplyMessageEvent,
    CallForHelpResultMessageEvent,
    CfhTopicsInitMessageEvent,
    ChangeUserNameResultMessageEvent,
    CheckUserNameResultMessageEvent,
    GuideOnDutyStatusMessageEvent,
    GuideReportingStatusMessageEvent,
    GuideSessionAttachedMessageEvent,
    GuideSessionDetachedMessageEvent,
    GuideSessionEndedMessageEvent,
    GuideSessionInvitedToGuideRoomMessageEvent,
    GuideSessionMessageMessageEvent,
    GuideSessionRequesterRoomMessageEvent,
    GuideSessionStartedMessageEvent,
    GuideTicketCreationResultMessageEvent,
    GuideTicketResolutionMessageEvent,
    IssueCloseNotificationMessageEvent,
    QuizDataMessageEvent,
    QuizResultsMessageEvent,
    UserNameChangedMessageEvent,
} from '@habbo/communication/messages/incoming/help';

import type {CallForHelpDisabledNotifyMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpDisabledNotifyMessageParser';
import type {CallForHelpPendingCallsMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpPendingCallsMessageParser';
import type {CallForHelpReplyMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpReplyMessageParser';
import type {CallForHelpResultMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpResultMessageParser';
import type {CfhTopicsInitMessageParser} from '@habbo/communication/messages/parser/help/CfhTopicsInitMessageParser';
import type {GuideReportingStatusMessageParser} from '@habbo/communication/messages/parser/help/GuideReportingStatusMessageParser';
import type {GuideTicketCreationResultMessageParser} from '@habbo/communication/messages/parser/help/GuideTicketCreationResultMessageParser';
import type {GuideTicketResolutionMessageParser} from '@habbo/communication/messages/parser/help/GuideTicketResolutionMessageParser';
import type {IssueCloseNotificationMessageParser} from '@habbo/communication/messages/parser/help/IssueCloseNotificationMessageParser';
import type {QuizDataMessageParser} from '@habbo/communication/messages/parser/help/QuizDataMessageParser';
import type {QuizResultsMessageParser} from '@habbo/communication/messages/parser/help/QuizResultsMessageParser';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.HelpMessageHandler');

/**
 * Message handler for the help system
 *
 * Registers all help-related message events and routes incoming
 * messages to the appropriate sub-managers (CFH, guide, name change, sanction).
 *
 * @see source_as_win63/habbo/help/HabboHelp.as (initComponent message registration)
 */
export class HelpMessageHandler
{
    private _help: HabboHelp;
    private _communication: IHabboCommunicationManager;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    constructor(help: HabboHelp, communication: IHabboCommunicationManager)
    {
        this._help = help;
        this._communication = communication;

        this.registerMessageEvents();

        log.debug('HelpMessageHandler initialized');
    }

    private _disposed: boolean = false;

    /**
	 * Whether this handler has been disposed
	 */
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Dispose of this handler and unregister all message events
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        for(const event of this._messageEvents)
        {
            this._communication.removeMessageEvent(event);
        }

        this._messageEvents = [];
        this._disposed = true;
    }

    /**
	 * Register a message event with the communication manager
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        this._communication.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    /**
	 * Register all help-related message events
	 */
    private registerMessageEvents(): void
    {
        // CFH events
        this.addMessageEvent(new CallForHelpReplyMessageEvent(this.onCallForHelpReply.bind(this)));
        this.addMessageEvent(new CallForHelpResultMessageEvent(this.onCallForHelpResult.bind(this)));
        this.addMessageEvent(new CallForHelpPendingCallsMessageEvent(this.onCallForHelpPendingCalls.bind(this)));
        this.addMessageEvent(new CallForHelpPendingCallsDeletedMessageEvent(this.onCallForHelpPendingCallsDeleted.bind(this)));
        this.addMessageEvent(new CallForHelpDisabledNotifyMessageEvent(this.onCallForHelpDisabledNotify.bind(this)));

        // AS3 subscribes these three in `CallForHelpManager`'s own constructor rather than in
        // `HabboHelp.initComponent()`; this port centralises every help subscription here, so the
        // issue-close notification belongs with the other two CFH replies above.
        this.addMessageEvent(new IssueCloseNotificationMessageEvent(this.onIssueClose.bind(this)));

        // Quiz events. AS3 subscribes these inside HabboWayQuizController's own constructor; they
        // were not subscribed anywhere here, so a quiz's questions never arrived even once the
        // request went out.
        this.addMessageEvent(new QuizDataMessageEvent(this.onQuizData.bind(this)));
        this.addMessageEvent(new QuizResultsMessageEvent(this.onQuizResults.bind(this)));

        // Sanction and topics
        // TODO(AS3): `SanctionStatusMessageEvent` has no header in `HabboMessages` on purpose. It
        // was ported from win63_version, where the message is one flat sanction (name, length,
        // reason, probation, …). The 2026 client's message in that position (`_SafeCls_1807`,
        // header 1746) carries a `sanctions()` **list** instead — a different shape, so
        // registering the old reader against the new id would misparse the wire. Porting the
        // current shape is the fix; the header is 1746 when it is done.
        //
        // The comment above used to end "deliberately left unregistered, so this subscription
        // never fires" — while the line below subscribed anyway. `MessageRegistry` then logged
        // "Unknown message event class: SanctionStatusMessageEvent" on every boot, because an
        // event class with no header cannot be registered. Subscribing is what the comment says
        // is wrong, so the call is gone; the handler stays for when the parser is re-ported.
        this.addMessageEvent(new CfhTopicsInitMessageEvent(this.onCfhTopicsInit.bind(this)));
        this.addMessageEvent(new GuideReportingStatusMessageEvent(this.onGuideReportingStatus.bind(this)));

        // Guide session events
        this.addMessageEvent(new GuideSessionStartedMessageEvent(this.onGuideSessionStarted.bind(this)));
        this.addMessageEvent(new GuideOnDutyStatusMessageEvent(this.onGuideOnDutyStatus.bind(this)));
        this.addMessageEvent(new GuideSessionAttachedMessageEvent(this.onGuideSessionAttached.bind(this)));
        this.addMessageEvent(new GuideSessionDetachedMessageEvent(this.onGuideSessionDetached.bind(this)));
        this.addMessageEvent(new GuideSessionMessageMessageEvent(this.onGuideSessionMessage.bind(this)));
        this.addMessageEvent(new GuideSessionEndedMessageEvent(this.onGuideSessionEnded.bind(this)));

        // Guide invite events
        this.addMessageEvent(new GuideSessionInvitedToGuideRoomMessageEvent(this.onGuideSessionInvitedToGuideRoom.bind(this)));
        this.addMessageEvent(new GuideSessionRequesterRoomMessageEvent(this.onGuideSessionRequesterRoom.bind(this)));

        // Guide ticket events
        this.addMessageEvent(new GuideTicketCreationResultMessageEvent(this.onGuideTicketCreationResult.bind(this)));
        this.addMessageEvent(new GuideTicketResolutionMessageEvent(this.onGuideTicketResolution.bind(this)));

        // Name change events
        this.addMessageEvent(new CheckUserNameResultMessageEvent(this.onCheckUserNameResult.bind(this)));
        this.addMessageEvent(new ChangeUserNameResultMessageEvent(this.onChangeUserNameResult.bind(this)));
        this.addMessageEvent(new UserNameChangedMessageEvent(this.onUserNameChanged.bind(this)));
    }
    
    /**
	 * The moderator's written reply to a report
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onCallForHelpReply()
    private onCallForHelpReply(event: IMessageEvent): void
    {
        const parser = event.parser as CallForHelpReplyMessageParser | null;

        if(!parser) return;

        this._help.windowManager?.alert('${help.cfh.reply.title}', parser.message, 0, null);
    }

    /**
	 * The server's acknowledgement that a report was filed
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onCallForHelpResult()
    private onCallForHelpResult(event: IMessageEvent): void
    {
        const parser = event.parser as CallForHelpResultMessageParser | null;

        if(!parser) return;

        // AS3 reads `resultType` into a local and never uses it; only the text is shown.
        const messageText = parser.messageText === '' ? '${help.cfh.sent.text}' : parser.messageText;

        this._help.windowManager?.alert('${help.cfh.sent.title}', messageText, 0, null);
    }

    /**
	 * How many reports this user already has open — the gate every report passes through
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onPendingCallsForHelp()
    private onCallForHelpPendingCalls(event: IMessageEvent): void
    {
        const parser = event.parser as CallForHelpPendingCallsMessageParser | null;

        if(!parser) return;

        this._help.handlePendingCallsForHelp(parser);
    }

    /**
	 * The user discarded their open reports — the new one is now free to go out
	 *
	 * `false` because this report has already been past the bullying/guide decision once; it must
	 * not be re-routed to the guide system on the way back through.
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onPendingCallsForHelpDeleted()
    private onCallForHelpPendingCallsDeleted(_event: IMessageEvent): void
    {
        this._help.topicsFlowHelpController?.submitCallForHelp(false);
    }

    /**
	 * Calling for help has been disabled for this user
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onCallForHelpDisabledNotify()
    private onCallForHelpDisabledNotify(event: IMessageEvent): void
    {
        const parser = event.parser as CallForHelpDisabledNotifyMessageParser | null;

        if(!parser) return;

        this._help.handleCallForHelpDisabledNotify(parser);
    }

    private onSanctionStatus(_event: IMessageEvent): void
    {
        log.trace('SanctionStatus received');
    }

    /**
	 * The CFH topic tree, sent once at login
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onCfhTopics()
    private onCfhTopicsInit(event: IMessageEvent): void
    {
        const parser = event.parser as CfhTopicsInitMessageParser | null;

        if(!parser) return;

        this._help.handleCfhTopics(parser);
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onGuideReportingStatus()
    private onGuideReportingStatus(event: IMessageEvent): void
    {
        const parser = event.parser as GuideReportingStatusMessageParser | null;

        if(!parser) return;

        this._help.handleGuideReportingStatus(parser);
    }

    /**
	 * A moderator closed the user's report
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onIssueClose()
    private onIssueClose(event: IMessageEvent): void
    {
        const parser = event.parser as IssueCloseNotificationMessageParser | null;

        if(!parser) return;

        const messageText = parser.messageText === ''
            ? `\${help.cfh.closed.${HelpMessageHandler.getCloseReasonKey(parser.closeReason)}}`
            : parser.messageText;

        this._help.windowManager?.alert('${mod.alert.title}', messageText, 0, null);
    }

    /**
	 * A quiz's question set arrived — open the quiz window
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::onQuizData()
    private onQuizData(event: IMessageEvent): void
    {
        const parser = event.parser as QuizDataMessageParser | null;

        if(!parser) return;

        this._help.quizController?.handleQuizData(parser);
    }

    /**
	 * The server marked the answers
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboWayQuizController.as::onQuizResults()
    private onQuizResults(event: IMessageEvent): void
    {
        const parser = event.parser as QuizResultsMessageParser | null;

        if(!parser) return;

        this._help.quizController?.handleQuizResults(parser);
    }

    /**
	 * Map a close reason to its localization suffix
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::getCloseReasonKey()
    private static getCloseReasonKey(closeReason: number): string
    {
        if(closeReason === 1) return 'useless';
        if(closeReason === 2) return 'abusive';

        return 'resolved';
    }

    private onGuideSessionStarted(_event: IMessageEvent): void
    {
        log.trace('GuideSessionStarted received');
    }

    private onGuideOnDutyStatus(_event: IMessageEvent): void
    {
        log.trace('GuideOnDutyStatus received');
    }

    private onGuideSessionAttached(_event: IMessageEvent): void
    {
        log.trace('GuideSessionAttached received');
    }

    private onGuideSessionDetached(_event: IMessageEvent): void
    {
        log.trace('GuideSessionDetached received');
    }

    private onGuideSessionMessage(_event: IMessageEvent): void
    {
        log.trace('GuideSessionMessage received');
    }

    private onGuideSessionEnded(_event: IMessageEvent): void
    {
        log.trace('GuideSessionEnded received');
    }

    private onGuideSessionInvitedToGuideRoom(_event: IMessageEvent): void
    {
        log.trace('GuideSessionInvitedToGuideRoom received');
    }

    private onGuideSessionRequesterRoom(_event: IMessageEvent): void
    {
        log.trace('GuideSessionRequesterRoom received');
    }

    /**
	 * The guide ticket was created — tell the reporter what happens next
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::onCreateResult()
    private onGuideTicketCreationResult(event: IMessageEvent): void
    {
        const parser = event.parser as GuideTicketCreationResultMessageParser | null;

        if(!parser) return;

        this._help.guideHelpManager?.reporterFeedbackCtrl?.show(parser.localizationCode);
    }

    /**
	 * The guide ticket was resolved — tell the reporter the outcome
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReviewReporterFeedbackCtrl.as::onTicketResolved()
    private onGuideTicketResolution(event: IMessageEvent): void
    {
        const parser = event.parser as GuideTicketResolutionMessageParser | null;

        if(!parser) return;

        this._help.guideHelpManager?.reporterFeedbackCtrl?.show(parser.localizationCode);
    }

    private onCheckUserNameResult(_event: IMessageEvent): void
    {
        log.trace('CheckUserNameResult received');
    }

    private onChangeUserNameResult(_event: IMessageEvent): void
    {
        log.trace('ChangeUserNameResult received');
    }

    private onUserNameChanged(_event: IMessageEvent): void
    {
        log.trace('UserNameChanged received');
    }
}
