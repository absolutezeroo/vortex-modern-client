import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';

/**
 * Contract for a widget placed inside the landing view (hotel view).
 *
 * `container` is `null` until `initialize()` has built it — implementations
 * create their window lazily on first `initialize()` call.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/ILandingViewWidget.as
 */
export interface ILandingViewWidget extends IDisposable
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/ILandingViewWidget.as::initialize()
    initialize(): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/ILandingViewWidget.as::refresh()
    refresh(): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/ILandingViewWidget.as::get container()
    readonly container: IWindow | null;
}
