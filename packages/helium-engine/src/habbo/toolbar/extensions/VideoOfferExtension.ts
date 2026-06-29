import type {HabboToolbar} from '../HabboToolbar';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('VideoOfferExtension');

/**
 * Video offer display extension for the toolbar
 *
 * In AS3 this creates a promotion window for video offers, handles click events
 * on the text region and close button, and communicates with the catalog's
 * video offers system. In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/VideoOfferExtension.as
 */
export class VideoOfferExtension
{
	private static readonly EXTENSION_ID: string = 'video_offer';
	private static readonly LINK_COLOR_NORMAL: number = 0xFFFFFF;
	private static readonly LINK_COLOR_HIGHLIGHT: number = 0xBACB09;
	private static readonly CLOSE_COLOR_NORMAL: number = 0x666666;
	private static readonly CLOSE_COLOR_OVER: number = 0xCCCCCC;

	private _toolbar: HabboToolbar | null;
	private _windowCreated: boolean = false;
	private _dismissed: boolean = false;
	private _offersAvailable: number = 0;

	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;

		log.debug('VideoOfferExtension constructed');
	}

	/**
	 * Whether the extension is disposed
	 */
	get disposed(): boolean
	{
		return this._toolbar == null;
	}

	/**
	 * Whether offers are currently available
	 */
	get hasOffers(): boolean
	{
		return this._offersAvailable > 0 && !this._dismissed;
	}

	/**
	 * Handle club membership change
	 *
	 * Checks if the video offer should be shown or hidden based on club status.
	 */
	public onClubChanged(): void
	{
		if (!this._toolbar) return;

		if (!this._dismissed && !this._windowCreated)
		{
			// In AS3, this triggers catalog.videoOffers.load(this)
			log.debug('Video offer: checking availability after club change');
		}
	}

	/**
	 * Called when video offers become available
	 *
	 * @param count Number of offers available
	 */
	public offersAvailable(count: number): void
	{
		if (!this._toolbar) return;

		this._offersAvailable = count;

		if (count <= 0 || this._dismissed)
		{
			this._windowCreated = false;
			return;
		}

		if (!this._windowCreated)
		{
			this._windowCreated = true;
		}
	}

	/**
	 * Dismiss the video offer (user clicked close)
	 */
	public dismiss(): void
	{
		this._dismissed = true;
		this._windowCreated = false;
	}

	/**
	 * Dispose of this extension
	 */
	public dispose(): void
	{
		if (this._toolbar == null) return;

		this._windowCreated = false;
		this._toolbar = null;
	}
}
