import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';

/**
 * Interface for the Habbo Club Center manager.
 *
 * Public API consumed by ClubCenterView / ClubSpecialInfoBubbleView.
 *
 * @see sources/win63_version/habbo/catalog/clubcenter/HabboClubCenter.as
 */
export interface IHabboClubCenter
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::get localization()
    readonly localization: IHabboLocalizationManager | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::get avatarRenderManager()
    readonly avatarRenderManager: IAvatarRenderManager | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::get offerCenter()
    readonly offerCenter: unknown | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::get stage()
    readonly stage: unknown | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::removeView()
    removeView(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::removeBreakdown()
    removeBreakdown(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::openPurchasePage()
    openPurchasePage(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::openClubGiftPage()
    openClubGiftPage(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::showPaydayBreakdownView()
    showPaydayBreakdownView(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::openPaydayHelpPage()
    openPaydayHelpPage(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::openHelpPage()
    openHelpPage(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::getOffers()
    getOffers(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/clubcenter/HabboClubCenter.as::isKickbackEnabled()
    isKickbackEnabled(): boolean;
}
