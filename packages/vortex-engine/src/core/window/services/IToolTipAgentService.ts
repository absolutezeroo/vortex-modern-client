import type {IWindow} from '../IWindow';

/**
 * Tooltip agent service interface.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/services/IToolTipAgentService.as
 */
export interface IToolTipAgentService
{
    show(window: IWindow, text: string): void;

    hide(): void;
}
