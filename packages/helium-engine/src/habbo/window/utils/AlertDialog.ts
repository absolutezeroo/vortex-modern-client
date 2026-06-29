import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {HabboAlertDialogFlag} from '../enum/HabboAlertDialogFlag';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {ICaption} from './AlertDialogCaption';
import {AlertDialogCaption} from './AlertDialogCaption';
import type {IModalDialog} from './IModalDialog';

/**
 * Callback type for alert dialog events.
 *
 * The callback receives the dialog instance and a WindowEvent
 * indicating the action (WE_OK or WE_CANCEL).
 */
export type AlertDialogCallback = (dialog: IDisposable, event: WindowEvent) => void;

/**
 * Interface for alert dialogs.
 *
 * In AS3 this was the obfuscated `class_3348` / `IAlertDialog` interface.
 * Combines the INotify base (title, summary, callback) with button
 * caption management (getButtonCaption, setButtonCaption).
 *
 * @see sources/win63_version/core/window/utils/class_3348.as
 * @see sources/flash_version/com/sulake/habbo/window/utils/IAlertDialog.as
 */
export interface IAlertDialog extends IDisposable
{
	title: string;
	summary: string;
	callback: AlertDialogCallback | null;
	titleBarColor: number;

	getButtonCaption(buttonFlag: number): ICaption | null;

	setButtonCaption(buttonFlag: number, caption: ICaption): void;
}

/**
 * Alert dialog with configurable buttons.
 *
 * Displays a framed dialog window with a title, summary text, and
 * a configurable set of buttons (OK, Cancel, Custom). Buttons that
 * are not included in the flags are removed from the layout.
 *
 * When a button is clicked, the dialog either invokes its callback
 * with a WE_OK or WE_CANCEL event, or self-disposes if no callback
 * is set.
 *
 * In AS3 this implemented `class_3348` (IAlertDialog) and `INotify`.
 * The window is built from XML via `buildFromXML`.
 *
 * @see sources/win63_version/habbo/window/utils/AlertDialog.as
 * @see sources/flash_version/com/sulake/habbo/window/utils/AlertDialog.as
 */
export class AlertDialog implements IAlertDialog
{
	protected static readonly LIST_BUTTONS: string = '_alert_button_list';
	protected static readonly BUTTON_OK: string = '_alert_button_ok';
	protected static readonly BUTTON_CANCEL: string = '_alert_button_cancel';
	protected static readonly BUTTON_CUSTOM: string = '_alert_button_custom';
	protected static readonly HEADER_BUTTON_CLOSE: string = 'header_button_close';
	protected static readonly TEXT_SUMMARY: string = '_alert_text_summary';

	private static _instanceCounter: number = 0;
	protected _window: IWindowContainer | null = null;
	protected _modalDialog: IModalDialog | null = null;

	/**
	 * Creates a new alert dialog.
	 *
	 * @param windowManager - The Habbo window manager
	 * @param xml - The XML layout definition
	 * @param title - Dialog title
	 * @param summary - Dialog summary text
	 * @param flags - Bitwise HabboAlertDialogFlag values controlling which elements appear
	 * @param callback - Optional callback for button events
	 * @param modal - Whether to display as a modal dialog
	 */
	constructor(
		windowManager: IHabboWindowManager,
		xml: string,
		title: string,
		summary: string,
		flags: number,
		callback: AlertDialogCallback | null,
		modal: boolean
	)
	{
		AlertDialog._instanceCounter++;

		if (modal)
		{
			// Build as modal: creates dimmed background + centered window
			this._modalDialog = windowManager.buildModalDialogFromXML(xml);
			this._window = this._modalDialog?.rootWindow as IWindowContainer ?? null;
		}
		else
		{
			// Build as non-modal in the dialog layer (2)
			this._window = windowManager.buildFromXML(xml, 2) as IWindowContainer;
		}

		// Default flags: BUTTON_OK | TEXT_TITLE | TEXT_SUMMARY
		if (flags === HabboAlertDialogFlag.NULL)
		{
			flags = HabboAlertDialogFlag.BUTTON_OK | HabboAlertDialogFlag.TEXT_TITLE | HabboAlertDialogFlag.TEXT_SUMMARY;
		}

		// Remove buttons that are not in the flags
		if (this._window)
		{
			const buttonList = this._window.findChildByName(AlertDialog.LIST_BUTTONS);

			if (buttonList)
			{
				if (!(flags & HabboAlertDialogFlag.BUTTON_OK))
				{
					const okButton = (buttonList as IWindowContainer).getChildByName?.(AlertDialog.BUTTON_OK);

					if (okButton) okButton.dispose();
				}

				if (!(flags & HabboAlertDialogFlag.BUTTON_CANCEL))
				{
					const cancelButton = (buttonList as IWindowContainer).getChildByName?.(AlertDialog.BUTTON_CANCEL);

					if (cancelButton) cancelButton.dispose();
				}

				if (!(flags & HabboAlertDialogFlag.BUTTON_CUSTOM))
				{
					const customButton = (buttonList as IWindowContainer).getChildByName?.(AlertDialog.BUTTON_CUSTOM);

					if (customButton) customButton.dispose();
				}
			}

			this._window.procedure = (event: WindowEvent, window: IWindow) => this.dialogEventProc(event, window);
			this._window.center();
		}

		this.title = title;
		this.summary = summary;
		this.callback = callback;
	}

	protected _title: string = '';

	/**
	 * Gets the dialog title.
	 */
	public get title(): string
	{
		return this._title;
	}

	/**
	 * Sets the dialog title.
	 */
	public set title(value: string)
	{
		this._title = value;

		if (this._window)
		{
			this._window.caption = this._title;
		}
	}

	protected _summary: string = '';

	/**
	 * Gets the dialog summary text.
	 */
	public get summary(): string
	{
		return this._summary;
	}

	/**
	 * Sets the dialog summary text.
	 */
	public set summary(value: string)
	{
		this._summary = value;

		if (this._window)
		{
			const descriptionWindow = this._window.findChildByTag('DESCRIPTION');

			if (descriptionWindow)
			{
				descriptionWindow.caption = this._summary;
			}
		}
	}

	protected _disposed: boolean = false;

	/**
	 * Whether this dialog has been disposed.
	 */
	public get disposed(): boolean
	{
		return this._disposed;
	}

	protected _callback: AlertDialogCallback | null = null;

	/**
	 * Gets the dialog callback.
	 */
	public get callback(): AlertDialogCallback | null
	{
		return this._callback;
	}

	/**
	 * Sets the dialog callback.
	 */
	public set callback(value: AlertDialogCallback | null)
	{
		this._callback = value;
	}

	/**
	 * Gets the title bar color.
	 */
	public get titleBarColor(): number
	{
		if (!this._window) return 0;

		return this._window.color;
	}

	/**
	 * Sets the title bar color.
	 */
	public set titleBarColor(value: number)
	{
		if (!this._window) return;

		this._window.color = value;
	}

	/**
	 * Gets the caption of a button by its flag.
	 *
	 * @param buttonFlag - One of HabboAlertDialogFlag.BUTTON_OK, BUTTON_CANCEL, or BUTTON_CUSTOM
	 * @returns The button caption, or null if not found
	 */
	public getButtonCaption(buttonFlag: number): ICaption | null
	{
		if (this._disposed || !this._window) return null;

		let buttonName: string | null = null;

		switch (buttonFlag)
		{
			case HabboAlertDialogFlag.BUTTON_OK:
				buttonName = AlertDialog.BUTTON_OK;
				break;
			case HabboAlertDialogFlag.BUTTON_CANCEL:
				buttonName = AlertDialog.BUTTON_CANCEL;
				break;
			case HabboAlertDialogFlag.BUTTON_CUSTOM:
				buttonName = AlertDialog.BUTTON_CUSTOM;
				break;
		}

		if (!buttonName) return null;

		const button = this._window.findChildByName(buttonName);

		if (!button) return null;

		return new AlertDialogCaption(
			button.caption ?? '',
			'', // toolTipCaption - not directly available on IWindow
			button.visible
		);
	}

	/**
	 * Sets the caption of a button by its flag.
	 *
	 * @param buttonFlag - One of HabboAlertDialogFlag.BUTTON_OK, BUTTON_CANCEL, or BUTTON_CUSTOM
	 * @param caption - The caption to set
	 */
	public setButtonCaption(buttonFlag: number, caption: ICaption): void
	{
		if (this._disposed || !this._window) return;

		let buttonName: string | null = null;

		switch (buttonFlag)
		{
			case HabboAlertDialogFlag.BUTTON_OK:
				buttonName = AlertDialog.BUTTON_OK;
				break;
			case HabboAlertDialogFlag.BUTTON_CANCEL:
				buttonName = AlertDialog.BUTTON_CANCEL;
				break;
			case HabboAlertDialogFlag.BUTTON_CUSTOM:
				buttonName = AlertDialog.BUTTON_CUSTOM;
				break;
		}

		if (!buttonName) return;

		const button = this._window.findChildByName(buttonName);

		if (button)
		{
			button.caption = caption.text;
		}
	}

	/**
	 * Disposes this alert dialog and its windows.
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		if (this._modalDialog && !this._modalDialog.disposed)
		{
			this._modalDialog.dispose();
			this._modalDialog = null;
			this._window = null;
		}

		if (this._window && !this._window.disposed)
		{
			this._window.dispose();
			this._window = null;
		}

		this._callback = null;
		this._disposed = true;
	}

	/**
	 * Handles dialog window events.
	 *
	 * Dispatches WE_OK on OK button click, WE_CANCEL on Cancel or
	 * close button click. If no callback is set, the dialog self-disposes.
	 *
	 * @param event - The window event
	 * @param window - The window that triggered the event
	 */
	protected dialogEventProc(event: WindowEvent, window: IWindow): void
	{
		if (event.type === WindowMouseEvent.CLICK)
		{
			switch (window.name)
			{
				case AlertDialog.BUTTON_OK:
					if (this._callback !== null)
					{
						const okEvent = WindowEvent.allocate(WindowEvent.WE_OK, null, null);
						this._callback(this, okEvent);
						okEvent.recycle();
					}
					else
					{
						this.dispose();
					}
					break;

				case AlertDialog.HEADER_BUTTON_CLOSE:
				case AlertDialog.BUTTON_CANCEL:
					if (this._callback !== null)
					{
						const cancelEvent = WindowEvent.allocate(WindowEvent.WE_CANCEL, null, null);
						this._callback(this, cancelEvent);
						cancelEvent.recycle();
					}
					else
					{
						this.dispose();
					}
					break;
			}
		}
	}
}
