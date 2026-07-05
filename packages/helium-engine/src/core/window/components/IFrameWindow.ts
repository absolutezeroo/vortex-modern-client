import type {IWindowContainer} from '../IWindowContainer';
import type {IMargins} from '../utils/IMargins';
import type {IHeaderWindow} from './IHeaderWindow';
import type {ILabelWindow} from './ILabelWindow';
import type {IScalerWindow} from './IScalerWindow';
import type {IWindow} from '../IWindow';

/**
 * Interface for frame windows.
 *
 * A frame window is a windowed container with a title bar (header),
 * content region, margins, and optional scaler for resizing.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IFrameWindow.as
 */
export interface IFrameWindow extends IWindowContainer
{
    readonly title: ILabelWindow;
    readonly header: IHeaderWindow;
    readonly content: IWindowContainer;
    readonly margins: IMargins;
    readonly scaler: IScalerWindow;
    readonly menuButton: IWindow | null;
    menuButtonVisible: boolean;
    helpButtonAction: Function;
    helpPage: string;

    resizeToFitContent(): void;
}
