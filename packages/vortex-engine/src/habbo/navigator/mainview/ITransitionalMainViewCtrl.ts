import type {IWindow} from '@core/window/IWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {TextSearchInputs} from '../TextSearchInputs';

/**
 * Transitional main view controller interface.
 *
 * Bridge interface between old and new navigator main views.
 *
 * @see sources/win63_version/habbo/navigator/mainview/ITransitionalMainViewCtrl.as
 */
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::get disposed()
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::dispose()
// Both satisfied by `extends IDisposable` rather than redeclared here.
export interface ITransitionalMainViewCtrl extends IDisposable
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::get mainWindow()
    readonly mainWindow: IWindow | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::get searchInput()
    readonly searchInput: TextSearchInputs | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::get isPhaseOneNavigator()
    readonly isPhaseOneNavigator: boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::onNavigatorToolBarIconClick()
    onNavigatorToolBarIconClick(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::open()
    open(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::isOpen()
    isOpen(): boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::close()
    close(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::refresh()
    refresh(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::reloadRoomList()
    reloadRoomList(categoryId: number): boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::startSearch()
    startSearch(param1: number, searchType: number, query?: string, param4?: number): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::update()
    update(time: number): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/ITransitionalMainViewCtrl.as::openAtPosition()
    openAtPosition(x: number, y: number): void;
}
