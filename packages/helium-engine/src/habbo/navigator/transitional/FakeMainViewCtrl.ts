import type {IWindow} from '@core/window/IWindow';
import type {ITransitionalMainViewCtrl} from '../mainview/ITransitionalMainViewCtrl';
import type {TextSearchInputs} from '../TextSearchInputs';
import type {HabboNewNavigator} from '../HabboNewNavigator';
import type {HabboNavigator} from '../HabboNavigator';

/**
 * Fake main view controller bridging old and new navigator.
 *
 * Implements ITransitionalMainViewCtrl by delegating to HabboNewNavigator.
 * Maps legacy search type codes (1-23) to new navigator search codes.
 *
 * @see sources/win63_version/habbo/navigator/transitional/FakeMainViewCtrl.as
 */
export class FakeMainViewCtrl implements ITransitionalMainViewCtrl
{
	private _newNavigator: HabboNewNavigator | null;
	private _oldNavigator: HabboNavigator | null;

	constructor(newNavigator: HabboNewNavigator, oldNavigator: HabboNavigator)
	{
		this._newNavigator = newNavigator;
		this._oldNavigator = oldNavigator;
	}

	get disposed(): boolean
	{
		return this._newNavigator === null && this._oldNavigator === null;
	}

	get mainWindow(): IWindow | null
	{
		return (this._newNavigator as any)?.mainWindow ?? null;
	}

	get searchInput(): TextSearchInputs | null
	{
		return (this._oldNavigator as any)?.mainViewCtrl?.searchInput ?? null;
	}

	get isPhaseOneNavigator(): boolean
	{
		return (this._oldNavigator as any)?.mainViewCtrl?.isPhaseOneNavigator ?? false;
	}

	onNavigatorToolBarIconClick(): void
	{
		this._newNavigator?.toggle();
	}

	open(): void
	{
		this._newNavigator?.open();
	}

	isOpen(): boolean
	{
		return false;
	}

	close(): void
	{
		this._newNavigator?.close();
	}

	refresh(): void
	{
		(this._newNavigator as any)?.refresh?.();
	}

	reloadRoomList(_categoryId: number): boolean
	{
		(this._newNavigator as any)?.refresh?.();

		return true;
	}

	/**
	 * Maps legacy search types to new navigator search codes and performs search.
	 *
	 * @param _param1 - Unused
	 * @param searchType - Legacy search type code (1-23)
	 * @param query - Search query string
	 * @param _param4 - Unused
	 */
	startSearch(_param1: number, searchType: number, query: string = '-1', _param4: number = 1): void
	{
		const searchCode = this.getSearchCodeByLegacySearchType(searchType);

		this._newNavigator?.performSearch(searchCode, query);
	}

	update(_time: number): void
	{
		// No-op
	}

	openAtPosition(_x: number, _y: number): void
	{
		this._newNavigator?.open();
	}

	dispose(): void
	{
		this._newNavigator = null;
		this._oldNavigator = null;
	}

	/**
	 * Maps legacy search type codes (1-23) to new navigator search codes.
	 *
	 * @param searchType - Legacy search type
	 * @returns New navigator search code string
	 */
	private getSearchCodeByLegacySearchType(searchType: number): string
	{
		switch (searchType)
		{
			case 1:
				return 'popular';
			case 2:
				return 'highest_score';
			case 3:
				return 'friends_rooms';
			case 4:
				return 'with_friends';
			case 5:
				return 'my';
			case 6:
				return 'favorites';
			case 7:
				return 'history';
			case 8:
				return 'query';
			case 9:
				return 'query';
			case 10:
				return 'query';
			case 11:
				return 'official';
			case 12:
				return 'new_ads';
			case 13:
				return 'groups';
			case 14:
				return 'groups';
			case 15:
				return 'competition';
			case 16:
				return 'top_promotions';
			case 17:
				return 'new_ads';
			case 18:
				return 'with_rights';
			case 19:
				return 'my_groups';
			case 20:
				return 'query';
			case 21:
				return 'all_categories';
			case 22:
				return 'recommended';
			case 23:
				return 'history_freq';
			default:
				return 'query';
		}
	}
}
