import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('NameChangeController');

/**
 * Name change controller
 *
 * Handles checking name availability and submitting name changes
 * via CheckUserNameMessageComposer and ChangeUserNameMessageComposer.
 *
 * @see source_as_win63/habbo/help/namechange/NameChangeController.as
 */
export class NameChangeController
{
	public static readonly NAME_CHANGE: string = 'TUI_NAME_VIEW';
	private _communication: IHabboCommunicationManager | null = null;

	constructor(communication: IHabboCommunicationManager | null)
	{
		this._communication = communication;
		log.debug('NameChangeController initialized');
	}

	private _disposed: boolean = false;

	/**
	 * Whether this controller has been disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	private _ownUserName: string = '';

	/**
	 * Get the current user's name
	 */
	get ownUserName(): string
	{
		return this._ownUserName;
	}

	private _ownUserId: number = 0;

	/**
	 * Get the current user's ID
	 */
	get ownUserId(): number
	{
		return this._ownUserId;
	}

	/**
	 * Check if a name is available
	 *
	 * @param name The name to check
	 */
	checkName(name: string): void
	{
		log.debug('Check name:', name);
		// Will send CheckUserNameMessageComposer when composers are available
	}

	/**
	 * Submit a name change
	 *
	 * @param name The new name
	 */
	changeName(name: string): void
	{
		log.debug('Change name:', name);
		// Will send ChangeUserNameInRoomMessageComposer when composers are available
	}

	/**
	 * Handle check user name result from server
	 *
	 * @param resultCode The result code (0 = OK)
	 * @param name The checked name
	 * @param suggestions Array of suggested names if not available
	 */
	onCheckUserNameResult(resultCode: number, name: string, suggestions: string[]): void
	{
		if (resultCode === 0)
		{
			log.debug('Name available:', name);
		}
		else
		{
			log.debug('Name not available:', name, 'suggestions:', suggestions);
		}
	}

	/**
	 * Handle change user name result from server
	 *
	 * @param resultCode The result code (0 = success)
	 * @param name The new name
	 */
	onChangeUserNameResult(resultCode: number, name: string): void
	{
		if (resultCode === 0)
		{
			this._ownUserName = name;
			log.debug('Name changed successfully to:', name);
		}
		else
		{
			log.debug('Name change failed - resultCode:', resultCode, 'name:', name);
		}
	}

	/**
	 * Handle user object event to capture own user info
	 *
	 * @param userId The user ID
	 * @param userName The user name
	 */
	onUserObject(userId: number, userName: string): void
	{
		this._ownUserId = userId;
		this._ownUserName = userName;
	}

	/**
	 * Handle user name changed event
	 *
	 * @param webId The user web ID
	 * @param newName The new name
	 */
	onUserNameChanged(webId: number, newName: string): void
	{
		if (this._ownUserId === webId)
		{
			this._ownUserName = newName;
		}
	}

	/**
	 * Show the name change view
	 */
	showView(): void
	{
		log.debug('Show name change view');
	}

	/**
	 * Dispose of this controller
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._communication = null;
		this._disposed = true;
	}
}
