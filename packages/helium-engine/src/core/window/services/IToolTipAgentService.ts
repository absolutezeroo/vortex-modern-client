import type {IWindow} from '../IWindow';

/**
 * Tooltip agent service interface.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/services/IToolTipAgentService.as
 */
export interface IToolTipAgentService
{
    show(window: IWindow, text: string): void;

    hide(): void;
}
