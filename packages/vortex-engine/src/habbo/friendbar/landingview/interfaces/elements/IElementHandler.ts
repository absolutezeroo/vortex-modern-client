import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../../widget/GenericWidget';

/**
 * Contract for a pluggable content element instantiated inside a
 * `GenericWidget` from its `landing.view.<code>.conf` spec.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/IElementHandler.as
 */
export interface IElementHandler
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/IElementHandler.as::initialize()
    initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/elements/IElementHandler.as::refresh()
    refresh(): void;
}
