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
    UserNameChangedMessageEvent,
} from '@habbo/communication/messages/incoming/help';

import type {CallForHelpDisabledNotifyMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpDisabledNotifyMessageParser';
import type {CallForHelpPendingCallsMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpPendingCallsMessageParser';
import type {CallForHelpReplyMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpReplyMessageParser';
import type {CallForHelpResultMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpResultMessageParser';
import type {CfhTopicsInitMessageParser} from '@habbo/communication/messages/parser/help/CfhTopicsInitMessageParser';
import type {GuideReportingStatusMessageParser} from '@habbo/communication/messages/parser/help/GuideReportingStatusMessageParser';
import type {IssueCloseNotificationMessageParser} from '@habbo/communication/messages/parser/help/IssueCloseNotificationMessageParser';

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

    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::onPendingCallsForHelpDeleted()
    // calls `TopicsFlowHelpController.submitCallForHelp(false)` — the user discarded their open
    // reports, so the new one is now free to go out. That controller is unported (933 lines), so
    // the report the user just discarded their queue for is dropped here.
    private onCallForHelpPendingCallsDeleted(_event: IMessageEvent): void
    {
        log.warn('Pending calls deleted, but the follow-up submit (TopicsFlowHelpController) is not ported');
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

    private onGuideTicketCreationResult(_event: IMessageEvent): void
    {
        log.trace('GuideTicketCreationResult received');
    }

    private onGuideTicketResolution(_event: IMessageEvent): void
    {
        log.trace('GuideTicketResolution received');
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
