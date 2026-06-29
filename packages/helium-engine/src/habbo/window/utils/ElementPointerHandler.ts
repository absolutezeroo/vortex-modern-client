import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '../IHabboWindowManager';

const log = Logger.getLogger('ElementPointerHandler');

/**
 * Handles element pointer (hint) messages from the server.
 *
 * Listens for ElementPointerMessageEvent and delegates to the window
 * manager's hint API to show or hide element pointers. When the server
 * sends a key, the handler shows the corresponding hint; when the key
 * is null or empty, the handler hides the current hint.
 *
 * In AS3, this directly registered an ElementPointerMessageEvent on
 * the communication manager. In the TS port, since the message event
 * class may not yet exist, we store a reference and provide a public
 * method for processing pointer messages.
 *
 * @see sources/win63_version/habbo/window/utils/ElementPointerHandler.as
 */
export class ElementPointerHandler
{
	private _windowManager: IHabboWindowManager | null;

	/**
	 * Creates a new element pointer handler.
	 *
	 * @param windowManager - The Habbo window manager
	 */
	constructor(windowManager: IHabboWindowManager)
	{
		this._windowManager = windowManager;

		// In AS3:
		//   if(_windowManager.communication != null)
		//   {
		//       var_4013 = new ElementPointerMessageEvent(onElementPointerMessage);
		//       _windowManager.communication.addHabboConnectionMessageEvent(var_4013);
		//   }
		//
		// Communication event registration will be connected when
		// ElementPointerMessageEvent is implemented.

		log.debug('ElementPointerHandler initialized');
	}

	private _disposed: boolean = false;

	/**
	 * Whether this handler has been disposed.
	 */
	public get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Processes an element pointer message.
	 *
	 * Call this when an ElementPointerMessageEvent is received.
	 * Shows the hint for the given key, or hides all hints if
	 * the key is null or empty.
	 *
	 * @param key - The hint element key, or null/empty to hide
	 */
	public onElementPointerMessage(key: string | null): void
	{
		if (!this._windowManager) return;

		if (!key || key.length === 0)
		{
			this._windowManager.hideHint();
		}
		else
		{
			this._windowManager.showHint(key);
		}
	}

	/**
	 * Disposes this handler and unregisters from communication.
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		// In AS3:
		//   if(_windowManager.communication != null)
		//   {
		//       _windowManager.communication.removeHabboConnectionMessageEvent(var_4013);
		//   }
		//
		// Communication event unregistration will be connected when
		// ElementPointerMessageEvent is implemented.

		this._windowManager = null;
		this._disposed = true;
	}
}
