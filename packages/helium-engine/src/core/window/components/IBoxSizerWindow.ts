import type {IWindowContainer} from '../IWindowContainer';

/**
 * Interface for box sizer windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IBoxSizerWindow.as
 */
export interface IBoxSizerWindow extends IWindowContainer
{
    setHorizontalPadding(value: number): void;

    setVerticalPadding(value: number): void;

    setSpacing(value: number): void;

    setVertical(value: boolean): void;

    setAutoRearrange(value: boolean): void;

    getAutoRearrange(): boolean;
}
