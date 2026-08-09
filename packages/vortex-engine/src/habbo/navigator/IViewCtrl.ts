import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * Interface for view controllers.
 *
 * @see sources/win63_version/habbo/navigator/IViewCtrl.as
 */
export interface IViewCtrl
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/IViewCtrl.as::get content()
    content: IWindowContainer | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/IViewCtrl.as::refresh()
    refresh(): void;
}
