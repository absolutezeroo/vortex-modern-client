import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '../localization/IHabboLocalizationManager';
import type {IHabboNotifications} from '../notifications/IHabboNotifications';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import type {IAvatarEffect} from '../communication/messages/parser/inventory/AvatarEffectsMessageParser';
import type {IUserDataManager} from './IUserDataManager';
import type {IPerkManager} from './IPerkManager';
import type {IIgnoredUsersManager} from './IIgnoredUsersManager';
import type {IHabboGroupInfoManager} from './IHabboGroupInfoManager';
import type {IRoomSessionManager} from './IRoomSessionManager';
import type {IFurnitureData} from './furniture/IFurnitureData';
import type {IFurniDataListener} from './furniture/IFurniDataListener';
import type {IProductData} from './product/IProductData';
import type {IProductDataListener} from './product/IProductDataListener';
import type {BadgeInfo} from './BadgeInfo';

/**
 * Interface for session data manager
 * Manages user session data after authentication
 * @see source_as_win63/habbo/session/ISessionDataManager.as
 */
export interface ISessionDataManager extends IDisposable
{
    readonly events: EventEmitter;
    readonly communication: IHabboCommunicationManager | null;
    readonly userDataManager: IUserDataManager;
    readonly perkManager: IPerkManager;
    readonly ignoredUsersManager: IIgnoredUsersManager;
    readonly groupInfoManager: IHabboGroupInfoManager;
    readonly roomSessionManager: IRoomSessionManager | null;
    readonly windowManager: IHabboWindowManager | null;
    readonly localization: IHabboLocalizationManager | null;
    readonly notifications: IHabboNotifications | null;

    // System status
    readonly systemOpen: boolean;
    readonly systemShutDown: boolean;
    readonly isAuthenticHabbo: boolean;

    // User data
    readonly userId: number;
    readonly userName: string;
    readonly realName: string;
    readonly figure: string;
    readonly gender: string;
    readonly motto: string;

    // Security & status
    readonly clubLevel: number;
    readonly securityLevel: number;
    readonly topSecurityLevel: number;
    readonly isAmbassador: boolean;
    readonly noobnessLevel: number;

    readonly hasVip: boolean;
    readonly hasClub: boolean;
    readonly isNoob: boolean;
    readonly isRealNoob: boolean;
    readonly isAnyRoomController: boolean;
    readonly nameChangeAllowed: boolean;
    readonly canChangeName: boolean;
    readonly isEmailVerified: boolean;

    // Respect
    readonly respectTotal: number;
    readonly respectLeft: number;
    readonly respectReplenishesLeft: number;
    readonly petRespectLeft: number;
    readonly respectsReceived: number;
    readonly respectsRemaining: number;
    readonly respectsPetRemaining: number;

    // Safety
    readonly accountSafetyLocked: boolean;
    readonly safetyLocked: boolean;

    // Stream & access
    readonly streamPublishingAllowed: boolean;
    readonly lastAccessDate: string;
    readonly isFirstLoginOfDay: boolean;

    // Navigator
    readonly homeRoomId: number;
    readonly roomIdToEnter: number;
    readonly favouriteRooms: number[];
    readonly favouriteRoomsLimit: number;

    // Currency & achievements
    readonly activityPoints: Map<number, number>;
    readonly achievementScore: number;

    // UI preferences
    readonly uiFlags: number;
    readonly isRoomCameraFollowDisabled: boolean;
    readonly infoFeedEnabled: boolean;

    // Figure & effects
    readonly figureSetIds: number[];
    readonly boundFurnitureNames: string[];
    readonly avatarEffects: IAvatarEffect[];

    // Mystery box
    readonly mysteryBoxColor: string;
    readonly mysteryKeyColor: string;

    // Builders club
    readonly buildersClubSecondsLeft: number;
    readonly buildersClubFurniLimit: number;
    readonly buildersClubMaxFurniLimit: number;
    readonly buildersClubSecondsLeftWithGrace: number | null;

    // Perks
    readonly perksReady: boolean;

    // Talent
    readonly currentTalentTrack: string;
    newFurniDataHash: string;

    hasSecurity(level: number): boolean;

    send(composer: IMessageComposer<unknown[]>): void;

    // Respect
    giveRespect(userId: number): void;

    givePetRespect(petId: number): void;

    giveRespectFailed(): void;

    replenishRespect(): void;

    giveStarGem(userId: number): void;

    // UI preferences
    setRoomCameraFollowDisabled(disabled: boolean): void;

    setFriendBarState(open: boolean): void;

    setRoomToolsState(open: boolean): void;

    // Perks
    isPerkAllowed(perk: string): boolean;

    getPerkErrorMessage(perk: string): string;

    // Ignored users
    isIgnored(userId: number): boolean;

    ignoreUser(userId: number): void;

    unignoreUser(userId: number): void;

    isBlocked(userId: number): boolean;

    blockUser(userId: number): void;

    unblockUser(userId: number): void;

    // Safety
    isAccountSafetyLocked(): boolean;

    // Badge images
    getBadgeImage(badge: string): HTMLImageElement | null;

    getBadgeSmallImage(badge: string): HTMLImageElement | null;

    getBadgeImageAssetName(badge: string): string;

    getBadgeImageSmallAssetName(badge: string): string;

    requestBadgeImage(badge: string): HTMLImageElement | null;

    getBadgeImageWithInfo(badge: string): BadgeInfo;

    // Group badge images
    getGroupBadgeId(groupId: number): string;

    getGroupBadgeImage(badge: string): HTMLImageElement | null;

    getGroupBadgeSmallImage(badge: string): HTMLImageElement | null;

    getGroupBadgeAssetName(badge: string): string;

    getGroupBadgeSmallAssetName(badge: string): string;

    // Furniture data
    getProductData(productCode: string): IProductData | null;

    getFloorItemData(itemId: number): IFurnitureData | null;

    getFloorItemsDataByCategory(category: number): IFurnitureData[];

    getWallItemData(itemId: number): IFurnitureData | null;

    getFloorItemDataByName(name: string, index?: number): IFurnitureData | null;

    getWallItemDataByName(name: string, index?: number): IFurnitureData | null;

    loadProductData(listener?: IProductDataListener): boolean;

    getFurniData(listener: IFurniDataListener): IFurnitureData[] | null;

    getXmlWindow(name: string): IWindow | null;

    addProductsReadyEventListener(listener: IProductDataListener): void;

    removeFurniDataListener(listener: IFurniDataListener): void;

    refreshFurniData(): void;

    // Configuration callback
    onConfigurationComplete(): void;

    // Room actions
    openHabboHomePage(userId: number, userName: string): void;

    pickAllFurniture(roomId: number): void;

    resetScores(roomId: number): void;

    ejectAllFurniture(roomId: number, message: string): void;

    ejectPets(roomId: number): void;

    pickAllBuilderFurniture(roomId: number): void;

    // Credit vault & rewards
    getCreditVaultStatus(): void;

    getIncomeRewardStatus(): void;

    withdrawCreditVault(): void;

    claimReward(rewardId: number): void;

    // NFT
    hasNftChatStyle(styleId: number): boolean;

    hasPurchasableChatStyle(styleId: number): boolean;

    // Special command
    sendSpecialCommandMessage(command: string): void;

    dispose(): void;
}
