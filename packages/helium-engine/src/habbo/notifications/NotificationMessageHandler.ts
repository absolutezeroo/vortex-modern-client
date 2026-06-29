import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {HabboNotifications} from './HabboNotifications';
import {Logger} from '@core/utils/Logger';

// Existing message events
import {
	MaintenanceStatusMessageEvent
} from '@habbo/communication/messages/incoming/availability/MaintenanceStatusMessageEvent';
import {
	LoginFailedHotelClosedMessageEvent
} from '@habbo/communication/messages/incoming/availability/LoginFailedHotelClosedMessageEvent';
import {
	InfoFeedEnableMessageEvent
} from '@habbo/communication/messages/incoming/notifications/InfoFeedEnableMessageEvent';
import {
	OpenConnectionMessageEvent
} from '@habbo/communication/messages/incoming/room/session/OpenConnectionMessageEvent';
import {RoomEntryInfoMessageEvent} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';

// Existing parsers
import type {
	MaintenanceStatusMessageEventParser
} from '@habbo/communication/messages/parser/availability/MaintenanceStatusMessageEventParser';
import type {
	InfoFeedEnableMessageParser
} from '@habbo/communication/messages/parser/notifications/InfoFeedEnableMessageParser';
import {
	HabboAchievementNotificationMessageEvent,
	HabboBroadcastMessageEvent,
	HabboBroadcastMessageEventParser,
	InfoHotelClosedMessageEvent,
	InfoHotelClosedMessageEventParser,
	InfoHotelClosingMessageEvent,
	InfoHotelClosingMessageEventParser,
	LoginFailedHotelClosedMessageEventParser,
	MOTDNotificationEvent,
	MOTDNotificationEventParser,
	NotificationDialogMessageEvent,
	NotificationDialogMessageEventParser,
	PetLevelNotificationEvent,
	PetLevelNotificationEventParser,
	PetReceivedMessageEvent,
	PetReceivedMessageEventParser,
	PetRespectFailedEvent,
	PetRespectFailedEventParser,
	RoomMessageNotificationMessageEvent
} from "@habbo/communication";
import {GenericNotificationItemData} from "@habbo/notifications/feed";

// TODO: Import these events once they are implemented:
// import {ModeratorMessageEvent} from '@habbo/communication/messages/incoming/moderation/ModeratorMessageEvent';
// import {ModeratorCautionEvent} from '@habbo/communication/messages/incoming/moderation/ModeratorCautionEvent';
// import {UserBannedMessageEvent} from '@habbo/communication/messages/incoming/moderation/UserBannedMessageEvent';
// import {RespectNotificationMessageEvent} from '@habbo/communication/messages/incoming/users/RespectNotificationMessageEvent';
// import {UserObjectEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectEvent';
// import {MOTDNotificationEvent} from '@habbo/communication/messages/incoming/notifications/MOTDNotificationEvent';
// import {HabboBroadcastMessageEvent} from '@habbo/communication/messages/incoming/notifications/HabboBroadcastMessageEvent';
// import {HabboActivityPointNotificationMessageEvent} from '@habbo/communication/messages/incoming/notifications/HabboActivityPointNotificationMessageEvent';
// import {NotificationDialogMessageEvent} from '@habbo/communication/messages/incoming/notifications/NotificationDialogMessageEvent';
// import {ClubGiftNotificationEvent} from '@habbo/communication/messages/incoming/notifications/ClubGiftNotificationEvent';
// import {HabboAchievementNotificationMessageEvent} from '@habbo/communication/messages/incoming/notifications/HabboAchievementNotificationMessageEvent';
// import {PetLevelNotificationEvent} from '@habbo/communication/messages/incoming/notifications/PetLevelNotificationEvent';
// import {RestoreClientMessageEvent} from '@habbo/communication/messages/incoming/notifications/RestoreClientMessageEvent';
// import {InfoHotelClosingMessageEvent} from '@habbo/communication/messages/incoming/availability/InfoHotelClosingMessageEvent';
// import {InfoHotelClosedMessageEvent} from '@habbo/communication/messages/incoming/availability/InfoHotelClosedMessageEvent';
// import {PetReceivedMessageEvent} from '@habbo/communication/messages/incoming/inventory/pets/PetReceivedMessageEvent';
// import {PetRespectFailedEvent} from '@habbo/communication/messages/incoming/room/pets/PetRespectFailedEvent';
// import {ClubGiftSelectedEvent} from '@habbo/communication/messages/incoming/catalog/ClubGiftSelectedEvent';
// import {AccountSafetyLockStatusChangeMessageEvent} from '@habbo/communication/messages/incoming/users/AccountSafetyLockStatusChangeMessageEvent';
// import {RoomMessageNotificationMessageEvent} from '@habbo/communication/messages/incoming/room/furniture/RoomMessageNotificationMessageEvent';

const log = Logger.getLogger('NotificationMessageHandler');

/**
 * Notification message handler hub.
 * Listens to incoming message events and routes them to the appropriate
 * notification display methods (alert dialogs, bubble notifications, feed items).
 *
 * This is the obfuscated class_3353 in the AS3 source. It registers all
 * notification-related message event handlers and processes them.
 *
 * @see source_as_win63/habbo/notifications/class_3353.as
 */
export class NotificationMessageHandler
{
	private static readonly CALL_FOR_HELP_NOTIFICATION_TYPE: string = 'cfh.created';

	private _notifications: HabboNotifications | null;
	private _communication: IHabboCommunicationManager | null;
	private _messageEvents: IMessageEvent[] = [];

	constructor(notifications: HabboNotifications, communication: IHabboCommunicationManager)
	{
		this._notifications = notifications;
		this._communication = communication;

		this.registerMessageEvents();

		// Activate the notifications component after handlers are set up
		this._notifications.activate();
	}

	dispose(): void
	{
		if (this._messageEvents != null && this._communication != null)
		{
			for (const event of this._messageEvents)
			{
				this._communication.removeMessageEvent(event);
			}
		}

		this._messageEvents = [];
		this._notifications = null;
		this._communication = null;
	}

	/**
	 * Handle room messages notification
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onRoomMessagesNotification()
	 */
	private onRoomMessagesNotification(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = (event as RoomMessageNotificationMessageEvent).parser;

		if (!parser) return;

		// Show room messages posted notification
	}

	/**
	 * Register all message event listeners
	 */
	private registerMessageEvents(): void
	{
		// === Currently available events ===

		// Maintenance status
		this.addMessageEvent(new MaintenanceStatusMessageEvent(this.onHotelMaintenance.bind(this)));

		// Login failed - hotel closed
		this.addMessageEvent(new LoginFailedHotelClosedMessageEvent(this.onLoginFailedHotelClosed.bind(this)));

		// Info feed enable/disable
		this.addMessageEvent(new InfoFeedEnableMessageEvent(this.onInfoFeedEnable.bind(this)));

		// Room enter events (for moderation disclaimer)
		this.addMessageEvent(new OpenConnectionMessageEvent(this.onRoomEnter.bind(this)));
		this.addMessageEvent(new RoomEntryInfoMessageEvent(this.onRoomEnter.bind(this)));

		// TODO: Register these events once their message event classes are implemented:
		// this.addMessageEvent(new ModeratorMessageEvent(this.onModMessageEvent.bind(this)));
		// this.addMessageEvent(new ModeratorCautionEvent(this.onModCautionEvent.bind(this)));
		// this.addMessageEvent(new UserBannedMessageEvent(this.onUserBannedMessageEvent.bind(this)));
		// this.addMessageEvent(new RespectNotificationMessageEvent(this.onRespectNotification.bind(this)));
		// this.addMessageEvent(new UserObjectEvent(this.onUserObject.bind(this)));
		this.addMessageEvent(new MOTDNotificationEvent(this.onMOTD.bind(this)));
		this.addMessageEvent(new HabboBroadcastMessageEvent(this.onBroadcastMessageEvent.bind(this)));
		// this.addMessageEvent(new HabboActivityPointNotificationMessageEvent(this.onActivityPointNotification.bind(this)));
		this.addMessageEvent(new NotificationDialogMessageEvent(this.onNotificationDialogMessageEvent.bind(this)));
		// this.addMessageEvent(new ClubGiftNotificationEvent(this.onClubGiftNotification.bind(this)));
		// this.addMessageEvent(new ClubGiftSelectedEvent(this.onClubGiftSelected.bind(this)));
		this.addMessageEvent(new HabboAchievementNotificationMessageEvent(this.onLevelUp.bind(this)));
		this.addMessageEvent(new PetLevelNotificationEvent(this.onPetLevelNotification.bind(this)));
		this.addMessageEvent(new PetReceivedMessageEvent(this.onPetReceived.bind(this)));
		this.addMessageEvent(new PetRespectFailedEvent(this.onPetRespectFailed.bind(this)));
		this.addMessageEvent(new InfoHotelClosingMessageEvent(this.onHotelClosing.bind(this)));
		this.addMessageEvent(new InfoHotelClosedMessageEvent(this.onHotelClosed.bind(this)));
		// this.addMessageEvent(new RestoreClientMessageEvent(this.onRestoreClientMessageEvent.bind(this)));
		// this.addMessageEvent(new AccountSafetyLockStatusChangeMessageEvent(this.onAccountSafetyLockStatusChanged.bind(this)));
		this.addMessageEvent(new RoomMessageNotificationMessageEvent(this.onRoomMessagesNotification.bind(this)));

		log.info('Notification message handlers registered');
	}

	// === Handler methods for currently available events ===

	/**
	 * Register a message event with the communication manager and track it for cleanup
	 */
	private addMessageEvent(event: IMessageEvent): void
	{
		if (this._communication)
		{
			this._communication.addMessageEvent(event);
			this._messageEvents.push(event);
		}
	}

	/**
	 * Handle hotel maintenance status message
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onHotelMaintenance()
	 */
	private onHotelMaintenance(event: IMessageEvent): void
	{
		const parser = event.parser as MaintenanceStatusMessageEventParser;

		if (parser == null || this._notifications?.singularController?.alertDialogManager == null)
		{
			return;
		}

		this._notifications.singularController.alertDialogManager.handleHotelMaintenanceMessage(
			parser.minutesUntilMaintenance,
			parser.duration
		);
	}

	/**
	 * Handle login failed because hotel is closed
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onLoginFailedHotelClosed()
	 */
	private onLoginFailedHotelClosed(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as LoginFailedHotelClosedMessageEventParser;

		if (parser == null || this._notifications?.singularController?.alertDialogManager == null) return;

		this._notifications.singularController.alertDialogManager.handleLoginFailedHotelClosedMessage(parser.openHour, parser.openMinute);

		log.debug('Login failed - hotel closed');
	}

	/**
	 * Handle info feed enable/disable
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onInfoFeedEnable()
	 */
	private onInfoFeedEnable(event: IMessageEvent): void
	{
		const parser = event.parser as InfoFeedEnableMessageParser;

		if (parser != null && this._notifications)
		{
			this._notifications.disabled = !parser.enabled;
		}
	}

	// === Handler stubs for events not yet available ===
	// These methods follow the AS3 source structure and will be fully implemented
	// when the corresponding message event classes are created.

	/**
	 * Handle moderator message event
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onModMessageEvent()
	 */
	// TODO: Uncomment when ModeratorMessageEvent is implemented
	// private onModMessageEvent(event: IMessageEvent): void
	// {
	//     const parser = (event as ModeratorMessageEvent).parser as ModeratorMessageEventParser;
	//     if (parser == null || this._notifications?.singularController?.alertDialogManager == null) return;
	//     this._notifications.singularController.alertDialogManager.handleModeratorMessage(parser.message, parser.url);
	//     if (this._notifications.feedController)
	//     {
	//         const data = new GenericNotificationItemData();
	//         data.title = parser.message;
	//         data.buttonAction = parser.url;
	//         data.buttonCaption = parser.url;
	//         data.timeStamp = performance.now();
	//         this._notifications.feedController.addFeedItem(3, data);
	//     }
	// }

	/**
	 * Handle moderator caution event
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onModCautionEvent()
	 */
	// TODO: Uncomment when ModeratorCautionEvent is implemented
	// private onModCautionEvent(event: IMessageEvent): void
	// {
	//     const parser = (event as ModeratorCautionEvent).parser as ModeratorCautionEventParser;
	//     if (parser == null || this._notifications?.singularController?.alertDialogManager == null) return;
	//     this._notifications.singularController.alertDialogManager.handleModeratorCaution(parser.message, parser.url);
	//     if (this._notifications.feedController)
	//     {
	//         const data = new GenericNotificationItemData();
	//         data.title = parser.message;
	//         data.buttonAction = parser.url;
	//         data.buttonCaption = parser.url;
	//         data.timeStamp = performance.now();
	//         this._notifications.feedController.addFeedItem(3, data);
	//     }
	// }

	/**
	 * Handle user banned message
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onUserBannedMessageEvent()
	 */
	// TODO: Uncomment when UserBannedMessageEvent is implemented
	// private onUserBannedMessageEvent(event: IMessageEvent): void
	// {
	//     const parser = (event as UserBannedMessageEvent).parser as UserBannedMessageEventParser;
	//     if (parser == null || this._notifications?.singularController?.alertDialogManager == null) return;
	//     this._notifications.singularController.alertDialogManager.handleUserBannedMessage(parser.message);
	// }

	/**
	 * Handle respect notification
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onRespectNotification()
	 */
	// TODO: Uncomment when RespectNotificationMessageEvent is implemented
	// private onRespectNotification(event: IMessageEvent): void
	// {
	//     // Check if the respect was for us (userId matches sessionDataManager.userId)
	//     // Then show "respect" type notifications
	// }

	/**
	 * Handle MOTD (Message of the Day)
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onMOTD()
	 */
	private onMOTD(event: IMessageEvent): void
	{
		const parser = (event as MOTDNotificationEvent).parser as MOTDNotificationEventParser;
		if (parser.messages && parser.messages.length > 0)
		{
			for (const message of parser.messages)
			{
				const data = new GenericNotificationItemData();
				data.title = message;
				data.timeStamp = performance.now();
				// this._notifications.feedController?.addFeedItem(3, data);
			}
		}
	}

	/**
	 * Handle broadcast message
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onBroadcastMessageEvent()
	 */
	private onBroadcastMessageEvent(event: IMessageEvent): void
	{
		const parser = (event as HabboBroadcastMessageEvent).parser as HabboBroadcastMessageEventParser;

		let message = parser.messageText;

		message.replace(/\\r/g, '\r');

		// Show broadcast alert dialog
	}

	/**
	 * Handle notification dialog message
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onNotificationDialogMessageEvent()
	 */
	private onNotificationDialogMessageEvent(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = (event as NotificationDialogMessageEvent).parser as NotificationDialogMessageEventParser;

		if (!parser) return;

		if (NotificationMessageHandler.CALL_FOR_HELP_NOTIFICATION_TYPE === parser.type)
		{
			// Show CFH created notification
		}
		else
		{
			this._notifications?.showNotification(parser.type, parser.parameters);
		}
	}

	/**
	 * Handle hotel closing message
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onHotelClosing()
	 */
	private onHotelClosing(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = (event as InfoHotelClosingMessageEvent).parser as InfoHotelClosingMessageEventParser;

		if (!parser) return;

		if (this._notifications?.singularController?.alertDialogManager == null) return;

		this._notifications.singularController.alertDialogManager.handleHotelClosingMessage(parser.minutesUntilClosing);
	}

	/**
	 * Handle hotel closed message
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onHotelClosed()
	 */
	private onHotelClosed(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = (event as InfoHotelClosedMessageEvent).parser as InfoHotelClosedMessageEventParser;

		if (!parser) return;

		if (this._notifications?.singularController?.alertDialogManager == null) return;

		this._notifications.singularController.alertDialogManager.handleHotelClosedMessage(parser.openHour, parser.openMinute, parser.userThrownOutAtClose);
	}

	/**
	 * Handle achievement level up notification
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onLevelUp()
	 */
	private onLevelUp(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = (event as HabboAchievementNotificationMessageEvent).parser;

		if (!parser) return;

		// Show achievement notification with badge image
	}

	/**
	 * Handle pet level notification
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onPetLevelNotification()
	 */
	private onPetLevelNotification(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = (event as PetLevelNotificationEvent).parser as PetLevelNotificationEventParser;

		if (!parser) return;

		// Show pet level notification with pet image
	}

	/**
	 * Handle pet received notification
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onPetReceived()
	 */
	private onPetReceived(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = (event as PetReceivedMessageEvent).parser as PetReceivedMessageEventParser;

		if (!parser) return;

		// Show pet bought/received notification
	}

	/**
	 * Handle pet respect failed
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onPetRespectFailed()
	 */
	private onPetRespectFailed(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = (event as PetRespectFailedEvent).parser as PetRespectFailedEventParser;

		if (!parser) return;

		// Show alert with required/avatar age
	}

	/**
	 * Handle club gift notification
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onClubGiftNotification()
	 */
	// TODO: Uncomment when ClubGiftNotificationEvent is implemented
	// private onClubGiftNotification(event: IMessageEvent): void
	// {
	//     const parser = (event as ClubGiftNotificationEvent).parser as ClubGiftNotificationEventParser;
	//     if (parser.numGifts < 1) return;
	//     this._notifications?.singularController?.showClubGiftNotification(parser.numGifts);
	// }

	/**
	 * Handle club gift selected
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onClubGiftSelected()
	 */
	// TODO: Uncomment when ClubGiftSelectedEvent is implemented
	// private onClubGiftSelected(event: IMessageEvent): void
	// {
	//     const parser = (event as ClubGiftSelectedEvent).parser as ClubGiftSelectedEventParser;
	//     // Show club gift received notification with product image
	// }

	/**
	 * Handle user object (for safety lock check)
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onUserObject()
	 */
	// TODO: Uncomment when UserObjectEvent is implemented
	// private onUserObject(event: IMessageEvent): void
	// {
	//     const parser = (event as UserObjectEvent).parser as UserObjectEventParser;
	//     if (parser.accountSafetyLocked)
	//     {
	//         this._notifications?.singularController?.showSafetyLockedNotification(parser.id);
	//     }
	// }

	/**
	 * Handle account safety lock status change
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onAccountSafetyLockStatusChanged()
	 */
	// TODO: Uncomment when AccountSafetyLockStatusChangeMessageEvent is implemented
	// private onAccountSafetyLockStatusChanged(event: IMessageEvent): void
	// {
	//     const parser = (event as AccountSafetyLockStatusChangeMessageEvent).parser;
	//     if (parser.status === 1)
	//     {
	//         this._notifications?.singularController?.hideSafetyLockedNotification();
	//     }
	// }

	/**
	 * Handle activity point notification (loyalty points etc.)
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onActivityPointNotification()
	 */
	// TODO: Uncomment when HabboActivityPointNotificationMessageEvent is implemented
	// private onActivityPointNotification(event: IMessageEvent): void
	// {
	//     const apEvent = event as HabboActivityPointNotificationMessageEvent;
	//     if (apEvent.change <= 0) return;
	//     // Type 5 = loyalty points (diamonds)
	//     if (apEvent.type === 5)
	//     {
	//         // Show loyalty points notification
	//     }
	// }

	/**
	 * Handle restore client message (close web page)
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onRestoreClientMessageEvent()
	 */
	// TODO: Uncomment when RestoreClientMessageEvent is implemented
	// private onRestoreClientMessageEvent(_event: IMessageEvent): void
	// {
	//     // In AS3 this calls HabboWebTools.closeWebPageAndRestoreClient()
	//     // In web client this may not be applicable
	// }

	/**
	 * Handle room enter events (triggers moderation disclaimer)
	 *
	 * @see source_as_win63/habbo/notifications/class_3353.as onRoomEnter()
	 */
	private onRoomEnter(_event: IMessageEvent): void
	{
		this._notifications?.singularController?.showModerationDisclaimer();
	}
}
