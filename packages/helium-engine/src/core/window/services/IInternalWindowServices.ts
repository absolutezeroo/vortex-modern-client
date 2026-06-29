import type {IMouseDraggingService} from './IMouseDraggingService';
import type {IMouseScalingService} from './IMouseScalingService';
import type {IMouseListenerService} from './IMouseListenerService';
import type {IFocusManagerService} from './IFocusManagerService';
import type {IToolTipAgentService} from './IToolTipAgentService';
import type {IGestureAgentService} from './IGestureAgentService';

/**
 * Internal window services aggregator.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/services/IInternalWindowServices.as
 */
export interface IInternalWindowServices
{
	getMouseDraggingService(): IMouseDraggingService;

	getMouseScalingService(): IMouseScalingService;

	getMouseListenerService(): IMouseListenerService;

	getFocusManagerService(): IFocusManagerService;

	getToolTipAgentService(): IToolTipAgentService;

	getGestureAgentService(): IGestureAgentService;
}
