import type {IWindow} from '../IWindow';

/**
 * Mouse listener service interface.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/services/IMouseListenerService.as
 */
export interface IMouseListenerService
{
    readonly eventTypes: string[];
    areaLimit: number;

    begin(window: IWindow): void;

    end(window: IWindow): void;
}
