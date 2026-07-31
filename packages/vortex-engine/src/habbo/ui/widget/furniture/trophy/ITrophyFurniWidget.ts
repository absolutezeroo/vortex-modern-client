/**
 * ITrophyFurniWidget
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/ITrophyFurniWidget.as
 *
 * The read-only face TrophyView renders against. NikoTrophyView deliberately takes the
 * concrete TrophyFurniWidget instead, because it also needs `localizations` and
 * `configuration`, which are not on this interface — that asymmetry is AS3's, not ours.
 */
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

export interface ITrophyFurniWidget
{
    // AS3: ITrophyFurniWidget.as::get assets()
    readonly assets: IAssetLibrary | null;

    // AS3: ITrophyFurniWidget.as::get name()
    readonly name: string;

    // AS3: ITrophyFurniWidget.as::get date()
    readonly date: string;

    // AS3: ITrophyFurniWidget.as::get color()
    readonly color: number;

    // AS3: ITrophyFurniWidget.as::get frameTitle()
    readonly frameTitle: string;

    // AS3: ITrophyFurniWidget.as::get headerColor()
    readonly headerColor: number;

    // AS3: ITrophyFurniWidget.as::get backgroundTheme()
    readonly backgroundTheme: number;

    // AS3: ITrophyFurniWidget.as::get windowManager()
    readonly windowManager: IHabboWindowManager;

    // AS3: ITrophyFurniWidget.as::get message()
    readonly message: string;
}
