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
    readonly localization: IHabboLocalizationManager | null;
    readonly avatarRenderManager: IAvatarRenderManager | null;
    readonly offerCenter: unknown | null;
    readonly stage: unknown | null;

    removeView(): void;

    removeBreakdown(): void;

    openPurchasePage(): void;

    openClubGiftPage(): void;

    showPaydayBreakdownView(): void;

    openPaydayHelpPage(): void;

    openHelpPage(): void;

    getOffers(): void;

    isKickbackEnabled(): boolean;
}
