import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IAssetLibrary} from '@core/assets';
import {Logger} from '@core/utils/Logger';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {
	AuthenticationOKMessageEvent
} from '@habbo/communication/messages/incoming/handshake/AuthenticationOKMessageEvent';
import {RoomEntryInfoMessageEvent} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';
import type {
	RoomEntryInfoMessageParser
} from '@habbo/communication/messages/parser/room/engine/RoomEntryInfoMessageParser';
import {
	LatencyPingResponseMessageEvent
} from '@habbo/communication/messages/incoming/tracking/LatencyPingResponseMessageEvent';
import type {
	LatencyPingResponseMessageParser
} from '@habbo/communication/messages/parser/tracking/LatencyPingResponseMessageParser';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import type {IHabboTracking} from './IHabboTracking';
import {HabboLoginTrackingStep} from './HabboLoginTrackingStep';
import {LatencyTracker} from './LatencyTracker';
import {FramerateTracker} from './FramerateTracker';
import {LagWarningLogger} from './LagWarningLogger';
import {ToolbarClickTracker} from './ToolbarClickTracker';
import {PerformanceTracker} from './PerformanceTracker';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";

/* eslint-disable @typescript-eslint/no-explicit-any */

const log = Logger.getLogger('HabboTracking');

/**
 * Main tracking component for the Habbo client.
 *
 * Manages all sub-trackers (latency, framerate, lag warnings, toolbar clicks)
 * and provides methods for event logging, Google Analytics tracking, and
 * error reporting. Implements the IUpdateReceiver interface for frame-based updates.
 *
 * @see source_as_win63/habbo/tracking/HabboTracking.as
 */
export class HabboTracking extends Component implements IHabboTracking, IUpdateReceiver
{
	private static readonly ERROR_DATA_FLAG_COUNT: number = 11;

	private _communication: IHabboCommunicationManager | null = null;
	private _messageEvents: IMessageEvent[] = [];
	private _errorContextFlags: number[] = [];
	private _hasFatalError: boolean = false;

	// Sub-trackers
	private _framerateTracker: FramerateTracker | null = null;
	private _latencyTracker: LatencyTracker | null = null;
	private _lagWarningLogger: LagWarningLogger | null = null;
	private _toolbarClickTracker: ToolbarClickTracker | null = null;
	private _performanceTracker: PerformanceTracker | null = null;

	// State
	private _hasEnteredRoom: boolean = false;
	private _currentTime: number = -1;
	private _invalidTimeCounter: number = 0;
	private _timeLeapCounter: number = 0;
	private _onceTrackedEvents: Set<string> = new Set();

	constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, flags, assetLibrary);
	}

	/**
	 * Component dependencies
	 */
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

	/**
	 * Send a message composer via the communication manager
	 *
	 * @param composer The message composer to send
	 */
	send(composer: IMessageComposer<unknown[]>): void
	{
		if (this._communication?.connection?.connected)
		{
			this._communication.connection.send(composer);
		}
	}

	/**
	 * Track an event via Google Analytics (no-op in web client)
	 *
	 * @param category The event category
	 * @param action The event action
	 * @param label Optional numeric label
	 */
	trackGoogle(category: string, action: string, label: number = -1): void
	{
		log.debug(`[GA] ${category}/${action}${label >= 0 ? '/' + label : ''}`);
	}

	/**
	 * Legacy Google Analytics tracking (no-op in web client)
	 *
	 * @param category The event category
	 * @param action The event action
	 * @param labels Optional array of label values
	 */
	legacyTrackGoogle(category: string, action: string, labels?: unknown[]): void
	{
		log.debug(`[GA Legacy] ${category}/${action}`, labels ?? '');
	}

	/**
	 * Log an error message
	 *
	 * @param message The error message
	 */
	logError(message: string): void
	{
		log.error('logError:', message);
	}

	/**
	 * Report a detected chat lag event
	 *
	 * @param lagAmount The amount of lag detected
	 */
	chatLagDetected(lagAmount: number): void
	{
		if (this._lagWarningLogger)
		{
			this._lagWarningLogger.chatLagDetected(lagAmount);
		}
	}

	/**
	 * Track an event log to the server via EventLogMessageComposer
	 *
	 * @param type The event type
	 * @param value The event value
	 * @param unit The event unit
	 * @param extra Optional extra string data
	 * @param roomId Optional room ID
	 */
	trackEventLog(type: string, value: string, unit: string, extra: string = '', roomId: number = 0): void
	{
		if (this._communication?.connection?.connected)
		{
			this._communication.connection.send(
				new EventLogMessageComposer(type, value, unit, extra, roomId)
			);
		}
	}

	/**
	 * Track an event log only once per session
	 *
	 * @param type The event type
	 * @param value The event value
	 * @param unit The event unit
	 * @param extra Optional extra string data
	 * @param roomId Optional room ID
	 */
	trackEventLogOncePerSession(type: string, value: string, unit: string, extra: string = '', roomId: number = 0): void
	{
		const key = type + value + unit;

		if (!this._onceTrackedEvents.has(key))
		{
			this.trackEventLog(type, value, unit, extra, roomId);
			this._onceTrackedEvents.add(key);
		}
	}

	/**
	 * Track a talent track open event
	 *
	 * @param talentType The talent type
	 * @param talentId The talent identifier
	 */
	trackTalentTrackOpen(talentType: string, talentId: string): void
	{
		this.trackEventLog('Talent', talentType, 'talent.open', talentId);
	}

	/**
	 * Track a login step for analytics
	 *
	 * @param step The login step identifier
	 * @param extra Optional extra data
	 */
	trackLoginStep(step: string, extra?: string): void
	{
		log.info('Track Login Step:', step, extra ?? '');

		if (!this.getBoolean('processlog.enabled'))
		{
			return;
		}

		// In the web client, login step tracking is handled differently
		// than in the Flash client (no ExternalInterface)
		log.debug(`[LoginStep] ${step}${extra ? ' ' + extra : ''}`);
	}

	/**
	 * Frame update callback
	 *
	 * @param deltaTime Time since last update in milliseconds
	 */
	update(deltaTime: number): void
	{
		const currentTime = performance.now();

		if (this._currentTime > -1 && currentTime < this._currentTime)
		{
			this._invalidTimeCounter++;
			log.warn('Invalid time detected, count:', this._invalidTimeCounter);
		}

		if (this._currentTime > -1 && currentTime - this._currentTime > 15000)
		{
			this._timeLeapCounter++;
			log.warn('Time leap detected, count:', this._timeLeapCounter);
		}

		this._currentTime = currentTime;

		if (this._latencyTracker)
		{
			this._latencyTracker.update(deltaTime, this._currentTime);
		}

		if (this._framerateTracker)
		{
			this._framerateTracker.trackUpdate(deltaTime, this._currentTime);
		}

		if (this._performanceTracker)
		{
			this._performanceTracker.update(deltaTime, this._currentTime);
		}

		if (this._lagWarningLogger)
		{
			this._lagWarningLogger.update(this._currentTime);
		}
	}

	/**
	 * Track a toolbar button click
	 *
	 * @param buttonName The name of the clicked button
	 */
	trackToolbarClick(buttonName: string): void
	{
		if (this._toolbarClickTracker)
		{
			this._toolbarClickTracker.track(buttonName);
		}
	}

	/**
	 * Dispose of the tracking component and all sub-trackers
	 */
	override dispose(): void
	{
		if (this.disposed)
		{
			return;
		}

		this.removeUpdateReceiver(this);

		if (this._messageEvents.length > 0 && this._communication)
		{
			for (const event of this._messageEvents)
			{
				this._communication.removeMessageEvent(event);
			}
		}

		this._messageEvents.length = 0;
		this._framerateTracker = null;
		this._toolbarClickTracker = null;
		this._performanceTracker = null;

		if (this._latencyTracker)
		{
			this._latencyTracker.dispose();
			this._latencyTracker = null;
		}

		this._lagWarningLogger = null;

		super.dispose();
	}

	/**
	 * Called when all required dependencies are available
	 */
	protected override initComponent(): void
	{
		// Initialize error context flags array
		for (let i = 0; i < HabboTracking.ERROR_DATA_FLAG_COUNT; i++)
		{
			this._errorContextFlags.push(0);
		}

		// Register for frame updates
		this.registerUpdateReceiver(this, 1);

		this._latencyTracker = new LatencyTracker(this);
		this._framerateTracker = new FramerateTracker(this);
		this._lagWarningLogger = new LagWarningLogger(this);
		this._toolbarClickTracker = new ToolbarClickTracker(this);
		this._performanceTracker = new PerformanceTracker(this);

		// Register message events
		this.addMessageEvent(new AuthenticationOKMessageEvent(this.onAuthOK.bind(this)));
		this.addMessageEvent(new RoomEntryInfoMessageEvent(this.onRoomEnter.bind(this)));
		this.addMessageEvent(new LatencyPingResponseMessageEvent(this.onPingResponse.bind(this)));

		// Initialize latency tracker once configuration is available
		if (this._latencyTracker)
		{
			this._latencyTracker.init();
		}

		log.info('HabboTracking initialized');
	}

	/**
	 * Register a message event with the communication manager
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
	 * Set an error context flag at the given index
	 */
	private setErrorContextFlag(value: number, index: number): void
	{
		if (index >= 0 && index < this._errorContextFlags.length)
		{
			this._errorContextFlags[index] = value;
		}
	}

	/**
	 * Handler for AuthenticationOK message
	 */
	private onAuthOK(_event: IMessageEvent): void
	{
		this.legacyTrackGoogle('authentication', 'authok');
		this.trackLoginStep(HabboLoginTrackingStep.AUTHENTICATED);
	}

	/**
	 * Handler for latency ping response
	 */
	private onPingResponse(event: IMessageEvent): void
	{
		if (this._latencyTracker)
		{
			const parser = (event as LatencyPingResponseMessageEvent).parser as LatencyPingResponseMessageParser;
			this._latencyTracker.onPingResponse(parser);
		}
	}

	/**
	 * Handler for room entry
	 */
	private onRoomEnter(event: IMessageEvent): void
	{
		if (!this._hasEnteredRoom)
		{
			this.trackLoginStep(HabboLoginTrackingStep.ROOM_ENTER);
			this._hasEnteredRoom = true;
		}

		const parser = (event as RoomEntryInfoMessageEvent).parser as RoomEntryInfoMessageParser;
		this.legacyTrackGoogle('navigator', 'private', [parser.guestRoomId]);
	}
}
