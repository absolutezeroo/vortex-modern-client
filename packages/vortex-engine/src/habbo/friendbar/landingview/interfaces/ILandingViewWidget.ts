import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';

/**
 * Contract for a widget placed inside the landing view (hotel view).
 *
 * `container` is `null` until `initialize()` has built it — implementations
 * create their window lazily on first `initialize()` call.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/ILandingViewWidget.as
 */
export interface ILandingViewWidget extends IDisposable
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/ILandingViewWidget.as::initialize()
    initialize(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/ILandingViewWidget.as::refresh()
    refresh(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/ILandingViewWidget.as::get container()
    readonly container: IWindow | null;
}
