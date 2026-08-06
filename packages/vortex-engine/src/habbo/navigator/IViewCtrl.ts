import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * Interface for view controllers.
 *
 * @see sources/win63_version/habbo/navigator/IViewCtrl.as
 */
export interface IViewCtrl
{
    // AS3: sources/win63_version/habbo/navigator/IViewCtrl.as::get content()
    content: IWindowContainer | null;

    // AS3: sources/win63_version/habbo/navigator/IViewCtrl.as::refresh()
    refresh(): void;
}
