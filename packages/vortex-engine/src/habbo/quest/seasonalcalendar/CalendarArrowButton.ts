import type {IDisposable} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IWindow} from '@core/window/IWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {Texture} from 'pixi.js';
import {AvatarTextureUtils} from '@habbo/avatar/AvatarTextureUtils';

/**
 * One back/next scroll arrow of the seasonal calendar strip: three cached bitmaps
 * (inactive/active/hilite) swapped on `_window.bitmap`, plus the 1px "pressed" nudge AS3 also
 * applies to plain image buttons elsewhere in this client.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/seasonalcalendar/CalendarArrowButton.as
 */
export class CalendarArrowButton implements IDisposable
{
    // AS3: .../CalendarArrowButton.as::DIRECTION_BACK
    public static readonly DIRECTION_BACK: number = 0;
    // AS3: .../CalendarArrowButton.as::_SafeStr_11418 (name DERIVED — obfuscated in every
    // available tree; "next" comes from the only two call sites, which load `arrow_next_*`
    // assets for it).
    public static readonly DIRECTION_NEXT: number = 1;

    // AS3: .../CalendarArrowButton.as::STATE_INACTIVE
    public static readonly STATE_INACTIVE: number = 0;
    // AS3: .../CalendarArrowButton.as::STATE_ACTIVE
    public static readonly STATE_ACTIVE: number = 1;
    // AS3: .../CalendarArrowButton.as::STATE_HILITE
    public static readonly STATE_HILITE: number = 2;

    // AS3: .../CalendarArrowButton.as::PRESSED_OFFSET_PIXELS
    private static readonly PRESSED_OFFSET_PIXELS: {x: number; y: number} = {x: 1, y: 1};

    // AS3: .../CalendarArrowButton.as::_window
    private _window: IBitmapWrapperWindow | null;
    // AS3: .../CalendarArrowButton.as::_callback
    private _callback: ((event: WindowEvent, window: IWindow) => void) | null;

    // AS3: .../CalendarArrowButton.as::_SafeStr_4597 (name DERIVED — obfuscated in every
    // available tree). Holds one of the STATE_* constants above.
    private _state: number = CalendarArrowButton.STATE_INACTIVE;
    // AS3: .../CalendarArrowButton.as::_pressed
    private _pressed: boolean = false;
    // AS3: .../CalendarArrowButton.as::_SafeStr_7537 (name DERIVED — obfuscated in every
    // available tree). The window's un-pressed resting position, restored on
    // WME_UP/WME_UP_OUTSIDE.
    private _restingPosition: {x: number; y: number};

    // AS3: .../CalendarArrowButton.as::_SafeStr_6794 (name DERIVED — obfuscated in every
    // available tree).
    private _activeBitmap: ImageBitmap | null = null;
    // AS3: .../CalendarArrowButton.as::_SafeStr_6755 (name DERIVED — obfuscated in every
    // available tree).
    private _inactiveBitmap: ImageBitmap | null = null;
    // AS3: .../CalendarArrowButton.as::_SafeStr_6867 (name DERIVED — obfuscated in every
    // available tree).
    private _hiliteBitmap: ImageBitmap | null = null;

    // AS3: .../CalendarArrowButton.as::CalendarArrowButton()
    constructor(
        assets: IAssetLibrary | null,
        window: IBitmapWrapperWindow,
        direction: number,
        callback: (event: WindowEvent, window: IWindow) => void
    )
    {
        this._window = window;
        this._window.procedure = this.procedure;
        this._callback = callback;

        const assetPrefix = direction === CalendarArrowButton.DIRECTION_BACK ? 'arrow_back' : 'arrow_next';

        this._activeBitmap = CalendarArrowButton.toImageBitmap(assets, `${assetPrefix}_active`);
        this._inactiveBitmap = CalendarArrowButton.toImageBitmap(assets, `${assetPrefix}_inactive`);
        this._hiliteBitmap = CalendarArrowButton.toImageBitmap(assets, `${assetPrefix}_hilite`);

        this._restingPosition = {x: window.x, y: window.y};
        this.updateWindow();
    }

    // TS-only: shared conversion from this port's Texture-backed asset library to the
    // ImageBitmap IBitmapWrapperWindow.bitmap expects; AS3 reads BitmapData off the asset
    // directly (`BitmapData(assets.getAssetByName(name).content).clone()`).
    private static toImageBitmap(assets: IAssetLibrary | null, name: string): ImageBitmap | null
    {
        const texture = (assets?.getAssetByName(name)?.content ?? null) as Texture | null;

        return AvatarTextureUtils.toImageBitmap(texture);
    }

    // AS3: .../CalendarArrowButton.as::dispose()
    dispose(): void
    {
        this._activeBitmap = null;
        this._hiliteBitmap = null;
        this._inactiveBitmap = null;

        if(this._window)
        {
            this._window.procedure = null;
        }

        this._window = null;
        this._callback = null;
    }

    // TS-only: no AS3 counterpart; AS3's CalendarArrowButton has no `disposed` getter at all,
    // added here only to satisfy the `IDisposable` interface this port declares for it.
    get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: .../CalendarArrowButton.as::activate()
    activate(): void
    {
        if(this._state !== CalendarArrowButton.STATE_ACTIVE && this._state !== CalendarArrowButton.STATE_HILITE)
        {
            this._state = CalendarArrowButton.STATE_ACTIVE;
        }

        this.updateWindow();
    }

    // AS3: .../CalendarArrowButton.as::deactivate()
    deactivate(): void
    {
        this._state = CalendarArrowButton.STATE_INACTIVE;
        this.updateWindow();
    }

    // AS3: .../CalendarArrowButton.as::isInactive()
    isInactive(): boolean
    {
        return this._state === CalendarArrowButton.STATE_INACTIVE;
    }

    // AS3: .../CalendarArrowButton.as::updateWindow()
    private updateWindow(): void
    {
        if(this._window === null) return;

        switch(this._state)
        {
            case CalendarArrowButton.STATE_INACTIVE:
                this._window.bitmap = this._inactiveBitmap;
                break;

            case CalendarArrowButton.STATE_ACTIVE:
                this._window.bitmap = this._activeBitmap;
                break;

            case CalendarArrowButton.STATE_HILITE:
                this._window.bitmap = this._hiliteBitmap;
                break;
        }

        if(this._pressed)
        {
            this._window.x = this._restingPosition.x + CalendarArrowButton.PRESSED_OFFSET_PIXELS.x;
            this._window.y = this._restingPosition.y + CalendarArrowButton.PRESSED_OFFSET_PIXELS.y;
        }
        else
        {
            this._window.position = this._restingPosition;
        }
    }

    // AS3: .../CalendarArrowButton.as::procedure()
    private procedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(!(event instanceof WindowMouseEvent)) return;

        switch(event.type)
        {
            case WindowMouseEvent.OVER:
                if(this._state !== CalendarArrowButton.STATE_INACTIVE)
                {
                    this._state = CalendarArrowButton.STATE_HILITE;
                }

                break;

            case WindowMouseEvent.OUT:
                if(this._state !== CalendarArrowButton.STATE_INACTIVE)
                {
                    this._state = CalendarArrowButton.STATE_ACTIVE;
                }

                break;

            case WindowMouseEvent.DOWN:
                this._pressed = true;
                break;

            case WindowMouseEvent.UP:
            case WindowMouseEvent.UP_OUTSIDE:
                this._pressed = false;
                break;
        }

        this.updateWindow();
        this._callback?.(event, window);
    };
}
