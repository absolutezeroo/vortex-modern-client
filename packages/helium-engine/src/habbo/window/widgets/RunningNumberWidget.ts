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
	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::TYPE
	public static readonly TYPE: string = 'running_number';

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::NUMBER_KEY
	private static readonly NUMBER_KEY: string = 'running_number:number';
	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::DIGITS_KEY
	private static readonly DIGITS_KEY: string = 'running_number:digits';
	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::COLOR_STYLE_KEY
	private static readonly COLOR_STYLE_KEY: string = 'running_number:color_style';
	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::UPDATE_FREQUENCY_KEY
	private static readonly UPDATE_FREQUENCY_KEY: string = 'running_number:update_frequency';
	// TS-only: accumulates elapsed time between update ticks
	private _millisSinceLastUpdate: number = 0;

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_widgetWindow
	private _widgetWindow: IWidgetWindow | null = null;
	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_windowManager
	private _windowManager: IHabboWindowManager | null = null;
	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_root
	private _root: IWindowContainer | null = null;

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::RunningNumberWidget()
	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		const root = this._windowManager.buildWidgetLayout('running_number') as IWindowContainer;

		if (root)
		{
			this._root = root;
		}

		// TODO(AS3): _windowManager.registerUpdateReceiver(this, updateFrequency)
		// sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::RunningNumberWidget()
		this._widgetWindow.setParamFlag(147456);
		this._widgetWindow.rootWindow = this._root;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_disposed
	private _disposed: boolean = false;

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::get disposed()
	public get disposed(): boolean
	{
		return this._disposed;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_number
	private _number: number = 0;

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::get number()
	public get number(): number
	{
		return this._number;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::set number()
	public set number(value: number)
	{
		this._number = value;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_displayedNumber
	private _displayedNumber: number = 0;

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::get displayedNumber()
	public get displayedNumber(): number
	{
		return this._displayedNumber;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_digits
	private _digits: number = 8;

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::get digits()
	public get digits(): number
	{
		return this._digits;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::set digits()
	public set digits(value: number)
	{
		this._digits = value;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_colorStyle
	private _colorStyle: number = 0;

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::get colorStyle()
	public get colorStyle(): number
	{
		return this._colorStyle;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::set colorStyle()
	public set colorStyle(value: number)
	{
		this._colorStyle = value;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::_updateFrequency (var_1449)
	private _updateFrequency: number = 50;

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::get updateFrequency()
	public get updateFrequency(): number
	{
		return this._updateFrequency;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::set updateFrequency()
	public set updateFrequency(value: number)
	{
		this._updateFrequency = value;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::set initialNumber()
	public set initialNumber(value: number)
	{
		this._displayedNumber = value;
		this._number = value;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::get formattedValue()
	public get formattedValue(): string
	{
		let str = Math.floor(this._displayedNumber).toString();

		while (str.length < this._digits)
		{
			str = '0' + str;
		}

		return str;
	}

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::get properties()
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

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::set properties()
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

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::update()
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

	// AS3: sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::dispose()
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

		// TODO(AS3): _windowManager.removeUpdateReceiver(this)
		// sources/win63_version/habbo/window/widgets/RunningNumberWidget.as::dispose()
		this._windowManager = null;
		this._disposed = true;
	}
}
