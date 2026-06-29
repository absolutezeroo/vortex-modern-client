import type {IRunningNumberWidget} from './IRunningNumberWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Animated running number widget.
 *
 * Displays a number that animates (counts up) from a current value
 * to a target value at a configurable frequency. Shows the number
 * with leading zeros based on the digit count.
 *
 * In the AS3 version, implements IUpdateReceiver for animation ticks.
 * In the TypeScript port, number state is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/RunningNumberWidget.as
 */
export class RunningNumberWidget implements IRunningNumberWidget
{
	public static readonly TYPE: string = 'running_number';

	private static readonly NUMBER_KEY: string = 'running_number:number';
	private static readonly DIGITS_KEY: string = 'running_number:digits';
	private static readonly COLOR_STYLE_KEY: string = 'running_number:color_style';
	private static readonly UPDATE_FREQUENCY_KEY: string = 'running_number:update_frequency';
	private _millisSinceLastUpdate: number = 0;

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _root: IWindowContainer | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		const root = this._windowManager.buildWidgetLayout('running_number') as IWindowContainer;

		if (root)
		{
			this._root = root;
		}

		// AS3: _windowManager.registerUpdateReceiver(this, updateFrequency) — skipped for now
		this._widgetWindow.setParamFlag(147456);
		this._widgetWindow.rootWindow = this._root;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _number: number = 0;

	public get number(): number
	{
		return this._number;
	}

	public set number(value: number)
	{
		this._number = value;
	}

	private _displayedNumber: number = 0;

	/**
	 * The currently displayed number (may differ from target during animation).
	 */
	public get displayedNumber(): number
	{
		return this._displayedNumber;
	}

	private _digits: number = 8;

	public get digits(): number
	{
		return this._digits;
	}

	public set digits(value: number)
	{
		this._digits = value;
	}

	private _colorStyle: number = 0;

	public get colorStyle(): number
	{
		return this._colorStyle;
	}

	public set colorStyle(value: number)
	{
		this._colorStyle = value;
	}

	private _updateFrequency: number = 50;

	public get updateFrequency(): number
	{
		return this._updateFrequency;
	}

	public set updateFrequency(value: number)
	{
		this._updateFrequency = value;
	}

	public set initialNumber(value: number)
	{
		this._displayedNumber = value;
		this._number = value;
	}

	/**
	 * Get the formatted display string with leading zeros.
	 */
	public get formattedValue(): string
	{
		let str = Math.floor(this._displayedNumber).toString();

		while (str.length < this._digits)
		{
			str = '0' + str;
		}

		return str;
	}

	public get properties(): PropertyStruct[]
	{
		if (this._disposed) return [];

		return [
			new PropertyStruct(RunningNumberWidget.NUMBER_KEY, this._number),
			new PropertyStruct(RunningNumberWidget.DIGITS_KEY, this._digits),
			new PropertyStruct(RunningNumberWidget.COLOR_STYLE_KEY, this._colorStyle),
			new PropertyStruct(RunningNumberWidget.UPDATE_FREQUENCY_KEY, this._updateFrequency),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		for (const prop of values)
		{
			switch (prop.key)
			{
				case RunningNumberWidget.NUMBER_KEY:
					this.number = Number(prop.value);
					break;
				case RunningNumberWidget.DIGITS_KEY:
					this.digits = Number(prop.value);
					break;
				case RunningNumberWidget.COLOR_STYLE_KEY:
					this.colorStyle = Number(prop.value);
					break;
				case RunningNumberWidget.UPDATE_FREQUENCY_KEY:
					this.updateFrequency = Number(prop.value);
					break;
			}
		}
	}

	/**
	 * Update the animation by the given elapsed milliseconds.
	 *
	 * @param elapsed - Milliseconds since last update
	 */
	public update(elapsed: number): void
	{
		if (this._displayedNumber < this._number)
		{
			this._millisSinceLastUpdate += elapsed;

			if (this._millisSinceLastUpdate > this._updateFrequency)
			{
				this._displayedNumber = Math.min(
					this._number,
					this._displayedNumber + this._millisSinceLastUpdate / this._updateFrequency
				);
				this._millisSinceLastUpdate -= this._updateFrequency;
			}
		}
	}

	public dispose(): void
	{
		if (this._disposed) return;

		if (this._root)
		{
			this._root.dispose();
			this._root = null;
		}

		if (this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
			this._widgetWindow = null;
		}

		// AS3: _windowManager.removeUpdateReceiver(this) — skipped for now
		this._windowManager = null;
		this._disposed = true;
	}
}
