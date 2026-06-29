import type {HabboCommunicationEventType, IHabboCommunicationManager} from "@habbo/communication";
import type {IConnection} from "@core";

export interface IHabboCommunicationDemo
{
	readonly communication: IHabboCommunicationManager | null;

	/**
	 * Initialize the game socket connection
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as initGameSocket()
	 */
	initGameSocket(): void;

	/**
	 * Set SSO ticket and initialize the game socket
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as setSSOTicket()
	 */
	setSSOTicket(ticket: string): void;

	/**
	 * Starts the AS3 SSO socket flow once, then lets callers await AUTHENTICATED.
	 */
	startConnectionWithSSO(ticket: string): void;

	/**
	 * Resolves only after HABBO_CONNECTION_EVENT_AUTHENTICATED.
	 */
	waitForAuthentication(timeoutMs?: number): Promise<void>;

	/**
	 * Send connection parameters after handshake completes (encryption enabled)
	 *
	 * AS3 sends: VersionCheckMessageComposer, UniqueIDMessageComposer, SSOTicketMessageComposer
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as sendConnectionParameters()
	 */
	sendConnectionParameters(connection: IConnection): void;

	/**
	 * Called when login is successful (AuthenticationOK received)
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as loginOk()
	 */
	loginOk(): void;

	/**
	 * Handle disconnection
	 *
	 * In AS3 this shows a UI alert via localization - we emit the event for SolidJS to handle.
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as disconnected()
	 */
	disconnected(reason: number, reasonText: string): void;

	/**
	 * Handle error messages from the server
	 *
	 * Routes error codes to appropriate actions:
	 * - 0: Server error (AS3 shows alert)
	 * - 1001-1019: Close connection (fatal errors)
	 * - 4013: Maintenance (AS3 shows alert)
	 * - Other: Generic server error (AS3 shows alert)
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as handleErrorMessage()
	 */
	handleErrorMessage(errorCode: number, messageId: number): void;

	/**
	 * Handle hotel closed message
	 *
	 * In AS3 this shows the login screen with disconnected text.
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as handleLoginFailedHotelClosedMessage()
	 */
	handleLoginFailedHotelClosedMessage(openHour: number, openMinute: number): void;

	/**
	 * Dispatch a login step event
	 *
	 * AS3: Component(context).events.dispatchEvent(new Event(param1))
	 * We emit on the communication manager events (our equivalent of the shared context events)
	 * so that other components (HabboLocalizationManager, connection module) can listen.
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as dispatchLoginStepEvent()
	 */
	dispatchLoginStepEvent(step: HabboCommunicationEventType): void;

	/**
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as initWithSSO()
	 */
	initWithSSO(ticket: string): void;
}
