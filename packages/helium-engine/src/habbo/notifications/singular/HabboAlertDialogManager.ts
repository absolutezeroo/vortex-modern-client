import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('HabboAlertDialogManager');

/**
 * Events emitted by the alert dialog manager
 */
export interface HabboAlertDialogManagerEvents
{
	'moderatorCaution': (message: string, url: string) => void;
	'moderatorMessage': (message: string, url: string) => void;
	'userBanned': (message: string) => void;
	'hotelClosing': (minutesUntilClosing: number) => void;
	'hotelMaintenance': (minutesUntilMaintenance: number, duration: number) => void;
	'hotelClosed': (openHour: number, openMinute: number, userThrownOutAtClose: boolean) => void;
	'loginFailedHotelClosed': (openHour: number, openMinute: number) => void;
}

/**
 * Manages alert dialogs for moderation, ban, and maintenance messages.
 * In the AS3 source this directly creates window dialogs; here we emit events
 * for the UI layer to handle.
 *
 * @see source_as_win63/habbo/notifications/singular/HabboAlertDialogManager.as
 */
export class HabboAlertDialogManager extends EventEmitter<HabboAlertDialogManagerEvents>
{
	constructor()
	{
		super();
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Zero-pad a time value to two digits
	 */
	private static getTimeZeroPadded(value: number): string
	{
		const padded = '0' + String(value);
		return padded.substring(padded.length - 2);
	}

	/**
	 * Handle a moderator caution message
	 *
	 * @param message The caution message text
	 * @param url Optional URL link
	 */
	handleModeratorCaution(message: string, url: string = ''): void
	{
		this.showModerationMessage(message, url);
	}

	/**
	 * Handle a moderator message
	 *
	 * @param message The moderator message text
	 * @param url Optional URL link
	 */
	handleModeratorMessage(message: string, url: string = ''): void
	{
		this.showModerationMessage(message, url, false);
	}

	/**
	 * Handle a user banned message
	 *
	 * @param message The ban message text
	 */
	handleUserBannedMessage(message: string): void
	{
		const cleanMessage = message.replace(/\\r/g, '\r');
		this.emit('userBanned', cleanMessage);
		log.info('User banned message received');
	}

	/**
	 * Handle hotel closing message
	 *
	 * @param minutesUntilClosing Minutes until the hotel closes
	 */
	handleHotelClosingMessage(minutesUntilClosing: number): void
	{
		this.emit('hotelClosing', minutesUntilClosing);
		log.info(`Hotel closing in ${minutesUntilClosing} minutes`);
	}

	/**
	 * Handle hotel maintenance message
	 *
	 * @param minutesUntilMaintenance Minutes until maintenance begins
	 * @param duration Expected duration of the maintenance
	 */
	handleHotelMaintenanceMessage(minutesUntilMaintenance: number, duration: number): void
	{
		this.emit('hotelMaintenance', minutesUntilMaintenance, duration);
		log.info(`Hotel maintenance in ${minutesUntilMaintenance} minutes, duration ${duration}`);
	}

	/**
	 * Handle hotel closed message
	 *
	 * @param openHour Hour the hotel will reopen
	 * @param openMinute Minute the hotel will reopen
	 * @param userThrownOutAtClose Whether the user was thrown out at close
	 */
	handleHotelClosedMessage(openHour: number, openMinute: number, userThrownOutAtClose: boolean): void
	{
		const hourStr = HabboAlertDialogManager.getTimeZeroPadded(openHour);
		const minuteStr = HabboAlertDialogManager.getTimeZeroPadded(openMinute);

		this.emit('hotelClosed', openHour, openMinute, userThrownOutAtClose);
		log.info(`Hotel closed, reopens at ${hourStr}:${minuteStr}, thrownOut=${userThrownOutAtClose}`);
	}

	/**
	 * Handle login failed because hotel is closed
	 *
	 * @param openHour Hour the hotel will reopen
	 * @param openMinute Minute the hotel will reopen
	 */
	handleLoginFailedHotelClosedMessage(openHour: number, openMinute: number): void
	{
		const hourStr = HabboAlertDialogManager.getTimeZeroPadded(openHour);
		const minuteStr = HabboAlertDialogManager.getTimeZeroPadded(openMinute);

		this.emit('loginFailedHotelClosed', openHour, openMinute);
		log.info(`Login failed, hotel closed. Reopens at ${hourStr}:${minuteStr}`);
	}

	dispose(): void
	{
		if (this._disposed) return;

		this.removeAllListeners();
		this._disposed = true;
	}

	/**
	 * Show a moderation message.
	 * In AS3 this creates a simpleAlert dialog. Here we emit an event.
	 */
	private showModerationMessage(message: string, url: string, _showHabboWay: boolean = true): void
	{
		const cleanMessage = message.replace(/\\r/g, '\r');

		if (url)
		{
			this.emit('moderatorMessage', cleanMessage, url);
		}
		else
		{
			this.emit('moderatorCaution', cleanMessage, url);
		}

		log.info('Moderation message received');
	}
}
