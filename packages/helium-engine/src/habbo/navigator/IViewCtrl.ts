import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * Interface for view controllers.
 *
 * @see sources/win63_version/habbo/navigator/IViewCtrl.as
 */
export interface IViewCtrl
{
	content: IWindowContainer | null;

	refresh(): void;
}
