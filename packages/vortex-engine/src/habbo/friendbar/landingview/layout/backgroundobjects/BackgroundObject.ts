import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {HabboLandingView} from '../../HabboLandingView';

/**
 * Base class for a single background parallax decoration in the landing view.
 * Subclasses drive `sprite` position/frame via `update()` on each frame tick.
 *
 * Implements AS3 `_SafeCls_64` (`IDisposable` + `update(elapsedTime)`).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as
 */
export class BackgroundObject implements IDisposable
{
    private _id: number;
    protected _window: IWindow | null;
    protected _events: EventEmitter;
    private _sprite: IStaticBitmapWrapperWindow | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::BackgroundObject()
    constructor(id: number, container: IWindowContainer, events: EventEmitter, landingView: HabboLandingView, _dataContent: string, useStaticVariant: boolean = false)
    {
        this._id = id;
        this._window = container;
        this._events = events;
        this._sprite = landingView.getXmlWindow(useStaticVariant ? 'moving_object' : 'moving_object_floating') as IStaticBitmapWrapperWindow | null;

        if(this._sprite)
        {
            container.addChild(this._sprite);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::dispose()
    dispose(): void
    {
        this._window = null;
        this._sprite = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::get disposed()
    get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::set sprite()
    set sprite(value: IStaticBitmapWrapperWindow | null)
    {
        this._sprite = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::get sprite()
    get sprite(): IStaticBitmapWrapperWindow | null
    {
        return this._sprite;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::get window()
    get window(): IWindow | null
    {
        return this._window;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::set window()
    set window(value: IWindow | null)
    {
        this._window = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::get events()
    get events(): EventEmitter
    {
        return this._events;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/BackgroundObject.as::update()
    update(_elapsedTime: number): void
    {
        if(!this._sprite) return;
    }
}
