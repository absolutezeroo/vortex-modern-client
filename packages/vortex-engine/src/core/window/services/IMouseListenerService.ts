import type {IWindow} from '../IWindow';

/**
 * Mouse listener service interface.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/services/IMouseListenerService.as
 */
export interface IMouseListenerService
{
    // AS3: .../src/com/sulake/core/window/services/IMouseListenerService.as::get eventTypes()
    readonly eventTypes: string[];
    // AS3: .../src/com/sulake/core/window/services/IMouseListenerService.as::get areaLimit()
    areaLimit: number;

    // AS3: .../src/com/sulake/core/window/services/IMouseListenerService.as::begin()
    begin(window: IWindow): void;

    // AS3: .../src/com/sulake/core/window/services/IMouseListenerService.as::end()
    end(window: IWindow): void;
}
