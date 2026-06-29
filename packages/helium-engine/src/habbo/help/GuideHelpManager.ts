import {GuideSessionData} from './GuideSessionData';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('GuideHelpManager');

/**
 * Guide help coordination manager
 *
 * Manages the guide help system, including help requests, guide tool display,
 * session management, and feedback. Coordinates with the toolbar for
 * help/guide icon clicks.
 *
 * @see source_as_win63/habbo/help/GuideHelpManager.as
 */
export class GuideHelpManager
{
	constructor()
	{
		this._guideData = new GuideSessionData();
		log.debug('GuideHelpManager initialized');
	}

	private _disposed: boolean = false;

	/**
	 * Whether this manager has been disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	private _guideData: GuideSessionData;

	/**
	 * Get the guide session data
	 */
	get guideData(): GuideSessionData
	{
		return this._guideData;
	}

	/**
	 * Show the guide tool window
	 */
	showGuideTool(): void
	{
		log.debug('Show guide tool');
	}

	/**
	 * Create a help request
	 *
	 * @param type The request type (0 = help, 1 = tour, 2 = bully)
	 */
	createHelpRequest(type: number, message?: string): void
	{
		log.debug('Create help request - type:', type);
	}

	/**
	 * Open the report window for guide reporting
	 */
	openReportWindow(): void
	{
		log.debug('Open report window');
	}

	/**
	 * Open the tour popup
	 */
	openTourPopup(): void
	{
		log.debug('Open tour popup');
	}

	/**
	 * Show feedback with a localization code
	 *
	 * @param localizationCode The localization key for the feedback message
	 */
	showFeedback(localizationCode: string): void
	{
		log.debug('Show feedback:', localizationCode);
	}

	/**
	 * Dispose of this manager
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
	}
}
