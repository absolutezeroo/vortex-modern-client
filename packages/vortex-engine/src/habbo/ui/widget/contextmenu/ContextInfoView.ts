/**
 * ContextInfoView — base class for the context-menu bubbles (own-avatar menu, …).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/contextmenu/ContextInfoView.as
 *
 * Owns the built menu window, attaches it to the desktop, and repositions it
 * each frame relative to the avatar's on-screen rectangle (with vertical
 * smoothing). Adaptations vs AS3: the auto-hide Flash Timer → setTimeout; the
 * BitmapData copyPixels in setImageAsset → an ImageBitmap set on the window.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import {FixedSizeStack} from '@habbo/utils/FixedSizeStack';
import type {IContextMenuParentWidget} from './IContextMenuParentWidget';

export interface IScreenRectangle
{
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

export interface IScreenPoint
{
    x: number;
    y: number;
}

export class ContextInfoView
{
    protected static readonly CONTEXT_INFO_DELAY: number = 3000;

    protected static _minimized: boolean = false;

    protected _window: IWindowContainer | null = null;
    protected _minimizedWindow: IWindowContainer | null = null;
    protected _activeView: IWindowContainer | null = null;
    protected _widget: IContextMenuParentWidget;
    protected _mouseOver: boolean = false;
    protected _positionStack: FixedSizeStack = new FixedSizeStack(25);
    protected _lastY: number = -1000000;
    protected _disposed: boolean = false;
    private _forceActivateOnUpdate: boolean = true;
    private _forcedPositionUpdate: boolean = false;
    protected _autoHideTimer: ReturnType<typeof setTimeout> | null = null;
    protected _autoHideDelay: number = 3000;
    protected _hidePending: boolean = false;
    protected _fading: boolean = false;
    protected _blend: number = 1;
    private _fadeTime: number = 0;
    private _fadeLength: number = 500;
    // AS3: _SafeStr_4773 — auto-hide enabled (OwnAvatarMenuView sets it false).
    protected _autoHideEnabled: boolean = true;

    // AS3: ContextInfoView.as::ContextInfoView()
    constructor(widget: IContextMenuParentWidget)
    {
        this._widget = widget;
    }

    // AS3: ContextInfoView.as::setupContext()
    protected static setupContext(view: ContextInfoView): void
    {
        view._hidePending = false;
        view._fadeLength = 500;
        view._fading = false;
        view._blend = 1;
        view._mouseOver = false;

        if(view._autoHideEnabled)
        {
            view.startAutoHideTimer();
        }

        view.updateWindow();
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: ContextInfoView.as::get maximumBlend()
    public get maximumBlend(): number
    {
        return 1;
    }

    // AS3: ContextInfoView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: ContextInfoView.as::updateWindow() — overridden by subclasses.
    protected updateWindow(): void
    {
    }

    // AS3: ContextInfoView.as::set activeView()
    protected set activeView(value: IWindowContainer | null)
    {
        if(!value) return;

        if(this._activeView)
        {
            this._activeView.parent = null;
        }

        this._activeView = value;
    }

    // AS3: ContextInfoView.as::getOffset()
    protected getOffset(_rect: IScreenRectangle): number
    {
        return -(this._activeView?.height ?? 0) - 4;
    }

    // AS3: ContextInfoView.as::getMaximumVerticalLead()
    protected getMaximumVerticalLead(rect: IScreenRectangle): number
    {
        return Math.floor(rect.height * 0.05);
    }

    // AS3: ContextInfoView.as::update()
    public update(rect: IScreenRectangle | null, screenLocation: IScreenPoint, time: number): void
    {
        if(!rect) return;

        if(!this._activeView)
        {
            this.updateWindow();
        }

        if(!this._activeView) return;

        if(this._fading)
        {
            this._fadeTime += time;
            this._blend = (1 - this._fadeTime / this._fadeLength) * this.maximumBlend;
        }
        else
        {
            this._blend = this.maximumBlend;
        }

        if(this._blend <= 0)
        {
            this._widget.removeView(this, false);

            return;
        }

        if(!this._mouseOver || this._forcedPositionUpdate)
        {
            const offset = this.getOffset(rect);
            const raw = screenLocation.y - rect.top;

            this._positionStack.addValue(raw);

            let smoothed = this._positionStack.getMax();

            if(smoothed < this._lastY - 3)
            {
                smoothed = this._lastY - 3;
            }

            this._lastY = smoothed;

            const top = rect.top + offset;
            const minY = top - this.getMaximumVerticalLead(rect);
            let finalY = (screenLocation.y - smoothed) + offset;

            if(finalY < minY)
            {
                finalY = minY;
            }

            this._activeView.x = screenLocation.x - this._activeView.width / 2;
            this._activeView.y = finalY;
            this._forcedPositionUpdate = false;
        }

        this._activeView.blend = this._blend;
        this.show();
    }

    // AS3: ContextInfoView.as::show()
    public show(): void
    {
        if(!this._activeView) return;

        this._activeView.visible = true;

        if(!this._activeView.parent)
        {
            const desktop = this._widget.windowManager.getDesktop(0);

            if(desktop) (desktop as IWindowContainer).addChild(this._activeView);
        }

        if(this._forceActivateOnUpdate)
        {
            this._activeView.activate();
        }
    }

    // AS3: ContextInfoView.as::hide()
    public hide(fade: boolean): void
    {
        if(!this._activeView) return;

        if(!this._hidePending && fade && this._autoHideTimer !== null)
        {
            this._hidePending = true;
            this.startAutoHideTimer();
        }
        else
        {
            this._activeView.visible = false;
            this._activeView.parent = null;
        }
    }

    // AS3: ContextInfoView.as::onMouseHoverEvent() — freezes the position on hover.
    // AS3 adaptation: the WME_OUT hit-test refinement is dropped (simple freeze/unfreeze).
    protected onMouseHoverEvent = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_OVER')
        {
            this._mouseOver = true;
        }
        else if(event.type === 'WME_OUT')
        {
            this._mouseOver = false;
        }
    };

    // AS3: ContextInfoView.as::setImageAsset() — BitmapData copyPixels → ImageBitmap.
    protected setImageAsset(target: IWindow | null, assetName: string): void
    {
        if(!target || !this._widget.assets) return;

        const asset = this._widget.assets.getAssetByName(assetName) as BitmapDataAsset | null;
        const content = asset?.content as ImageBitmap | null;

        if(content)
        {
            (target as IWindow & { bitmap: ImageBitmap | null }).bitmap = content;
        }
    }

    // AS3: ContextInfoView.as::getMinimizedView() — minimized menu deferred; return the full view.
    // TODO(AS3): port the "minimized_menu" bubble.
    protected getMinimizedView(): IWindowContainer | null
    {
        return this._window;
    }

    private startAutoHideTimer(): void
    {
        this.stopAutoHideTimer();

        this._autoHideTimer = setTimeout(() => this.onTimerComplete(), this._autoHideDelay);
    }

    private stopAutoHideTimer(): void
    {
        if(this._autoHideTimer !== null)
        {
            clearTimeout(this._autoHideTimer);
            this._autoHideTimer = null;
        }
    }

    // AS3: ContextInfoView.as::onTimerComplete()
    private onTimerComplete(): void
    {
        this._fading = true;
        this._fadeTime = 0;
        this.hide(true);
    }

    // AS3: ContextInfoView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.stopAutoHideTimer();
        this._activeView = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._minimizedWindow)
        {
            this._minimizedWindow.dispose();
            this._minimizedWindow = null;
        }

        this._disposed = true;
    }
}
