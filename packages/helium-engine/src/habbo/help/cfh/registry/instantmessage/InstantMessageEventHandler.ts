import type {InstantMessageRegistry} from './InstantMessageRegistry';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('InstantMessageEventHandler');

/**
 * Instant message event listener for CFH reports
 *
 * Captures console messages and room invites and stores them
 * in the InstantMessageRegistry for later use in CFH reports.
 *
 * @see source_as_win63/habbo/help/cfh/registry/instantmessage/InstantMessageEventHandler.as
 */
export class InstantMessageEventHandler
{
	private _registry: InstantMessageRegistry;

	constructor(registry: InstantMessageRegistry)
	{
		this._registry = registry;
		log.debug('InstantMessageEventHandler initialized');
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
	 * Handle an instant message event
	 *
	 * @param userId The sender user ID
	 * @param userName The sender user name
	 * @param text The message text
	 */
	onInstantMessage(userId: number, userName: string, text: string): void
	{
		if (this._disposed) return;

		this._registry.addItem(userId, userName, text);
	}

	/**
	 * Handle a room invite event
	 *
	 * @param senderId The sender user ID
	 * @param text The invite message text
	 */
	onRoomInvite(senderId: number, text: string): void
	{
		if (this._disposed) return;

		this._registry.addItem(senderId, '', text);
	}

	/**
	 * Dispose of this handler
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
	}
}
