import type {IWindow} from '../IWindow';

/**
 * Mouse scaling service interface.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/services/IMouseScalingService.as
 */
export interface IMouseScalingService
{
	begin(window: IWindow, scalingFlags: number): void;

	end(window: IWindow): void;
}
