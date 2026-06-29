import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {IConnection} from '@core/communication/connection/IConnection';
import {IncomingMessages} from './IncomingMessages';
import type {HabboCommunicationEventType} from '../enum/HabboCommunicationEvent';
import {HabboCommunicationEvent} from '../enum/HabboCommunicationEvent';
import type {IHabboCommunicationManager} from '../IHabboCommunicationManager';
import {
	SSOTicketMessageComposer,
	UniqueIDMessageComposer,
	VersionCheckMessageComposer,
} from '../messages/outgoing/handshake';
import {CommunicationUtils} from '@habbo/utils/CommunicationUtils';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IHabboCommunicationDemo} from "@habbo/communication/demo/IHabboCommunicationDemo";

const log = Logger.getLogger('CommunicationDemo');

/**
 * Habbo Communication Demo
 *
 * Orchestrates the login/connection flow. Creates and manages IncomingMessages
 * for handling handshake, authentication, ping/pong, and error routing.
 *
 * In AS3 this also manages the login screen UI (HabboLoginDemoScreen),
 * which we skip since the UI is handled by SolidJS.
 *
 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as
 */
export class HabboCommunicationDemo extends Component implements IHabboCommunicationDemo
{
	static readonly ERROR_TYPE_IO_ERROR: string = 'ioError';
	static readonly ERROR_CODE_MAINTENANCE: string = 'maintenance';

	private _incomingMessages: IncomingMessages | null = null;
	private _isDisconnected: boolean = false;
	private _isLoggedIn: boolean = false;
	private _authenticationStarted: boolean = false;

	constructor(context: IContext)
	{
		super(context);
	}

	private _communication: IHabboCommunicationManager | null = null;

	/**
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as communication
	 */
	get communication(): IHabboCommunicationManager | null
	{
		return this._communication;
	}

	private _ssoTicket: string | null = null;

	/**
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as ssoTicket
	 */
	set ssoTicket(value: string)
	{
		this._ssoTicket = value;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				true
			),
		];
	}

	// AS3: sources/win63_version/habbo/communication/demo/class_467.as::initGameSocket()
	initGameSocket(): void
	{
		if (!this._communication)
		{
			log.error('Communication manager not available');
			return;
		}

		if(!this._ssoTicket && this._communication.ssoTicket)
		{
			this._ssoTicket = this._communication.ssoTicket;
		}

		this._authenticationStarted = true;
		this._isDisconnected = false;
		this._isLoggedIn = false;

		this.dispatchLoginStepEvent(HabboCommunicationEvent.INIT);

		// AS3: _communication.mode = 0
		this._communication.initConnection('habbo');

		// Create IncomingMessages after connection exists
		// In AS3 this is created in initComponent() because the connection already exists at that point.
		// In our architecture the connection is created lazily in initConnection().
		if (this._incomingMessages)
		{
			this._incomingMessages.dispose();
		}

		this._incomingMessages = new IncomingMessages(this, this._communication);
	}

	// AS3: sources/win63_version/habbo/communication/demo/class_467.as::setSSOTicket()
	setSSOTicket(ticket: string): void
	{
		if (ticket && !this._ssoTicket)
		{
			this._ssoTicket = ticket;
			this.initGameSocket();
		}
	}

	startConnectionWithSSO(ticket: string): void
	{
		if(!ticket || ticket.length === 0)
		{
			throw new Error('[HabboCommunicationDemo] SSO ticket is required');
		}

		if(this._isLoggedIn || this._authenticationStarted)
		{
			return;
		}

		if(!this._ssoTicket)
		{
			this.setSSOTicket(ticket);
			return;
		}

		this.initWithSSO(ticket);
	}

	waitForAuthentication(timeoutMs: number = 15000): Promise<void>
	{
		if(this._isLoggedIn)
		{
			return Promise.resolve();
		}

		if(this._isDisconnected)
		{
			return Promise.reject(new Error('[HabboCommunicationDemo] Disconnected before authentication'));
		}

		if(!this._communication?.events)
		{
			return Promise.reject(new Error('[HabboCommunicationDemo] Communication manager not available'));
		}

		const events = this._communication.events;

		return new Promise((resolve, reject) =>
		{
			let settled = false;
			let timeoutId: ReturnType<typeof setTimeout> | null = null;

			const cleanup = (): void =>
			{
				if(timeoutId !== null)
				{
					clearTimeout(timeoutId);
					timeoutId = null;
				}

				events.off('loginStep', onLoginStep);
				events.off('disconnected', onDisconnected);
				events.off('connectionError', onConnectionError);
			};

			const resolveAuthenticated = (): void =>
			{
				if(settled) return;

				settled = true;
				cleanup();
				resolve();
			};

			const rejectAuthentication = (error: Error): void =>
			{
				if(settled) return;

				settled = true;
				cleanup();
				reject(error);
			};

			const onLoginStep = (step: HabboCommunicationEventType): void =>
			{
				if(step === HabboCommunicationEvent.AUTHENTICATED)
				{
					resolveAuthenticated();
				}
				else if(step === HabboCommunicationEvent.HANDSHAKE_FAIL)
				{
					rejectAuthentication(new Error('[HabboCommunicationDemo] Handshake failed before authentication'));
				}
			};

			const onDisconnected = (reason: number, reasonText: string): void =>
			{
				const suffix = reasonText && reasonText.length > 0 ? ` (${reasonText})` : '';

				rejectAuthentication(new Error(`[HabboCommunicationDemo] Disconnected before authentication: ${reason}${suffix}`));
			};

			const onConnectionError = (error: Error): void =>
			{
				rejectAuthentication(error);
			};

			events.on('loginStep', onLoginStep);
			events.on('disconnected', onDisconnected);
			events.on('connectionError', onConnectionError);

			timeoutId = setTimeout(() =>
			{
				rejectAuthentication(new Error('[HabboCommunicationDemo] Authentication timed out'));
			}, timeoutMs);
		});
	}

	/**
	 * Send connection parameters after handshake completes (encryption enabled)
	 *
	 * AS3 sends: VersionCheckMessageComposer, UniqueIDMessageComposer, SSOTicketMessageComposer
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as sendConnectionParameters()
	 */
	sendConnectionParameters(connection: IConnection): void
	{
		connection.send(new VersionCheckMessageComposer(
			401,
			this.getProperty('flash.client.url'),
			this.getProperty('external.variables.txt')
		));

		// AS3: machineId = CommunicationUtils.readSOLString("machineid")
		// AS3: fingerprint = CommunicationUtils.generateFingerprint()
		// AS3: flashVersion = Capabilities.version.split(" ").join("/")
		const machineId = CommunicationUtils.readProperty(CommunicationUtils.SOL_PROPERTY_MACHINE_ID, '') ?? '';
		const fingerprint = CommunicationUtils.generateFingerprint();
		const flashVersion = 'HTML5/1.0';

		connection.send(new UniqueIDMessageComposer(machineId, fingerprint, flashVersion));

		if (this._ssoTicket && this._ssoTicket.length > 0)
		{
			connection.send(new SSOTicketMessageComposer(this._ssoTicket));
		}
	}

	// AS3: sources/win63_version/habbo/communication/demo/class_467.as::loginOk()
	loginOk(): void
	{
		this._authenticationStarted = false;
		this._isDisconnected = false;
		this._isLoggedIn = true;

		log.success('Login successful');
	}

	// AS3: sources/win63_version/habbo/communication/demo/class_467.as::disconnected()
	disconnected(reason: number, reasonText: string): void
	{
		this._authenticationStarted = false;
		this._isDisconnected = true;
		this._isLoggedIn = false;

		log.warn(`Disconnected: reason=${reason}, text=${reasonText}`);

		// Emit on the communication manager events (AS3 equivalent: context.events)
		if (this._communication?.events)
		{
			this._communication.events.emit('disconnected', reason, reasonText);
		}
	}

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
	handleErrorMessage(errorCode: number, messageId: number): void
	{
		switch (true)
		{
			case errorCode === 0:
				log.error(`Server error: ${errorCode}`);
				break;

			case errorCode >= 1001 && errorCode <= 1019:
				// AS3: _communication.connection.close()
				log.error(`Fatal server error ${errorCode}, closing connection`);

				if (this._communication?.connection)
				{
					this._communication.connection.close();
				}
				break;

			case errorCode === 4013:
				// AS3: alert("${connection.room.maintenance.title}", ...)
				log.warn('Room maintenance in progress');
				break;

			default:
				log.error(`Server error: ${errorCode} (message: ${messageId})`);
				break;
		}
	}

	/**
	 * Handle hotel closed message
	 *
	 * In AS3 this shows the login screen with disconnected text.
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as handleLoginFailedHotelClosedMessage()
	 */
	handleLoginFailedHotelClosedMessage(openHour: number, openMinute: number): void
	{
		log.warn(`Hotel is closed. Opens at ${openHour}:${String(openMinute).padStart(2, '0')}`);
	}

	/**
	 * Dispatch a login step event
	 *
	 * AS3: Component(context).events.dispatchEvent(new Event(param1))
	 * We emit on the communication manager events (our equivalent of the shared context events)
	 * so that other components (HabboLocalizationManager, connection module) can listen.
	 *
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as dispatchLoginStepEvent()
	 */
	dispatchLoginStepEvent(step: HabboCommunicationEventType): void
	{
		if (!this._communication?.events) return;

		this._communication.events.emit('loginStep', step);
	}

	/**
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as dispose()
	 */
	override dispose(): void
	{
		if (this._incomingMessages)
		{
			this._incomingMessages.dispose();
			this._incomingMessages = null;
		}

		this._communication = null;
	}

	// AS3: sources/win63_version/habbo/communication/demo/class_467.as::initWithSSO()
	initWithSSO(ticket: string): void
	{
		this._ssoTicket = ticket;
		this.initGameSocket();
	}

	/**
	 * @see source_as_win63/habbo/communication/demo/HabboCommunicationDemo.as initComponent()
	 */
	protected override initComponent(): void
	{
		this._isDisconnected = false;

		// Dispose previous IncomingMessages and renew socket
		if (this._incomingMessages)
		{
			this._incomingMessages.dispose();

			if (this._communication)
			{
				// AS3: _communication.renewSocket()
			}
		}

		if (!this._communication)
		{
			log.error('Communication manager not available');
			return;
		}

		// AS3: if (var_1998) initWithSSO(var_1998)
		if (this._ssoTicket)
		{
			this.initWithSSO(this._ssoTicket);
		}
	}
}
