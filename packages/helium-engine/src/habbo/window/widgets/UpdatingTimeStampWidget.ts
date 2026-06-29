import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Updating timestamp display widget.
 *
 * Displays a human-readable "time ago" string that updates every minute.
 * Uses FriendlyTime to format the elapsed duration (e.g. "5 minutes ago").
 *
 * In the AS3 version, uses a shared static Timer with 60-second interval
 * and ILabelWindow for display. In the TypeScript port, timestamp state
 * is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/UpdatingTimeStampWidget.as
 */
export class UpdatingTimeStampWidget implements IWidget
{
	public static readonly TYPE: string = 'updating_timestamp';

	private static readonly UPDATE_INTERVAL_MS: number = 60000;

	/**
	 * Shared static interval timer for all UpdatingTimeStampWidget instances.
	 * In AS3, this was a static Timer(60000) that was started in the class initializer.
	 */
	private static _updateTimerId: ReturnType<typeof setInterval> | null = null;
	private static _instances: Set<UpdatingTimeStampWidget> = new Set();
	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _label: IWindow | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		// AS3: label = _windowManager.create("", 12, 100, 16, new Rectangle()) as ILabelWindow
		// TypeId 12 = Label window type
		this._label = this._windowManager.create(
			'', 12, 100, 16,
			{x: 0, y: 0, width: 0, height: 0}
		);

		if (this._label)
		{
			// AS3: label.textColor = 5592405 (0x555555)
			this._label.color = 5592405;
			this._widgetWindow.rootWindow = this._label;
		}

		// Register with the shared static timer
		UpdatingTimeStampWidget._instances.add(this);
		UpdatingTimeStampWidget.startUpdateTimer();

		this.reset();
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _timeStamp: number = 0;

	public get timeStamp(): number
	{
		return this._timeStamp;
	}

	public set timeStamp(value: number)
	{
		this._timeStamp = value;
		this.onTimerTick();
	}

	private _align: string = '';

	/**
	 * The text alignment for the display label.
	 */
	public get align(): string
	{
		return this._align;
	}

	public set align(value: string)
	{
		this._align = value;
	}

	/**
	 * Get the elapsed seconds since the timestamp.
	 */
	public get elapsedSeconds(): number
	{
		return (Date.now() - Math.abs(this._timeStamp)) / 1000;
	}

	public get properties(): PropertyStruct[]
	{
		return [];
	}

	public set properties(_values: PropertyStruct[])
	{
		// AS3: properties setter is a no-op for this widget
	}

	/**
	 * Start the shared update timer if not already running.
	 */
	private static startUpdateTimer(): void
	{
		if (UpdatingTimeStampWidget._updateTimerId === null)
		{
			UpdatingTimeStampWidget._updateTimerId = setInterval(() =>
			{
				for (const instance of UpdatingTimeStampWidget._instances)
				{
					instance.onTimerTick();
				}
			}, UpdatingTimeStampWidget.UPDATE_INTERVAL_MS);
		}
	}

	/**
	 * Stop the shared update timer if no instances remain.
	 */
	private static stopUpdateTimer(): void
	{
		if (UpdatingTimeStampWidget._instances.size === 0 && UpdatingTimeStampWidget._updateTimerId !== null)
		{
			clearInterval(UpdatingTimeStampWidget._updateTimerId);
			UpdatingTimeStampWidget._updateTimerId = null;
		}
	}

	/**
	 * Reset the timestamp to the current time.
	 */
	public reset(): void
	{
		this._timeStamp = Date.now();
		this.onTimerTick();
	}

	public dispose(): void
	{
		if (this._disposed) return;

		// Unregister from the shared static timer
		UpdatingTimeStampWidget._instances.delete(this);
		UpdatingTimeStampWidget.stopUpdateTimer();

		if (this._label)
		{
			this._label.dispose();
			this._label = null;
		}

		if (this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
			this._widgetWindow = null;
		}

		this._windowManager = null;
		this._disposed = true;
	}

	/**
	 * Timer tick handler called every 60 seconds by the shared static timer.
	 *
	 * In AS3, this updates the label caption via FriendlyTime.getFriendlyTime().
	 * In TS, this is a stub — the UI layer reads elapsedSeconds directly.
	 */
	private onTimerTick(): void
	{
		if (this._disposed) return;

		// TODO: update label caption via localization/FriendlyTime
	}
}
