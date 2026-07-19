import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CurrencyIndicatorBase');

/**
 * Interface for currency indicator implementations
 *
 * Corresponds to the AS3 class_3491 interface.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/purse/class_3491.as
 */
export interface ICurrencyIndicator
{
    readonly window: IWindowContainer | null;

    dispose(): void;

    registerUpdateEvents(dispatcher: unknown): void;

    unregisterUpdateEvents(dispatcher: unknown): void;
}

/**
 * Base class for currency display indicators in the toolbar
 *
 * In AS3 this manages a window with an icon, text, hover colors, and
 * animations for currency value changes. Sub-classes override setAmount(),
 * onContainerClick(), and registerUpdateEvents(). In Vortex, rendering is
 * handled by SolidJS; this manages state and animation logic.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/purse/CurrencyIndicatorBase.as
 */
export class CurrencyIndicatorBase implements ICurrencyIndicator
{
    protected static readonly DIRECTION_FORWARD: number = 0;
    protected static readonly DIRECTION_REVERSE: number = 1;

    private static readonly OVERLAY_STEP: number = 0.025;
    private static readonly OVERLAY_INTERVAL: number = 40;

    protected _window: IWindowContainer | null = null;
    protected _windowManager: IHabboWindowManager | null = null;

    private _disposed: boolean = false;
    private _iconBitmap: IStaticBitmapWrapperWindow | null = null;
    private _bgColorLight: number = 0;
    private _bgColorDark: number = 0;
    private _textElementName: string = '';
    private _iconAnimationSequence: string[] = [];
    private _iconAnimationDelay: number = 0;
    private _amountZeroText: string | null = null;
    private _animationDirection: number = 0;
    private _animationOffset: number = 0;
    private _animationTimer: ReturnType<typeof setInterval> | null = null;
    private _animationTicks: number = 0;
    private _overlayTimer: ReturnType<typeof setInterval> | null = null;
    private _overlayPhase: number = 0;
    private _overlayStartValue: number = 0;
    private _overlayEndValue: number = 0;
    private _currentAmount: number = 0;
    private _currentText: string = '';
    private _textUnderline: boolean = false;

    constructor(windowManager: IHabboWindowManager | null = null)
    {
        this._windowManager = windowManager;

        log.debug('CurrencyIndicatorBase constructed');
    }

    get window(): IWindowContainer | null { return this._window; }
    get currentAmount(): number { return this._currentAmount; }
    get currentText(): string { return this._currentText; }
    get textUnderline(): boolean { return this._textUnderline; }

    protected set bgColorLight(value: number)
    {
        this._bgColorLight = value;
    }

    protected set bgColorDark(value: number)
    {
        this._bgColorDark = value;
    }

    protected set textElementName(value: string)
    {
        this._textElementName = value;
    }

    protected get amountZeroText(): string | null
    {
        return this._amountZeroText;
    }

    protected set amountZeroText(value: string | null)
    {
        this._amountZeroText = value;
    }

    protected set iconAnimationSequence(value: string[])
    {
        this._iconAnimationSequence.length = 0;

        for(const frame of value)
        {
            this._iconAnimationSequence.push(frame);
        }
    }

    protected set iconAnimationDelay(value: number)
    {
        this._iconAnimationDelay = value;
    }

    public registerUpdateEvents(_dispatcher: unknown): void
    {
    }

    public unregisterUpdateEvents(_dispatcher: unknown): void
    {
    }

    protected createWindow(layoutName: string, iconUri: string | null): void
    {
        if(!this._windowManager) return;

        const built = this._windowManager.buildWidgetLayout(layoutName);

        if(!built) return;

        this._window = built as IWindowContainer;
        this._window.addEventListener(WindowMouseEvent.CLICK, this.onContainerClickEvent);
        this._window.addEventListener(WindowMouseEvent.OVER, this.onContainerMouseOver);
        this._window.addEventListener(WindowMouseEvent.OUT, this.onContainerMouseOut);

        const icons: IWindow[] = [];

        if(this._window.groupChildrenWithTag('ICON', icons, -1) === 1)
        {
            this._iconBitmap = icons[0] as IStaticBitmapWrapperWindow;
            this.setIconBitmap(iconUri);
        }
    }

    protected onContainerClick(_event: WindowMouseEvent): void
    {
    }

    protected animateIcon(direction: number): void
    {
        if(!this._iconBitmap || this._iconAnimationSequence.length === 0) return;

        this._animationDirection = direction;
        this._animationTicks = 0;

        if(this._animationDirection === CurrencyIndicatorBase.DIRECTION_FORWARD)
        {
            this._animationOffset = 0;
        }
        else
        {
            this._animationOffset = this._iconAnimationSequence.length - 1;
        }

        if(this._animationTimer !== null)
        {
            clearInterval(this._animationTimer);
            this._animationTimer = null;
        }

        this._animationTimer = setInterval(this.onAnimationTimer, this._iconAnimationDelay);
        this.onAnimationTimer();
    }

    protected setAmount(amount: number, _minutes: number = -1): void
    {
        this._currentAmount = amount;
        this.setText(amount.toString());
    }

    protected setText(text: string): void
    {
        this._currentText = text;

        if(!this._window || this._textElementName === '') return;

        const textWindow = this._window.findChildByName(this._textElementName);

        if(textWindow)
        {
            textWindow.caption = text;
        }
    }

    protected setTextUnderline(underline: boolean): void
    {
        this._textUnderline = underline;

        if(!this._window || this._textElementName === '') return;

        const textWindow = this._window.findChildByName(this._textElementName) as unknown as { underline?: boolean } | null;

        if(textWindow)
        {
            textWindow.underline = underline;
        }
    }

    protected animateChange(startValue: number, endValue: number): void
    {
        this._overlayPhase = 0;
        this._overlayStartValue = startValue;
        this._overlayEndValue = endValue;

        if(this._overlayTimer !== null)
        {
            clearInterval(this._overlayTimer);
            this._overlayTimer = null;
        }

        this._overlayTimer = setInterval(this.onOverlayTimer, CurrencyIndicatorBase.OVERLAY_INTERVAL);
        this.onOverlayTimer();
    }

    private onAnimationTimer = (): void =>
    {
        if(!this._iconBitmap || this._iconAnimationSequence.length === 0) return;

        this.setIconBitmap(this._iconAnimationSequence[this._animationOffset]);

        if(this._animationDirection === CurrencyIndicatorBase.DIRECTION_FORWARD)
        {
            this._animationOffset = Math.min(this._animationOffset + 1, this._iconAnimationSequence.length - 1);
        }
        else
        {
            this._animationOffset = Math.max(this._animationOffset - 1, 0);
        }

        this._animationTicks++;

        if(this._animationTicks >= this._iconAnimationSequence.length)
        {
            if(this._animationTimer !== null)
            {
                clearInterval(this._animationTimer);
                this._animationTimer = null;
            }

            this.setIconBitmap(this._iconAnimationSequence[0]);
        }
    };

    private setIconBitmap(uri: string | null): void
    {
        if(!this._iconBitmap || uri === null) return;

        this._iconBitmap.assetUri = uri;
    }

    private onContainerClickEvent = (event: WindowMouseEvent): void =>
    {
        this.onContainerClick(event);
    };

    private onContainerMouseOver = (_event: WindowMouseEvent): void =>
    {
        if(!this._window) return;

        const bg = this._window.findChildByTag('BGCOLOR');

        if(bg)
        {
            bg.color = this._bgColorLight;
        }
    };

    private onContainerMouseOut = (_event: WindowMouseEvent): void =>
    {
        if(!this._window) return;

        const bg = this._window.findChildByTag('BGCOLOR');

        if(bg)
        {
            bg.color = this._bgColorDark;
        }
    };

    private onOverlayTimer = (): void =>
    {
        const phase = Math.pow(this._overlayPhase - 0.5, 3) * 4 + 0.5;
        const progress = Math.max(0, this._overlayPhase * 2 - 1);
        const amount = Math.trunc(this.lerp(progress, this._overlayStartValue, this._overlayEndValue));

        this.setAmount(amount);

        if(this._window)
        {
            const overlay = this._window.findChildByName('change_overlay');

            if(overlay)
            {
                overlay.visible = true;
                overlay.blend = 1 - Math.abs(0.5 - phase) * 2;
                overlay.x = this.lerp(phase, 0, this._window.width - overlay.width);
            }
        }

        this._overlayPhase += CurrencyIndicatorBase.OVERLAY_STEP;

        if(this._overlayPhase >= 1)
        {
            if(this._window)
            {
                const overlay = this._window.findChildByName('change_overlay');

                if(overlay)
                {
                    overlay.visible = false;
                }
            }

            if(this._overlayTimer !== null)
            {
                clearInterval(this._overlayTimer);
                this._overlayTimer = null;
            }

            this.setAmount(this._overlayEndValue);
        }
    };

    private lerp(phase: number, start: number, end: number): number
    {
        return start + ((end - start) * phase);
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._overlayTimer !== null)
        {
            clearInterval(this._overlayTimer);
            this._overlayTimer = null;
        }

        if(this._animationTimer !== null)
        {
            clearInterval(this._animationTimer);
            this._animationTimer = null;
        }

        if(this._window)
        {
            this._window.removeEventListener(WindowMouseEvent.CLICK, this.onContainerClickEvent);
            this._window.removeEventListener(WindowMouseEvent.OVER, this.onContainerMouseOver);
            this._window.removeEventListener(WindowMouseEvent.OUT, this.onContainerMouseOut);
            this._window.dispose();
            this._window = null;
        }

        this._iconBitmap = null;
        this._windowManager = null;
        this._iconAnimationSequence.length = 0;
    }
}
