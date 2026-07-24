import type {IDisposable} from '@core/runtime/IDisposable';
import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {FixedSizeStack} from '@habbo/utils/FixedSizeStack';

import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';

/**
 * VariableInfoBubbleView — the small floating "current value" bubble shown above a room object that
 * holds a highlighted wired variable. It follows its target every frame by projecting the object to
 * screen space (bounding rect + screen location, offset by the room-view rect), smoothing the vertical
 * position with a short max-window so the bubble does not jitter as the avatar/furni animates.
 *
 * Port note: AS3 builds the window from the component's asset library
 * (`assets.getAssetByName("variable_value_info_bubble_xml")` + `windowManager.buildFromXML`); the port
 * builds it through the central widget-layout registry (`buildWidgetLayout`), like every other wired
 * window. Flash Rectangle/Point are plain `{x,y,...}` objects here, so the `.offset()` calls become
 * manual additions; IRoomEngineRectangle exposes `top`/`height` (no `x`), which is all this view reads.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_variable_overview/VariableInfoBubbleView.as
 */
export class VariableInfoBubbleView implements IDisposable, IUpdateReceiver
{
    // AS3: VariableInfoBubbleView.as::_SafeStr_11396 (name derived: vertical-smoothing sample count)
    private static readonly SAMPLE_COUNT: number = 18;

    // AS3: VariableInfoBubbleView.as::_SafeStr_10349 (name derived: vertical position hysteresis, px)
    private static readonly VERTICAL_HYSTERESIS: number = 3;

    // AS3: VariableInfoBubbleView.as::MAX_VERTICAL_LEAD_RATIO
    private static readonly MAX_VERTICAL_LEAD_RATIO: number = 0.05;

    // AS3: VariableInfoBubbleView.as::STATE_IDLE
    private static readonly STATE_IDLE: number = 0;

    // AS3: VariableInfoBubbleView.as::STATE_AWAIT_TARGET_RECT
    private static readonly STATE_AWAIT_TARGET_RECT: number = 1;

    // AS3: VariableInfoBubbleView.as::STATE_ACTIVE (AS3 declares this equal to AWAIT_TARGET_RECT = 1)
    private static readonly STATE_ACTIVE: number = 1;

    // AS3: VariableInfoBubbleView.as::_disposed
    private _disposed: boolean = false;

    // AS3: VariableInfoBubbleView.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: VariableInfoBubbleView.as::_SafeStr_4597 (name derived: state)
    private _state: number = VariableInfoBubbleView.STATE_IDLE;

    // AS3: VariableInfoBubbleView.as::_SafeStr_4841 (name derived: target object id)
    private _objectId: number = 0;

    // AS3: VariableInfoBubbleView.as::_SafeStr_4689 (name derived: target category)
    private _category: number = 0;

    // AS3: VariableInfoBubbleView.as::_SafeStr_9531 (name derived: is-user target)
    private _isUser: boolean = false;

    // AS3: VariableInfoBubbleView.as::_window
    private _window: IWindowContainer;

    // AS3: VariableInfoBubbleView.as::_SafeStr_7018 (name derived: last smoothed lead value)
    private _lastLead: number = 0;

    // AS3: VariableInfoBubbleView.as::_SafeStr_6573 (name derived: vertical-position samples)
    private _samples: FixedSizeStack = new FixedSizeStack(VariableInfoBubbleView.SAMPLE_COUNT);

    // AS3: VariableInfoBubbleView.as::VariableInfoBubbleView()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
        this._window = roomEvents.windowManager!.buildWidgetLayout('variable_value_info_bubble_xml') as unknown as IWindowContainer;
        this._window.ignoreMouseEvents = true;
    }

    // AS3: VariableInfoBubbleView.as::updateValue()
    updateValue(value: string): void
    {
        if(this._state === VariableInfoBubbleView.STATE_IDLE)
        {
            return;
        }

        this.valueText.text = value;
    }

    // AS3: VariableInfoBubbleView.as::setActive()
    setActive(value: string, objectId: number, category: number, isUser: boolean): void
    {
        if(this._state !== VariableInfoBubbleView.STATE_IDLE)
        {
            return;
        }

        this.valueText.text = value;
        this._objectId = objectId;
        this._category = category;
        this._isUser = isUser;
        this._state = VariableInfoBubbleView.STATE_AWAIT_TARGET_RECT;
    }

    // AS3: VariableInfoBubbleView.as::setInactive()
    setInactive(): void
    {
        this.valueText.text = '';
        this._objectId = 0;
        this._category = 0;
        this._lastLead = 0;
        this._samples.reset();
        this._state = VariableInfoBubbleView.STATE_IDLE;
        this.hide();
    }

    // AS3: VariableInfoBubbleView.as::show()
    private show(): void
    {
        this._window.visible = true;

        if(this._window.parent == null)
        {
            const desktop = this._roomEvents.windowManager!.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null)
            {
                desktop.addChild(this._window);
            }
        }
        else
        {
            this._window.activate();
        }
    }

    // AS3: VariableInfoBubbleView.as::hide()
    private hide(): void
    {
        this._window.visible = false;

        if(this._window.parent != null)
        {
            const desktop = this._roomEvents.windowManager!.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null)
            {
                desktop.removeChild(this._window);
            }
        }
    }

    // AS3: VariableInfoBubbleView.as::get valueText()
    private get valueText(): ITextWindow
    {
        return this._window.findChildByName('value') as unknown as ITextWindow;
    }

    // AS3: VariableInfoBubbleView.as::update()
    update(_deltaTime: number): void
    {
        if(this._state === VariableInfoBubbleView.STATE_IDLE)
        {
            return;
        }

        const engine = this._roomEvents.roomEngine;
        const desktop = this._roomEvents.roomDesktop;

        if(engine == null || desktop == null)
        {
            return;
        }

        const canvasId = desktop.getFirstCanvasId();
        const rect = engine.getRoomObjectBoundingRectangle(engine.activeRoomId, this._objectId, this._category, canvasId);
        const point = engine.getRoomObjectScreenLocation(engine.activeRoomId, this._objectId, this._category, canvasId);
        const viewRect = desktop.getRoomViewRect();

        let rectTop = rect != null ? rect.top : 0;
        const rectHeight = rect != null ? rect.height : 0;
        let pointX = point != null ? point.x : 0;
        let pointY = point != null ? point.y : 0;

        if(rect != null && point != null && viewRect != null)
        {
            rectTop += viewRect.y;
            pointX += viewRect.x;
            pointY += viewRect.y;
        }

        if(rect == null || point == null)
        {
            return;
        }

        const offset = this.getOffset(rectHeight);
        const lead = Math.trunc(pointY - rectTop);
        this._samples.addValue(lead);

        let smoothed = this._samples.getMax();

        if(smoothed < this._lastLead - VariableInfoBubbleView.VERTICAL_HYSTERESIS)
        {
            smoothed = this._lastLead - VariableInfoBubbleView.VERTICAL_HYSTERESIS;
        }

        const smoothedY = Math.trunc(pointY - smoothed);
        this._lastLead = smoothed;
        const baseTop = Math.trunc(rectTop + offset);
        const minY = Math.trunc(baseTop - this.getMaximumVerticalLead(rectHeight));
        let finalY = smoothedY + offset;

        if(finalY < minY)
        {
            finalY = minY;
        }

        this._window.x = pointX - this._window.width / 2;
        this._window.y = finalY;

        if(this._state === VariableInfoBubbleView.STATE_AWAIT_TARGET_RECT)
        {
            this._state = VariableInfoBubbleView.STATE_ACTIVE;
            this.show();
        }
    }

    // AS3: VariableInfoBubbleView.as::getOffset()
    private getOffset(targetHeight: number): number
    {
        let offset = -this._window.height;

        if(this._isUser)
        {
            offset += targetHeight > 50 ? 25 : 0;
        }
        else
        {
            offset -= 4;
        }

        return offset;
    }

    // AS3: VariableInfoBubbleView.as::getMaximumVerticalLead()
    private getMaximumVerticalLead(targetHeight: number): number
    {
        return Math.trunc(targetHeight * VariableInfoBubbleView.MAX_VERTICAL_LEAD_RATIO);
    }

    // AS3: VariableInfoBubbleView.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: VariableInfoBubbleView.as::get category()
    get category(): number
    {
        return this._category;
    }

    // AS3: VariableInfoBubbleView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.hide();
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        this._samples = null as unknown as FixedSizeStack;
        this._disposed = true;
    }

    // AS3: VariableInfoBubbleView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}
