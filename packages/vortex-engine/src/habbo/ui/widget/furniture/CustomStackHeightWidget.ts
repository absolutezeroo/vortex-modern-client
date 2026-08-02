import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {
    MoveFurnitureToAdjacentHeightMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/MoveFurnitureToAdjacentHeightMessageComposer';
import {
    SetCustomStackingHeightMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/SetCustomStackingHeightMessageComposer';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {CustomStackHeightWidgetHandler} from '@habbo/ui/handler/CustomStackHeightWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';

const log = Logger.getLogger('habbo.ui.widget.furniture.CustomStackHeightWidget');

/**
 * CustomStackHeightWidget
 *
 * The build-mode height slider: type a height, drag the slider, or nudge to the next
 * occupied level. Magic walk tiles get an extra multi-walk checkbox.
 *
 * The interesting half is the throttling. Dragging the slider fires a relocation event per
 * pixel, so a live send is queued rather than sent, at most one every 30 ms, and a final one
 * is forced on release — `canApplyLiveHeight()` then refuses to overwrite the field while the
 * player is mid-drag or mid-edit, so the server's echo cannot fight the hand.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/CustomStackHeightWidget.as
 */
export class CustomStackHeightWidget extends RoomWidgetBase
{
    // AS3: .../furniture/CustomStackHeightWidget.as::SLIDER_RANGE
    private static readonly SLIDER_RANGE: number = 10;

    // AS3: .../furniture/CustomStackHeightWidget.as::MAX_HEIGHT
    private static readonly MAX_HEIGHT: number = 80;

    // AS3: .../furniture/CustomStackHeightWidget.as::SLIDER_BUTTON_WIDTH
    private static readonly SLIDER_BUTTON_WIDTH: number = 20;

    // AS3: .../furniture/CustomStackHeightWidget.as::SLIDER_LIVE_UPDATE_INTERVAL_MS
    private static readonly SLIDER_LIVE_UPDATE_INTERVAL_MS: number = 30;

    /** The "put it on top of whatever is there" sentinel the server understands. */
    // AS3: .../furniture/CustomStackHeightWidget.as::windowProcedure() "button_above_stack"
    private static readonly HEIGHT_ABOVE_STACK: number = -100;

    // AS3: .../furniture/CustomStackHeightWidget.as::CustomStackHeightWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);

        if(this.handler !== null)
        {
            this.handler.widget = this;
        }
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../furniture/CustomStackHeightWidget.as::_SafeStr_6628
    private _objectId: number = 0;

    // AS3: .../furniture/CustomStackHeightWidget.as::_ignoreCheckboxEvents
    private _ignoreCheckboxEvents: boolean = false;

    // AS3: .../furniture/CustomStackHeightWidget.as::_ignoreInputChangeEvents
    private _ignoreInputChangeEvents: boolean = false;

    /** True between mouse-down and mouse-up on the slider knob. */
    // AS3: .../furniture/CustomStackHeightWidget.as::_SafeStr_5931
    private _draggingSlider: boolean = false;

    // AS3: .../furniture/CustomStackHeightWidget.as::_hasUnsavedInputChanges
    private _hasUnsavedInputChanges: boolean = false;

    /** The knob actually moved during this drag — a click without movement sends nothing extra. */
    // AS3: .../furniture/CustomStackHeightWidget.as::_SafeStr_6533
    private _sliderMoved: boolean = false;

    // AS3: .../furniture/CustomStackHeightWidget.as::_SafeStr_6414
    private _liveSendPending: boolean = false;

    // AS3: .../furniture/CustomStackHeightWidget.as::_SafeStr_6386
    private _finalSendPending: boolean = false;

    // AS3: .../furniture/CustomStackHeightWidget.as::_lastSliderSendTime
    private _lastSliderSendTime: number = -CustomStackHeightWidget.SLIDER_LIVE_UPDATE_INTERVAL_MS;

    /** The server's idea of the height, kept so an abandoned edit can be rolled back to it. */
    // AS3: .../furniture/CustomStackHeightWidget.as::_SafeStr_7307
    private _serverHeight: number = NaN;

    /** AS3 uses a `flash.utils.Timer`; a one-shot timeout is the same thing here. */
    // AS3: .../furniture/CustomStackHeightWidget.as::_SafeStr_5129
    private _sliderSendTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../furniture/CustomStackHeightWidget.as::get handler()
    private get handler(): CustomStackHeightWidgetHandler | null
    {
        return this.widgetHandler as CustomStackHeightWidgetHandler | null;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::get mainWindow()
    public override get mainWindow(): IWindow | null
    {
        return this._window;
    }

    /**
     * `isWalkTile` swaps both the caption set and the window height — the walk-tile variant is
     * taller because of the checkbox row.
     */
    // AS3: .../furniture/CustomStackHeightWidget.as::open()
    public open(objectId: number, height: number, isWalkTile: boolean, multiWalkMode: boolean): void
    {
        this._objectId = objectId;

        const clampedHeight = Math.min(height, CustomStackHeightWidget.MAX_HEIGHT);

        this.resetInteractionState();

        if(this._window === null)
        {
            this.createWindow();
        }

        if(this._window === null) return;

        const walkTileContainer = this.walkTileContainer;

        if(walkTileContainer !== null)
        {
            walkTileContainer.visible = isWalkTile;
        }

        if(isWalkTile)
        {
            this._ignoreCheckboxEvents = true;

            if(multiWalkMode)
            {
                this.multiWalkCheckbox?.select();
            }
            else
            {
                this.multiWalkCheckbox?.unselect();
            }

            this._ignoreCheckboxEvents = false;
        }

        this._window.height = isWalkTile
            ? this._window.limits.maxHeight
            : Math.trunc(this._window.limits.minHeight);

        const captionKey = isWalkTile ? 'walk' : 'stack';

        this._serverHeight = clampedHeight;

        this._window.caption = this.localizations?.getLocalization(`widget.custom.${captionKey}.height.title`) ?? '';

        const heightText = this._window.findChildByName('height_text');

        if(heightText !== null)
        {
            heightText.caption = this.localizations?.getLocalization(`widget.custom.${captionKey}.height.text`) ?? '';
        }

        this.setInputHeightCaption(String(clampedHeight));
        this.updateSlider();

        this._window.visible = true;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::hide()
    public hide(): void
    {
        if(this._window === null) return;

        this.resetInteractionState();

        this._window.visible = false;
    }

    /** The handler's frame tick lands here — ignored while the player is holding the control. */
    // AS3: .../furniture/CustomStackHeightWidget.as::updateHeight()
    public updateHeight(objectId: number, height: number): void
    {
        if(this._objectId !== objectId) return;

        this._serverHeight = height;

        if(this.canApplyLiveHeight())
        {
            this.setAltitude(height);
        }
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::createWindow()
    private createWindow(): void
    {
        if(this._window !== null) return;

        const asset = this.assets?.getAssetByName('custom_stack_height_xml') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn('Missing layout "custom_stack_height_xml" - the stack-height widget cannot open');

            return;
        }

        this._window = this.windowManager.buildFromXML(asset.content as unknown as string) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.windowProcedure;
        this._window.center();

        this.multiWalkCheckbox?.addEventListener('WE_SELECTED', this.onMultiWalkChange);
        this.multiWalkCheckbox?.addEventListener('WE_UNSELECTED', this.onMultiWalkChange);

        this.inputHeightField?.addEventListener('WE_CHANGE', this.onInputHeightChange);
        this.inputHeightField?.addEventListener('WE_UNFOCUS', this.onInputHeightUnfocus);
        this.inputHeightField?.addEventListener('WE_UNFOCUSED', this.onInputHeightUnfocus);
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::destroyWindow()
    private destroyWindow(): void
    {
        if(this._window !== null)
        {
            this.cancelPendingSliderSend();

            this.multiWalkCheckbox?.removeEventListener('WE_SELECTED', this.onMultiWalkChange);
            this.multiWalkCheckbox?.removeEventListener('WE_UNSELECTED', this.onMultiWalkChange);

            this.inputHeightField?.removeEventListener('WE_CHANGE', this.onInputHeightChange);
            this.inputHeightField?.removeEventListener('WE_UNFOCUS', this.onInputHeightUnfocus);
            this.inputHeightField?.removeEventListener('WE_UNFOCUSED', this.onInputHeightUnfocus);

            this._window.procedure = null;
            this._window.dispose();
            this._window = null;
        }

        this.resetInteractionState();
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::onMultiWalkChange()
    private onMultiWalkChange = (): void =>
    {
        if(this._ignoreCheckboxEvents) return;

        this.send(new SetCustomStackingHeightMessageComposer([this._objectId, this.currentHeight, this.multiWalkMode]));
    };

    // AS3: .../furniture/CustomStackHeightWidget.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(window === null) return;

        switch(event.type)
        {
            case 'WME_CLICK':
                this.onClick(event, window);
                break;
            case 'WME_DOWN':
                if(window.name === 'slider_button')
                {
                    this._draggingSlider = true;
                    this.discardInputHeightEdit();
                    this._sliderMoved = false;
                }
                break;
            case 'WME_UP':
            case 'WME_UP_OUTSIDE':
                if(window.name === 'slider_button')
                {
                    this._draggingSlider = false;

                    if(this._sliderMoved)
                    {
                        this.requestFinalSliderSend();
                    }
                }
                break;
            case 'WME_DOUBLE_CLICK':
                if(window.name === 'slider_button')
                {
                    this.discardInputHeightEdit();

                    // The double-click variant keeps two decimals instead of rounding.
                    this.updateHeightSelection(true);
                    this.sendCurrentHeight();

                    this._lastSliderSendTime = CustomStackHeightWidget.now();
                }
                break;
            case 'WE_RELOCATED':
                if(window.name === 'slider_button')
                {
                    this.updateHeightSelection();

                    if(this._draggingSlider)
                    {
                        this._sliderMoved = true;
                        this.queueSliderLiveSend();
                    }
                }
                break;
            case 'WKE_KEY_DOWN':
                if(window.name === 'input_height' && (event as WindowKeyboardEvent).keyCode === 13)
                {
                    this.cancelPendingSliderSend();

                    this._hasUnsavedInputChanges = false;

                    this.updateSlider();
                    this.sendCurrentHeight();
                }
                break;
        }
    };

    // AS3: .../furniture/CustomStackHeightWidget.as::windowProcedure() "WME_CLICK"
    private onClick(event: WindowEvent, window: IWindow): void
    {
        switch(window.name)
        {
            case 'button_floor_level':
                this.cancelPendingSliderSend();
                this.discardInputHeightEdit();
                this.setAltitude(0);
                this.sendCurrentHeight();
                break;
            case 'button_above_stack':
                this.cancelPendingSliderSend();
                this.discardInputHeightEdit();
                this.send(new SetCustomStackingHeightMessageComposer([this._objectId, CustomStackHeightWidget.HEIGHT_ABOVE_STACK]));
                break;
            case 'button_move_down':
                this.cancelPendingSliderSend();
                this.discardInputHeightEdit();
                this.sendAdjacentHeightRequest(true);
                break;
            case 'button_move_up':
                this.cancelPendingSliderSend();
                this.discardInputHeightEdit();
                this.sendAdjacentHeightRequest(false);
                break;
            case 'header_button_close':
                this.destroyWindow();
                break;
            case 'slider':
                this.discardInputHeightEdit();

                if(this.sliderButton !== null)
                {
                    this.sliderButton.x = this.clampSliderButtonX((event as WindowMouseEvent).localX);
                }

                this.updateHeightSelection();
                this.sendCurrentHeight();

                this._lastSliderSendTime = CustomStackHeightWidget.now();
                break;
        }
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::sendCurrentHeight()
    private sendCurrentHeight(): void
    {
        this.send(new SetCustomStackingHeightMessageComposer([this._objectId, this.currentHeight]));
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::sendAdjacentHeightRequest()
    private sendAdjacentHeightRequest(down: boolean): void
    {
        this.send(new MoveFurnitureToAdjacentHeightMessageComposer(this._objectId, down));
    }

    /** TS-only: the `handler.container.connection.send()` chain AS3 repeats at five call sites. */
    private send(composer: SetCustomStackingHeightMessageComposer | MoveFurnitureToAdjacentHeightMessageComposer): void
    {
        this.handler?.container?.connection?.send(composer);
    }

    /** The wire wants hundredths of a tile. */
    // AS3: .../furniture/CustomStackHeightWidget.as::get currentHeight()
    private get currentHeight(): number
    {
        return this.currentHeightValue * 100;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::get multiWalkMode()
    private get multiWalkMode(): boolean
    {
        return this.multiWalkCheckbox?.isSelected ?? false;
    }

    /** Moves the knob to match the field. The procedure is detached so this does not echo back. */
    // AS3: .../furniture/CustomStackHeightWidget.as::updateSlider()
    private updateSlider(): void
    {
        if(this._window === null || this.sliderButton === null || this.slider === null) return;

        const ratio = Math.min(this.currentHeightValue / CustomStackHeightWidget.SLIDER_RANGE, 1);
        const travel = this.slider.width - CustomStackHeightWidget.SLIDER_BUTTON_WIDTH;

        this._window.procedure = null;
        this.sliderButton.x = travel * ratio;
        this._window.procedure = this.windowProcedure;
    }

    /** `fine` keeps two decimals — that is the double-click path. */
    // AS3: .../furniture/CustomStackHeightWidget.as::updateHeightSelection()
    private updateHeightSelection(fine: boolean = false): void
    {
        if(this.slider === null || this.sliderButton === null) return;

        const precision = fine ? 1 : 100;
        const travel = this.slider.width - CustomStackHeightWidget.SLIDER_BUTTON_WIDTH;
        const ratio = this.clampSliderButtonX(this.sliderButton.x) / travel;
        const scaled = ratio * CustomStackHeightWidget.SLIDER_RANGE * precision;

        this.setInputHeightCaption(String(Math.trunc(scaled) / precision));
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::set altitude()
    private setAltitude(value: number): void
    {
        if(this._window === null) return;

        this.setInputHeightCaption(String(value));
        this.updateSlider();
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::get walkTileContainer()
    private get walkTileContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('walktile_container') as IWindowContainer | null) ?? null;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::get multiWalkCheckbox()
    private get multiWalkCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('multiwalk_checkbox') as ISelectableWindow | null) ?? null;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::get inputHeightField()
    private get inputHeightField(): ITextFieldWindow | null
    {
        return (this._window?.findChildByName('input_height') as ITextFieldWindow | null) ?? null;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::get slider()
    private get slider(): IWindow | null
    {
        return this._window?.findChildByName('slider') ?? null;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::get sliderButton()
    private get sliderButton(): IWindow | null
    {
        return this._window?.findChildByName('slider_button') ?? null;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::get currentHeightValue()
    private get currentHeightValue(): number
    {
        const value = parseFloat(this.inputHeightField?.caption ?? '');

        return isNaN(value) ? 0 : value;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::onInputHeightChange()
    private onInputHeightChange = (): void =>
    {
        if(this._ignoreInputChangeEvents) return;

        this._hasUnsavedInputChanges = true;
    };

    /** Leaving the field without pressing enter rolls back to what the server last said. */
    // AS3: .../furniture/CustomStackHeightWidget.as::onInputHeightUnfocus()
    private onInputHeightUnfocus = (): void =>
    {
        if(this._hasUnsavedInputChanges && !isNaN(this._serverHeight))
        {
            this.setAltitude(this._serverHeight);
        }

        this._hasUnsavedInputChanges = false;
    };

    // AS3: .../furniture/CustomStackHeightWidget.as::queueSliderLiveSend()
    private queueSliderLiveSend(): void
    {
        this._liveSendPending = true;

        this.scheduleSliderSend();
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::requestFinalSliderSend()
    private requestFinalSliderSend(): void
    {
        this._finalSendPending = true;

        this.scheduleSliderSend();
    }

    /** Send now if the interval has already elapsed, otherwise wait out the remainder. */
    // AS3: .../furniture/CustomStackHeightWidget.as::scheduleSliderSend()
    private scheduleSliderSend(): void
    {
        const elapsed = CustomStackHeightWidget.now() - this._lastSliderSendTime;

        if(elapsed >= CustomStackHeightWidget.SLIDER_LIVE_UPDATE_INTERVAL_MS)
        {
            this.sendPendingSliderHeight();

            return;
        }

        this.cancelSliderTimer();

        this._sliderSendTimer = setTimeout(
            () => this.sendPendingSliderHeight(),
            Math.max(1, CustomStackHeightWidget.SLIDER_LIVE_UPDATE_INTERVAL_MS - elapsed)
        );
    }

    /**
     * The final-send flag survives while the knob is still held: AS3 clears the live flag but
     * only clears the final one once the drag has ended, so a release always gets its send.
     */
    // AS3: .../furniture/CustomStackHeightWidget.as::sendPendingSliderHeight()
    private sendPendingSliderHeight(): void
    {
        if(!this._liveSendPending && !this._finalSendPending) return;

        this.sendCurrentHeight();

        this._lastSliderSendTime = CustomStackHeightWidget.now();
        this._liveSendPending = false;

        if(!this._draggingSlider)
        {
            this._finalSendPending = false;
        }
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::cancelPendingSliderSend()
    private cancelPendingSliderSend(): void
    {
        this.cancelSliderTimer();

        this._liveSendPending = false;
        this._finalSendPending = false;
        this._draggingSlider = false;
        this._sliderMoved = false;
    }

    // TS-only: `Timer.reset()`, which has no direct equivalent on a timeout handle.
    private cancelSliderTimer(): void
    {
        if(this._sliderSendTimer !== null)
        {
            clearTimeout(this._sliderSendTimer);
            this._sliderSendTimer = null;
        }
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::resetInteractionState()
    private resetInteractionState(): void
    {
        this.cancelPendingSliderSend();

        this._hasUnsavedInputChanges = false;
        this._lastSliderSendTime = -CustomStackHeightWidget.SLIDER_LIVE_UPDATE_INTERVAL_MS;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::canApplyLiveHeight()
    private canApplyLiveHeight(): boolean
    {
        return !this._draggingSlider && !this._hasUnsavedInputChanges && !this._finalSendPending && !this._liveSendPending;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::discardInputHeightEdit()
    private discardInputHeightEdit(): void
    {
        this._hasUnsavedInputChanges = false;
    }

    /** Writing the field would otherwise look like the player typing. */
    // AS3: .../furniture/CustomStackHeightWidget.as::setInputHeightCaption()
    private setInputHeightCaption(caption: string): void
    {
        this._ignoreInputChangeEvents = true;

        if(this.inputHeightField !== null)
        {
            this.inputHeightField.caption = caption;
        }

        this._ignoreInputChangeEvents = false;
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::clampSliderButtonX()
    private clampSliderButtonX(x: number): number
    {
        const travel = (this.slider?.width ?? 0) - CustomStackHeightWidget.SLIDER_BUTTON_WIDTH;

        return Math.max(0, Math.min(x, travel));
    }

    /** TS-only: `flash.utils.getTimer()` — milliseconds since start, monotonic. */
    private static now(): number
    {
        return Math.trunc(performance.now());
    }

    // AS3: .../furniture/CustomStackHeightWidget.as::dispose()
    public override dispose(): void
    {
        this.destroyWindow();
        this.cancelSliderTimer();

        super.dispose();
    }
}
