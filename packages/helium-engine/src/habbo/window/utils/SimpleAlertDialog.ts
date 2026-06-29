import {Logger} from '@core/utils/Logger';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IModalDialog} from './IModalDialog';

const log = Logger.getLogger('SimpleAlertDialog');

/**
 * Simplified alert dialog with optional subtitle, link, and illustration.
 *
 * Unlike {@link AlertDialog}, this dialog uses a fixed layout asset
 * (`simple_alert_xml`) and provides a streamlined constructor that
 * accepts all content parameters at once. It always displays as a
 * modal dialog with no close button in the header.
 *
 * Features:
 * - Title + optional subtitle
 * - Message text
 * - Optional clickable link (opens URL or fires a link event)
 * - Optional illustration image
 * - Close button at the bottom
 *
 * In AS3, the layout was loaded from the `simple_alert_xml` asset.
 * The illustration resize handling (which adjusted layout based on
 * bitmap dimensions) is preserved for the XML layout system.
 *
 * @see sources/win63_version/habbo/window/utils/SimpleAlertDialog.as
 * @see sources/flash_version/com/sulake/habbo/window/utils/SimpleAlertDialog.as
 */
export class SimpleAlertDialog implements IDisposable
{
	private static readonly WINDOW_MARGIN: number = 10;
	private _modalDialog: IModalDialog | null = null;
	private _linkUrl: string = '';
	private _window: IWindowContainer | null = null;
	private _listMain: IWindow | null = null;
	private _listTop: IWindow | null = null;
	private _listBottom: IWindow | null = null;
	private _messageWindow: IWindow | null = null;
	private _subtitleWindow: IWindow | null = null;
	private _linkWindow: IWindow | null = null;
	private _illustrationWindow: IWindow | null = null;
	private _linkClickCallback: (() => void) | null = null;
	private _closeCallback: (() => void) | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	/**
	 * Creates a new simple alert dialog.
	 *
	 * @param windowManager - The Habbo window manager
	 * @param title - Dialog title
	 * @param subtitle - Optional subtitle text (null or empty to omit)
	 * @param message - The main message text
	 * @param linkCaption - Optional link button text (null or empty to omit)
	 * @param linkUrl - Optional URL for the link button
	 * @param parameters - Optional map of localization parameters to register
	 * @param illustrationUrl - Optional illustration image URL (null or empty to omit)
	 * @param linkClickCallback - Optional callback invoked when the link is clicked
	 * @param closeCallback - Optional callback invoked when the dialog is closed
	 */
	constructor(
		windowManager: IHabboWindowManager,
		title: string,
		subtitle: string | null,
		message: string,
		linkCaption: string | null,
		linkUrl: string | null,
		parameters: Map<string, string> | null,
		illustrationUrl: string | null,
		linkClickCallback: (() => void) | null,
		closeCallback: (() => void) | null
	)
	{
		this._linkClickCallback = linkClickCallback;
		this._closeCallback = closeCallback;
		this._windowManager = windowManager;

		// In AS3: loads "simple_alert_xml" asset and builds a modal dialog from it.
		const layout = windowManager.getLayout('simple_alert') as unknown;
		const layoutXml = typeof layout === 'string' ? layout : '';

		if (!layoutXml)
		{
			log.warn('Missing simple_alert XML layout');
			return;
		}

		this._modalDialog = windowManager.buildModalDialogFromXML(layoutXml);
		this._window = this._modalDialog?.rootWindow as IWindowContainer ?? null;

		if (!this._window)
		{
			log.warn('Failed to create SimpleAlertDialog window');
			return;
		}

		// Resolve child windows
		this._listMain = this._window.findChildByName('list');
		this._listTop = this._window.findChildByName('list_top');
		this._listBottom = this._window.findChildByName('list_bottom');
		this._messageWindow = this._window.findChildByName('message');
		this._subtitleWindow = this._window.findChildByName('subtitle');
		this._linkWindow = this._window.findChildByName('link');
		this._illustrationWindow = this._window.findChildByName('illustration');

		// Remove close button from header (simple alert has its own close)
		const headerClose = this._window.findChildByName('header_button_close');

		if (headerClose)
		{
			headerClose.dispose();
		}

		// Set window procedure
		this._window.procedure = (event: WindowEvent, window: IWindow) => this.windowProcedure(event, window);

		// Set title and message
		this._window.caption = title;

		if (this._messageWindow)
		{
			this._messageWindow.caption = message;
		}

		// Register localization parameters if provided
		if (parameters)
		{
			const textsToProcess = [title, subtitle, message, linkCaption];

			for (const text of textsToProcess)
			{
				if (text && text.substring(0, 2) === '${' && text.indexOf('}') > 0)
				{
					const key = text.substring(2, text.indexOf('}'));

					for (const [paramKey, paramValue] of parameters)
					{
						windowManager.registerLocalizationParameter(key, paramKey, paramValue);
					}
				}
			}
		}

		// Set subtitle or remove if empty
		if (subtitle && subtitle.length > 0)
		{
			if (this._subtitleWindow)
			{
				this._subtitleWindow.caption = subtitle;
			}
		}
		else
		{
			if (this._subtitleWindow)
			{
				this._subtitleWindow.dispose();
				this._subtitleWindow = null;
			}
		}

		// Set link or remove if empty
		if (linkCaption && linkCaption.length > 0 && ((linkUrl && linkUrl.length > 0) || linkClickCallback))
		{
			if (this._linkWindow)
			{
				this._linkWindow.caption = linkCaption;
				this._linkWindow.addEventListener(WindowMouseEvent.CLICK, () => this.onSimpleAlertClick());
				this._linkWindow.immediateClickMode = true;
				this._linkUrl = linkUrl ?? '';
			}
		}
		else
		{
			if (this._linkWindow)
			{
				this._linkWindow.dispose();
				this._linkWindow = null;
			}
		}

		// Set illustration or remove if empty
		if (illustrationUrl && illustrationUrl.length > 0)
		{
			if (this._illustrationWindow)
			{
				this._illustrationWindow.addEventListener(WindowEvent.WE_RESIZED, () => this.onIllustrationResized());
				// In AS3: assetUri = illustrationUrl triggers async load
				// The illustration load is handled by the UI layer
			}
		}
		else
		{
			if (this._illustrationWindow)
			{
				this._illustrationWindow.dispose();
				this._illustrationWindow = null;
			}
		}

		this.resizeWindow();
	}

	private _disposed: boolean = false;

	/**
	 * Whether this dialog has been disposed.
	 */
	public get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Disposes this dialog and all its resources.
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		this.close();
		this._windowManager = null;
		this._disposed = true;
	}

	/**
	 * Closes the dialog and invokes the close callback.
	 */
	private close(): void
	{
		if (this._closeCallback)
		{
			this._closeCallback();
		}

		if (this._modalDialog)
		{
			if (this._linkWindow)
			{
				this._linkWindow = null;
			}

			if (this._illustrationWindow)
			{
				this._illustrationWindow = null;
			}

			this._window = null;
			this._listMain = null;
			this._listTop = null;
			this._listBottom = null;
			this._messageWindow = null;
			this._subtitleWindow = null;
			this._linkClickCallback = null;
			this._closeCallback = null;

			this._modalDialog.dispose();
			this._modalDialog = null;
		}
	}

	/**
	 * Handles window events.
	 *
	 * Listens for click on the close button to dispose the dialog.
	 *
	 * @param event - The window event
	 * @param window - The window that triggered the event
	 */
	private windowProcedure(event: WindowEvent, window: IWindow): void
	{
		if (event.type === WindowMouseEvent.CLICK && window.name === 'close_button')
		{
			this.dispose();
		}
	}

	/**
	 * Handles the link click.
	 *
	 * If the URL starts with "event:", it creates a link event
	 * and disposes the dialog. For regular URLs, it opens them
	 * in a new browser tab.
	 */
	private onSimpleAlertClick(): void
	{
		if (this._linkUrl && this._linkUrl.length > 0)
		{
			if (this._linkUrl.substring(0, 6) === 'event:')
			{
				// In AS3: context.createLinkEvent(url.substr(6))
				// Link events are handled by the engine's link event system
				log.debug(`Link event: ${this._linkUrl.substring(6)}`);
				this.dispose();
			}
			else
			{
				// In AS3: HabboWebTools.openWebPage(url, "habboMain")
				globalThis.window?.open(this._linkUrl, '_blank');
			}
		}
		else if (this._linkClickCallback)
		{
			this._linkClickCallback();
			this.dispose();
		}
	}

	/**
	 * Handles illustration resize events.
	 *
	 * Adjusts the layout when the illustration finishes loading
	 * and its dimensions become known.
	 */
	private onIllustrationResized(): void
	{
		if (!this._illustrationWindow || !this._listTop || !this._listBottom || !this._window) return;

		this._listTop.x = this._illustrationWindow.width + SimpleAlertDialog.WINDOW_MARGIN;

		const rightEdge = this._listTop.x + this._listTop.width;
		this._listBottom.width = rightEdge;
		this._window.width = rightEdge + 2 * SimpleAlertDialog.WINDOW_MARGIN;

		this.resizeWindow();
	}

	/**
	 * Resizes and re-centers the window based on content.
	 */
	private resizeWindow(): void
	{
		if (!this._window || !this._listMain) return;

		// In AS3, arrangeListItems() triggers layout recalculation
		// on IItemListWindow. In the TS port, the layout system
		// handles this via invalidation.
		this._window.height = this._listMain.height + 40;
		this._window.center();
	}
}
