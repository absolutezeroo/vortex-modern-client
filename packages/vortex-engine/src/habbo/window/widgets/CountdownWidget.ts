import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import type {IIterator} from '@core/window/utils/IIterator';
import {EmptyIterator} from '@core/window/iterators/EmptyIterator';

/**
 * Countdown timer widget.
 *
 * Displays a countdown timer with configurable number of digit groups
 * (weeks, days, hours, minutes, seconds). Supports start/stop, color
 * styles, and live updates.
 *
 * In the AS3 version, implements IUpdateReceiver for per-frame updates.
 * In the TypeScript port, state is stored for the UI layer to render.
 *
 * @see sources/win63_version/habbo/window/widgets/CountdownWidget.as
 */
export class CountdownWidget implements IWidget
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::TYPE
    public static readonly TYPE: string = 'countdown';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::RUNNING_KEY
    private static readonly RUNNING_KEY: string = 'countdown:running';
    private static readonly DIGITS_KEY: string = 'countdown:digits';
    private static readonly SECONDS_KEY: string = 'countdown:seconds';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::COLOR_STYLE_KEY
    private static readonly COLOR_STYLE_KEY: string = 'countdown:color_style';

    private static readonly UNIT_NAMES: string[] = ['weeks', 'days', 'hours', 'minutes', 'seconds'];
    private static readonly UNIT_SECONDS: number[] = [604800, 86400, 3600, 60, 1];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::UNIT_MAX_VALUES
    private static readonly UNIT_MAX_VALUES: number[] = [100, 7, 24, 60, 60];
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::_startSeconds
    private _startSeconds: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::_startTime
    private _startTime: number = Date.now();
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::_displayedTime
    private _displayedTime: number = -1;

    private _widgetWindow: IWidgetWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    private _root: IWindow | null = null;
    private _counterTemplate: IWindow | null = null;
    private _separatorTemplate: IWindow | null = null;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        const root = this._windowManager.buildWidgetLayout('clock_base_xml');

        if(root)
        {
            this._root = root;

            // AS3: counter = root.getListItemByName("counter") as IWindowContainer
            // AS3: separator = root.getListItemByName("separator") as ITextWindow
            // These are templates used for cloning digit groups.
            // For now, store as generic IWindow references via findChildByName on the container.
            const rootContainer = root as unknown as { findChildByName(name: string): IWindow | null };

            if(typeof rootContainer.findChildByName === 'function')
            {
                this._counterTemplate = rootContainer.findChildByName('counter');
                this._separatorTemplate = rootContainer.findChildByName('separator');
            }
        }

        this._digits = 3;

        // AS3: _windowManager.registerUpdateReceiver(this, 10) — skipped for now
        this._widgetWindow.setParamFlag(147456);
        this._widgetWindow.rootWindow = this._root;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    private _running: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::get running()
    public get running(): boolean
    {
        return this._running;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::set running()
    public set running(value: boolean)
    {
        if(this._running && !value)
        {
            this._startSeconds = this.seconds;
        }

        if(!this._running && value)
        {
            this._startTime = Date.now();
        }

        this._running = value;
    }

    private _digits: number = 3;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::get digits()
    public get digits(): number
    {
        return this._digits;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::set digits()
    public set digits(value: number)
    {
        this._digits = Math.max(2, Math.min(4, value));
    }

    private _colorStyle: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::get colorStyle()
    public get colorStyle(): number
    {
        return this._colorStyle;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::set colorStyle()
    public set colorStyle(value: number)
    {
        this._colorStyle = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::get seconds()
    public get seconds(): number
    {
        if(this._running)
        {
            return Math.max(0, this._startSeconds - (Date.now() - this._startTime) / 1000);
        }

        return this._startSeconds;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::set seconds()
    public set seconds(value: number)
    {
        this._startSeconds = value;
        this._startTime = Date.now();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::get properties()
    public get properties(): PropertyStruct[]
    {
        if(this._disposed) return [];

        return [
            new PropertyStruct(CountdownWidget.RUNNING_KEY, this._running),
            new PropertyStruct(CountdownWidget.DIGITS_KEY, this._digits),
            new PropertyStruct(CountdownWidget.SECONDS_KEY, this.seconds),
            new PropertyStruct(CountdownWidget.COLOR_STYLE_KEY, this._colorStyle),
        ];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::set properties()
    public set properties(values: PropertyStruct[])
    {
        for(const prop of values)
        {
            switch(prop.key)
            {
                case CountdownWidget.RUNNING_KEY:
                    this.running = Boolean(prop.value);
                    break;
                case CountdownWidget.DIGITS_KEY:
                    this.digits = Number(prop.value);
                    break;
                case CountdownWidget.SECONDS_KEY:
                    this.seconds = Number(prop.value);
                    break;
                case CountdownWidget.COLOR_STYLE_KEY:
                    this.colorStyle = Number(prop.value);
                    break;
            }
        }
    }

    /**
	 * Determine the maximum unit index for the given digit count and total seconds.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::getMaxUnitIndex()
    private static getMaxUnitIndex(digits: number, totalSeconds: number): number
    {
        for(let i = 0; i < CountdownWidget.UNIT_SECONDS.length - digits; i++)
        {
            if(totalSeconds >= CountdownWidget.UNIT_SECONDS[i])
            {
                return i;
            }
        }

        return CountdownWidget.UNIT_SECONDS.length - digits;
    }

    /**
	 * Get the breakdown of the countdown for display.
	 *
	 * @returns Array of { value, unit } pairs for each digit group
	 */
    public getDisplayValues(): { value: number; unit: string }[]
    {
        const totalSeconds = Math.floor(this.seconds);
        const maxUnitIndex = CountdownWidget.getMaxUnitIndex(this._digits, totalSeconds);
        const result: { value: number; unit: string }[] = [];

        for(let i = 0; i < this._digits; i++)
        {
            const unitIndex = maxUnitIndex + i;
            const unitValue = Math.floor(totalSeconds / CountdownWidget.UNIT_SECONDS[unitIndex]) % CountdownWidget.UNIT_MAX_VALUES[unitIndex];

            result.push({
                value: unitValue,
                unit: CountdownWidget.UNIT_NAMES[unitIndex],
            });
        }

        return result;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::get iterator()
    public iterator(): IIterator
    {
        return EmptyIterator.INSTANCE;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/CountdownWidget.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._root)
        {
            this._root.dispose();
            this._root = null;
        }

        if(this._counterTemplate)
        {
            this._counterTemplate.dispose();
            this._counterTemplate = null;
        }

        if(this._separatorTemplate)
        {
            this._separatorTemplate.dispose();
            this._separatorTemplate = null;
        }

        if(this._widgetWindow)
        {
            this._widgetWindow.rootWindow = null;
            this._widgetWindow = null;
        }

        // AS3: _windowManager.removeUpdateReceiver(this) — skipped for now
        this._windowManager = null;
        this._disposed = true;
    }
}
