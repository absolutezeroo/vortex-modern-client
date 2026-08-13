import type {IWindow} from '../IWindow';

/**
 * Mouse scaling service interface.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/services/IMouseScalingService.as
 */
export interface IMouseScalingService
{
    // AS3: .../src/com/sulake/core/window/services/IMouseScalingService.as::begin()
    begin(window: IWindow, scalingFlags: number): void;

    // AS3: .../src/com/sulake/core/window/services/IMouseScalingService.as::end()
    end(window: IWindow): void;
}
