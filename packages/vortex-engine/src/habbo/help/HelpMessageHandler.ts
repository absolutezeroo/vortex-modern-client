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
    GuideSessionInviteRequesterMessageEvent,
    GuideSessionMessageMessageEvent,
    GuideSessionRequesterRoomMessageEvent,
    GuideSessionStartedMessageEvent,
    GuideTicketCreationResultMessageEvent,
    GuideTicketResolutionMessageEvent,
    SanctionStatusMessageEvent,
    UserNameChangedMessageEvent,
} from '@habbo/communication/messages/incoming/help';

import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('HelpMessageHandler');

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

        // Sanction and topics
        this.addMessageEvent(new SanctionStatusMessageEvent(this.onSanctionStatus.bind(this)));
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
        this.addMessageEvent(new GuideSessionInviteRequesterMessageEvent(this.onGuideSessionInviteRequester.bind(this)));
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

    // --- CFH handlers ---

    private onCallForHelpReply(_event: IMessageEvent): void
    {
        log.debug('CallForHelpReply received');
    }

    private onCallForHelpResult(_event: IMessageEvent): void
    {
        log.debug('CallForHelpResult received');
    }

    private onCallForHelpPendingCalls(_event: IMessageEvent): void
    {
        log.debug('CallForHelpPendingCalls received');
    }

    private onCallForHelpPendingCallsDeleted(_event: IMessageEvent): void
    {
        log.debug('CallForHelpPendingCallsDeleted received');
    }

    private onCallForHelpDisabledNotify(_event: IMessageEvent): void
    {
        log.debug('CallForHelpDisabledNotify received');
    }

    // --- Sanction / Topics / Reporting ---

    private onSanctionStatus(_event: IMessageEvent): void
    {
        log.debug('SanctionStatus received');
    }

    private onCfhTopicsInit(_event: IMessageEvent): void
    {
        log.debug('CfhTopicsInit received');
    }

    private onGuideReportingStatus(_event: IMessageEvent): void
    {
        log.debug('GuideReportingStatus received');
    }

    // --- Guide session handlers ---

    private onGuideSessionStarted(_event: IMessageEvent): void
    {
        log.debug('GuideSessionStarted received');
    }

    private onGuideOnDutyStatus(_event: IMessageEvent): void
    {
        log.debug('GuideOnDutyStatus received');
    }

    private onGuideSessionAttached(_event: IMessageEvent): void
    {
        log.debug('GuideSessionAttached received');
    }

    private onGuideSessionDetached(_event: IMessageEvent): void
    {
        log.debug('GuideSessionDetached received');
    }

    private onGuideSessionMessage(_event: IMessageEvent): void
    {
        log.debug('GuideSessionMessage received');
    }

    private onGuideSessionEnded(_event: IMessageEvent): void
    {
        log.debug('GuideSessionEnded received');
    }

    // --- Guide invite handlers ---

    private onGuideSessionInviteRequester(_event: IMessageEvent): void
    {
        log.debug('GuideSessionInviteRequester received');
    }

    private onGuideSessionInvitedToGuideRoom(_event: IMessageEvent): void
    {
        log.debug('GuideSessionInvitedToGuideRoom received');
    }

    private onGuideSessionRequesterRoom(_event: IMessageEvent): void
    {
        log.debug('GuideSessionRequesterRoom received');
    }

    // --- Guide ticket handlers ---

    private onGuideTicketCreationResult(_event: IMessageEvent): void
    {
        log.debug('GuideTicketCreationResult received');
    }

    private onGuideTicketResolution(_event: IMessageEvent): void
    {
        log.debug('GuideTicketResolution received');
    }

    // --- Name change handlers ---

    private onCheckUserNameResult(_event: IMessageEvent): void
    {
        log.debug('CheckUserNameResult received');
    }

    private onChangeUserNameResult(_event: IMessageEvent): void
    {
        log.debug('ChangeUserNameResult received');
    }

    private onUserNameChanged(_event: IMessageEvent): void
    {
        log.debug('UserNameChanged received');
    }
}
