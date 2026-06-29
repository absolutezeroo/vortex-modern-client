import type {IDisposable} from '@core';

/**
 * Loading screen interface.
 *
 * Port of AS3 IHabboLoadingScreen → IHeliumLoadingScreen.
 * The engine uses this interface to update the loading bar progress.
 * The concrete implementation lives in the client layer (DOM-based).
 *
 * @see sources/win63_2021_version/IHabboLoadingScreen.as
 */
export interface IHeliumLoadingScreen extends IDisposable
{
	/**
	 * Update the loading bar progress.
	 *
	 * @param progress - Progress ratio from 0.0 to 1.0
	 *
	 * @see sources/win63_2021_version/IHabboLoadingScreen.as updateLoadingBar()
	 */
	updateLoadingBar(progress: number): void;
}
