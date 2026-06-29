import {Logger} from '@core/utils/Logger';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IModalDialog} from './IModalDialog';

const log = Logger.getLogger('ModalDialog');

/**
 * Base modal dialog implementation.
 *
 * Creates a modal overlay that dims the background and presents a
 * centered root window built from an XML layout definition. In AS3,
 * this used BitmapData to capture and darken the desktop layers.
 * In the TS port, the background dimming is handled as metadata
 * emitted to the UI layer; Flash rendering calls become stubs.
 *
 * Static members manage a shared modal container across all active
 * modal dialogs, stacking them with alternating background/content
 * child pairs.
 *
 * @see sources/win63_version/habbo/window/utils/ModalDialog.as
 */
export class ModalDialog implements IModalDialog
{
	private static readonly MODAL_DIALOG_LAYER: number = 3;

	private static _windowManager: IHabboWindowManager | null = null;
	private static _container: IWindowContainer | null = null;
	private static _refreshPending: number = 0;
	private static _initialized: boolean = false;

	/**
	 * Creates a new modal dialog.
	 *
	 * @param windowManager - The Habbo window manager
	 * @param xml - The XML layout definition for the dialog content
	 */
	constructor(windowManager: IHabboWindowManager, xml: string)
	{
		ModalDialog.initialiseStaticMembers(windowManager);

		// Create background overlay window in the modal container
		this._background = ModalDialog._windowManager!.createWindow(
			'modal_bg', '', 21, 0, 0,
			{x: 0, y: 0, width: 1, height: 1},
			null, 0, ModalDialog.MODAL_DIALOG_LAYER
		);

		if (ModalDialog._container && this._background)
		{
			ModalDialog._container.addChild(this._background);
		}

		// Build the root window from XML layout
		this._rootWindow = ModalDialog._windowManager!.buildFromXML(xml, ModalDialog.MODAL_DIALOG_LAYER);

		if (ModalDialog._container && this._rootWindow)
		{
			ModalDialog._container.addChild(this._rootWindow);
			this._rootWindow.center();
			ModalDialog._container.visible = true;
		}

		ModalDialog.refresh();
	}

	private _disposed: boolean = false;

	/**
	 * Whether this modal dialog has been disposed.
	 */
	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _rootWindow: IWindow | null = null;

	/**
	 * The root window of this modal dialog.
	 */
	public get rootWindow(): IWindow | null
	{
		return this._rootWindow;
	}

	private _background: IWindow | null = null;

	/**
	 * The background overlay window.
	 */
	public get background(): IWindow | null
	{
		return this._background;
	}

	/**
	 * Handles stage resize events.
	 *
	 * In AS3 this listened on Stage.resize. In the TS port,
	 * this can be called from the window manager on viewport resize.
	 */
	public static onResize(): void
	{
		if (!ModalDialog._container || ModalDialog._container.numChildren <= 0) return;

		ModalDialog._refreshPending = 2;

		const lastChild = ModalDialog._container.getChildAt(ModalDialog._container.numChildren - 1);

		if (lastChild)
		{
			lastChild.center();
		}
	}

	/**
	 * Per-frame update for deferred refresh.
	 *
	 * In AS3 this was an enterFrame listener. In the TS port,
	 * the window manager can call this from its update loop.
	 */
	public static onUpdate(): void
	{
		if (!ModalDialog._container || ModalDialog._container.numChildren <= 0) return;

		if (ModalDialog._refreshPending > 0)
		{
			ModalDialog._refreshPending--;

			if (ModalDialog._refreshPending === 0)
			{
				ModalDialog.refresh();
			}
		}
	}

	/**
	 * Initializes static members shared across all modal dialogs.
	 *
	 * @param windowManager - The Habbo window manager
	 */
	private static initialiseStaticMembers(windowManager: IHabboWindowManager): void
	{
		if (ModalDialog._initialized) return;

		ModalDialog._windowManager = windowManager;
		ModalDialog._initialized = true;

		// Create the shared modal container in the modal layer
		ModalDialog._container = ModalDialog._windowManager.createWindow(
			'modal_container', '', 4, 0, 0,
			{x: 0, y: 0, width: 1, height: 1},
			null, 0, ModalDialog.MODAL_DIALOG_LAYER
		) as IWindowContainer;

		log.debug('Modal dialog static members initialized');
	}

	/**
	 * Refreshes the modal container layout and background.
	 *
	 * In AS3, this captured BitmapData from the desktop layers,
	 * applied a ColorTransform darkening, and drew stacked bitmaps.
	 * In the TS port, this manages visibility and layout of the
	 * container children. The actual darkening effect is deferred
	 * to the UI rendering layer.
	 */
	private static refresh(): void
	{
		if (!ModalDialog._container) return;

		const isEmpty = ModalDialog._container.numChildren === 0;

		if (isEmpty)
		{
			// No dialogs open: show underlying desktop layers
			for (let i = 0; i < ModalDialog.MODAL_DIALOG_LAYER; i++)
			{
				const desktop = ModalDialog._windowManager!.getDesktop(i);

				if (desktop)
				{
					desktop.visible = true;
				}
			}

			return;
		}

		// Dialogs are open: hide underlying desktop layers
		for (let i = 0; i < ModalDialog.MODAL_DIALOG_LAYER; i++)
		{
			const desktop = ModalDialog._windowManager!.getDesktop(i);

			if (desktop)
			{
				desktop.visible = false;
			}
		}

		// Layout background/content pairs
		const numChildren = ModalDialog._container.numChildren;

		for (let i = 0; i < numChildren; i++)
		{
			const child = ModalDialog._container.getChildAt(i);

			if (!child) continue;

			if (i % 2 === 0)
			{
				// Background overlay: stretch to container size
				child.width = ModalDialog._container.width;
				child.height = ModalDialog._container.height;
			}
			else
			{
				// Content window: center it
				child.center();
			}

			// Only the topmost pair (last two children) is visible
			child.visible = (i >= numChildren - 2);
		}
	}

	/**
	 * Disposes this modal dialog and its windows.
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		if (this._background)
		{
			this._background.dispose();
			this._background = null;
		}

		if (this._rootWindow)
		{
			this._rootWindow.dispose();
			this._rootWindow = null;
		}

		ModalDialog.refresh();

		if (ModalDialog._container && ModalDialog._container.numChildren === 0)
		{
			ModalDialog._container.visible = false;
		}

		this._disposed = true;
	}
}
