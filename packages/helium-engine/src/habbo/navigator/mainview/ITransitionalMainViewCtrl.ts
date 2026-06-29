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
export interface ITransitionalMainViewCtrl extends IDisposable
{
	readonly mainWindow: IWindow | null;
	readonly searchInput: TextSearchInputs | null;
	readonly isPhaseOneNavigator: boolean;

	onNavigatorToolBarIconClick(): void;

	open(): void;

	isOpen(): boolean;

	close(): void;

	refresh(): void;

	reloadRoomList(categoryId: number): boolean;

	startSearch(param1: number, searchType: number, query?: string, param4?: number): void;

	update(time: number): void;

	openAtPosition(x: number, y: number): void;
}
