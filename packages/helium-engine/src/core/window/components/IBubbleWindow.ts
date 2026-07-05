import type {IWindowContainer} from '../IWindowContainer';

/**
 * Interface for bubble windows with directional pointers.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IBubbleWindow.as
 */
export interface IBubbleWindow extends IWindowContainer
{
    direction: string;
    pointerOffset: number;
    readonly content: IWindowContainer | null;
}
