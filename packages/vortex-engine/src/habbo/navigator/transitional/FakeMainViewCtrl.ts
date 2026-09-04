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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::_newNavigator
    private _newNavigator: HabboNewNavigator | null;
    private _oldNavigator: HabboNavigator | null;

    constructor(newNavigator: HabboNewNavigator, oldNavigator: HabboNavigator)
    {
        this._newNavigator = newNavigator;
        this._oldNavigator = oldNavigator;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._newNavigator === null && this._oldNavigator === null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::get mainWindow()
    get mainWindow(): IWindow | null
    {
        return (this._newNavigator as any)?.mainWindow ?? null;
    }

    /**
	 * `_oldNavigator.mainViewCtrl` is the real `MainViewCtrl`, not this object — the two accessors
	 * hand out different controllers, which is the whole point of the pair. While both answered
	 * the fake, this getter called itself.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::get searchInput()
    get searchInput(): TextSearchInputs | null
    {
        return this._oldNavigator?.mainViewCtrl?.searchInput ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::get isPhaseOneNavigator()
    get isPhaseOneNavigator(): boolean
    {
        return this._oldNavigator?.mainViewCtrl?.isPhaseOneNavigator ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::onNavigatorToolBarIconClick()
    onNavigatorToolBarIconClick(): void
    {
        this._newNavigator?.toggle();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::open()
    open(): void
    {
        this._newNavigator?.open();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::isOpen()
    isOpen(): boolean
    {
        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::close()
    close(): void
    {
        this._newNavigator?.close();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::refresh()
    refresh(): void
    {
        (this._newNavigator as any)?.refresh?.();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::reloadRoomList()
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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::startSearch()
    startSearch(_param1: number, searchType: number, query: string = '-1', _param4: number = 1): void
    {
        const searchCode = this.getSearchCodeByLegacySearchType(searchType);

        this._newNavigator?.performSearch(searchCode, query);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::update()
    update(_time: number): void
    {
        // No-op
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::openAtPosition()
    openAtPosition(_x: number, _y: number): void
    {
        this._newNavigator?.open();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::dispose()
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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/transitional/FakeMainViewCtrl.as::getSearchCodeByLegacySearchType()
    private getSearchCodeByLegacySearchType(searchType: number): string
    {
        switch(searchType)
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
