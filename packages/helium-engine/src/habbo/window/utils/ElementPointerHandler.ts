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
	// AS3: sources/win63_version/habbo/window/utils/ElementPointerHandler.as::_windowManager
	private _windowManager: IHabboWindowManager | null;

	// AS3: sources/win63_version/habbo/window/utils/ElementPointerHandler.as::var_3740
	// TODO(AS3): ElementPointerMessageEvent field — register when class is ported
	// sources/win63_version/habbo/window/utils/ElementPointerHandler.as::var_3740

	// AS3: sources/win63_version/habbo/window/utils/ElementPointerHandler.as::ElementPointerHandler()
	constructor(windowManager: IHabboWindowManager)
	{
		this._windowManager = windowManager;

		// TODO(AS3): register ElementPointerMessageEvent on communication when ported
		// sources/win63_version/habbo/window/utils/ElementPointerHandler.as::ElementPointerHandler()

		log.debug('ElementPointerHandler initialized');
	}

	// TS-only: explicit disposed flag (AS3 uses _windowManager == null check)
	private _disposed: boolean = false;

	// AS3: sources/win63_version/habbo/window/utils/ElementPointerHandler.as::get disposed()
	public get disposed(): boolean
	{
		return this._windowManager == null;
	}

	// AS3: sources/win63_version/habbo/window/utils/ElementPointerHandler.as::onElementPointerMessage()
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

	// AS3: sources/win63_version/habbo/window/utils/ElementPointerHandler.as::dispose()
	public dispose(): void
	{
		if (this._disposed) return;

		// TODO(AS3): unregister ElementPointerMessageEvent from communication when ported
		// sources/win63_version/habbo/window/utils/ElementPointerHandler.as::dispose()

		this._windowManager = null;
		this._disposed = true;
	}
}
