import type {
    ComposerClass,
    EventClass,
    IMessageConfiguration
} from '@core/communication/messages/IMessageConfiguration';

// Incoming Events - Handshake
import {
    AuthenticationOKMessageEvent,
    CompleteDiffieHandshakeMessageEvent,
    DisconnectReasonMessageEvent,
    GenericErrorMessageEvent,
    IdentityAccountsEvent,
    InitDiffieHandshakeMessageEvent,
    IsFirstLoginOfDayMessageEvent,
    NoobnessLevelMessageEvent,
    PingMessageEvent,
    UniqueMachineIdMessageEvent,
    UserObjectMessageEvent,
    UserRightsMessageEvent,
} from './messages/incoming/handshake';

// Incoming Events - Availability
import {
    AvailabilityStatusMessageEvent,
    LoginFailedHotelClosedMessageEvent,
    MaintenanceStatusMessageEvent,
} from './messages/incoming/availability';

// Incoming Events - Avatar
import {FigureUpdateMessageEvent,} from './messages/incoming/avatar';

// Incoming Events - Navigator
import {
    CanCreateRoomEventMessageEvent,
    CanCreateRoomMessageEvent,
    CategoriesWithVisitorCountMessageEvent,
    CompetitionRoomsDataMessageEvent,
    ConvertedRoomIdMessageEvent,
    DoorbellMessageEvent,
    FavouriteChangedMessageEvent,
    FavouritesMessageEvent,
    FlatAccessDeniedMessageEvent,
    FlatCreatedMessageEvent,
    GetGuestRoomResultMessageEvent,
    GuestRoomSearchResultMessageEvent,
    NavigatorSettingsMessageEvent,
    OfficialRoomsMessageEvent,
    PopularRoomTagsResultMessageEvent,
    RoomEventCancelMessageEvent,
    RoomEventMessageEvent,
    RoomInfoUpdatedMessageEvent,
    RoomRatingMessageEvent,
    UserEventCatsMessageEvent,
    UserFlatCatsMessageEvent,
} from './messages/incoming/navigator';

// Incoming Events - Notifications
// Incoming Events - Notifications (extended)
import {
    AccountSafetyLockStatusChangeMessageEvent,
    ActivityPointsMessageEvent,
    ClubGiftNotificationEvent,
    ClubGiftSelectedEvent,
    ElementPointerMessageEvent,
    HabboAchievementNotificationMessageEvent,
    HabboBroadcastMessageEvent,
    InfoFeedEnableMessageEvent,
    InfoHotelClosedMessageEvent,
    InfoHotelClosingMessageEvent,
    ModeratorCautionEvent,
    ModeratorMessageEvent,
    MOTDNotificationEvent,
    NotificationDialogMessageEvent,
    PetLevelNotificationEvent,
    PetReceivedMessageEvent,
    PetRespectFailedEvent,
    PetRespectNotificationEvent,
    RespectNotificationMessageEvent,
    RestoreClientMessageEvent,
    RoomMessageNotificationMessageEvent,
    UserBannedMessageEvent,
} from './messages/incoming/notifications';

// Incoming Events - Inventory
import {
    AchievementsScoreMessageEvent,
    AvatarEffectsMessageEvent,
    BadgesMessageEvent,
    BotInventoryMessageEvent,
    CreditBalanceEvent,
    FigureSetIdsMessageEvent,
    FurniListAddOrUpdateMessageEvent,
    FurniListInvalidateMessageEvent,
    FurniListMessageEvent,
    FurniListRemoveMessageEvent,
    FurniListRemoveMultipleMessageEvent,
    PetInventoryMessageEvent,
    TradingAcceptMessageEvent,
    TradingCloseMessageEvent,
    TradingCompletedMessageEvent,
    TradingConfirmationMessageEvent,
    TradingItemListMessageEvent,
    TradingNotOpenMessageEvent,
    TradingOpenMessageEvent,
    UnseenItemsMessageEvent,
} from './messages/incoming/inventory';

// Incoming Events - Mystery Box
import {MysteryBoxKeysMessageEvent,} from './messages/incoming/mysterybox';

// Incoming Events - Catalog
import {
    BonusRareInfoMessageEvent,
    BuildersClubSubscriptionStatusMessageEvent,
    CatalogIndexMessageEvent,
    CatalogPageMessageEvent,
    ClubGiftInfoEvent,
    NotEnoughBalanceMessageEvent,
    PurchaseErrorMessageEvent,
    PurchaseNotAllowedMessageEvent,
    PurchaseOKMessageEvent,
    LimitedOfferAppearingNextMessageEvent,
    CatalogPageWithEarliestExpiryMessageEvent,
    VoucherRedeemOkMessageEvent,
    VoucherRedeemErrorMessageEvent,
    HabboClubOffersMessageEvent,
    HabboClubExtendOfferMessageEvent,
    RecyclerStatusMessageEvent,
    RecyclerFinishedMessageEvent,
    RecyclerPrizesMessageEvent,
} from './messages/incoming/catalog';

// Incoming Events - Marketplace
import {
    MarketPlaceOffersEvent,
    MarketPlaceOwnOffersEvent,
    MarketplaceBuyOfferResultEvent,
    MarketplaceCancelOfferResultEvent,
    MarketplaceCancelAllOffersResultEvent,
    MarketplaceClearOwnHistoryResultEvent,
    MarketplaceConfigurationEvent,
    MarketplaceItemStatsEvent,
} from './messages/incoming/marketplace';

// Incoming Events - Landing View
import {PromoArticlesMessageEvent, CommunityVoteReceivedEvent,} from './messages/incoming/landingview';

// Incoming Events - Competition
import {CurrentTimingCodeMessageEvent} from './messages/incoming/competition';

// Incoming Events - Quest
import {
    CommunityGoalHallOfFameMessageEvent,
    QuestDailyMessageEvent,
    CommunityGoalProgressMessageEvent,
    ConcurrentUsersGoalProgressMessageEvent,
} from './messages/incoming/quest';

// Incoming Events - Room Session
import {
    CantConnectMessageEvent,
    CloseConnectionMessageEvent,
    FlatAccessibleMessageEvent,
    GamePlayerValueMessageEvent,
    HanditemConfigurationMessageEvent,
    OpenConnectionMessageEvent,
    RoomForwardMessageEvent,
    RoomQueueStatusMessageEvent,
    RoomReadyMessageEvent,
    YouAreNotSpectatorMessageEvent,
    YouArePlayingGameMessageEvent,
    YouAreSpectatorMessageEvent,
} from './messages/incoming/room/session';

// Incoming Events - Room Layout
import {RoomEntryTileMessageEvent,} from './messages/incoming/room/layout';

// Incoming Events - Room Permissions
import {
    YouAreControllerMessageEvent,
    YouAreNotControllerMessageEvent,
    YouAreOwnerMessageEvent,
} from './messages/incoming/room/permissions';

// Incoming Events - Room Engine
import {
    FloorHeightMapMessageEvent,
    FurnitureAliasesMessageEvent,
    HeightMapMessageEvent,
    HeightMapUpdateMessageEvent,
    ItemAddMessageEvent,
    ItemRemoveMessageEvent,
    ItemsMessageEvent,
    ItemUpdateMessageEvent,
    ObjectAddMessageEvent,
    ObjectDataUpdateMessageEvent,
    ObjectRemoveMessageEvent,
    ObjectsMessageEvent,
    ObjectUpdateMessageEvent,
    RoomEntryInfoMessageEvent,
    RoomPropertyMessageEvent,
    RoomVisualizationSettingsEvent,
    SlideObjectBundleMessageEvent,
    UserRemoveMessageEvent,
    UsersMessageEvent,
    UserUpdateMessageEvent,
} from './messages/incoming/room/engine';

// Incoming Events - Room Chat
import {
    ChatMessageEvent,
    ShoutMessageEvent,
    UserTypingMessageEvent,
    WhisperMessageEvent,
} from './messages/incoming/room/chat';

// Incoming Events - Room Furniture
import {
    OpenPetPackageRequestedMessageEvent,
    OpenPetPackageResultMessageEvent,
    PresentOpenedMessageEvent,
    RentableSpaceConfigMessageEvent,
    RoomDimmerPresetsMessageEvent,
} from './messages/incoming/room/furniture';

// Incoming Events - Room Pet
import {PetVocalMessageEvent} from './messages/incoming/room/pet';

// Incoming Events - User Defined Room Events (Wired)
import {WiredPermissionsEvent} from './messages/incoming/userdefinedroomevents';

// Incoming Events - Poll
import {
    PollContentsEvent,
    PollErrorEvent,
    PollOfferEvent,
    QuestionAnsweredEvent,
    QuestionEvent,
    QuestionFinishedEvent,
} from './messages/incoming/poll';

// Incoming Events - Help (name change events)
import {
    ChangeUserNameResultMessageEvent,
    FaqTextMessageEvent,
    UserNameChangedMessageEvent,
} from './messages/incoming/help';

// Incoming Events - Error
import {ErrorReportEvent} from './messages/incoming/error';

// Incoming Events - Users
import {
    ApproveNameMessageEvent,
    BlockListMessageEvent,
    BlockUserUpdateMessageEvent,
    ChangeEmailResultEvent,
    EmailStatusResultEvent,
    ExtendedProfileChangedMessageEvent,
    ExtendedProfileMessageEvent,
    GroupDetailsChangedMessageEvent,
    GuildMembershipsMessageEvent,
    HabboGroupBadgesMessageEvent,
    HabboGroupDeactivatedMessageEvent,
    HabboGroupDetailsMessageEvent,
    HabboGroupJoinFailedMessageEvent,
    HabboUserBadgesMessageEvent,
    HandItemReceivedMessageEvent,
    IgnoredUsersMessageEvent,
    IgnoreResultMessageEvent,
    InClientLinkMessageEvent,
    RelationshipStatusInfoEvent,
    ScrSendKickbackInfoMessageEvent,
    ScrSendUserInfoEvent,
} from './messages/incoming/users';

// Incoming Events - Preferences
import {AccountPreferencesEvent} from './messages/incoming/preferences';

// Incoming Events - Perk
import {PerkAllowancesMessageEvent} from './messages/incoming/perk';

// Incoming Events - NFT
import {
    UserNftChatStylesMessageEvent,
    UserPurchasableChatStyleChangedMessageEvent,
    UserPurchasableChatStylesMessageEvent,
} from './messages/incoming/nft';

// Incoming Events - Campaign
import {CampaignCalendarDataMessageEvent, CampaignCalendarDoorOpenedMessageEvent,} from './messages/incoming/campaign';

// Incoming Events - Advertisement
import {InterstitialMessageEvent, RoomAdErrorMessageEvent} from './messages/incoming/advertisement';

// Incoming Events - Tracking
import {LatencyPingResponseMessageEvent} from './messages/incoming/tracking';

// Incoming Events - Friendlist
import {
    AcceptFriendResultMessageEvent,
    ConsoleMessageHistoryEvent,
    FindFriendsProcessResultMessageEvent,
    FollowFriendFailedMessageEvent,
    FriendListFragmentMessageEvent,
    FriendListUpdateMessageEvent,
    FriendNotificationMessageEvent,
    FriendRequestsMessageEvent,
    HabboSearchResultMessageEvent,
    InstantMessageErrorEvent,
    MessengerErrorEvent,
    MessengerInitEvent,
    NewConsoleMessageEvent,
    NewFriendRequestMessageEvent,
    RoomInviteErrorMessageEvent,
    RoomInviteEvent,
} from './messages/incoming/friendlist';

// Incoming Events - Room Action
import {
    AvatarEffectMessageEvent,
    CarryObjectMessageEvent,
    DanceMessageEvent,
    ExpressionMessageEvent,
    SleepMessageEvent,
    UseObjectMessageEvent,
    UserChangeMessageEvent,
} from './messages/incoming/room/action';

// Incoming Events - New Navigator
import {
    NavigatorCollapsedCategoriesMessageEvent,
    NavigatorLiftedRoomsMessageEvent,
    NavigatorMetaDataMessageEvent,
    NavigatorSavedSearchesMessageEvent,
    NavigatorSearchResultSetMessageEvent,
    NavigatorWindowSettingsMessageEvent,
} from './messages/incoming/newnavigator';

// Outgoing Composers - Handshake & Core
import {
    ClientHelloMessageComposer,
    CompleteDiffieHandshakeMessageComposer,
    DisconnectMessageComposer,
    EventLogMessageComposer,
    InfoRetrieveMessageComposer,
    InitDiffieHandshakeMessageComposer,
    PongMessageComposer,
    SSOTicketMessageComposer,
    UniqueIDMessageComposer,
    VersionCheckMessageComposer,
} from './messages/outgoing';

// Outgoing Composers - Navigator
import {
    AddFavouriteRoomMessageComposer,
    CancelEventMessageComposer,
    CanCreateRoomMessageComposer,
    CompetitionRoomsSearchMessageComposer,
    ConvertGlobalRoomIdMessageComposer,
    CreateFlatMessageComposer,
    DeleteFavouriteRoomMessageComposer,
    EditEventMessageComposer,
    ForwardToSomeRoomMessageComposer,
    GetGuestRoomMessageComposer,
    GetOfficialRoomsMessageComposer,
    GetPopularRoomTagsMessageComposer,
    GetUserEventCatsMessageComposer,
    GetUserFlatCatsMessageComposer,
    GuildBaseSearchMessageComposer,
    MyFavouriteRoomsSearchMessageComposer,
    MyFrequentRoomHistorySearchMessageComposer,
    MyFriendsRoomsSearchMessageComposer,
    MyGuildBasesSearchMessageComposer,
    MyRecommendedRoomsMessageComposer,
    MyRoomHistorySearchMessageComposer,
    MyRoomRightsSearchMessageComposer,
    MyRoomsSearchMessageComposer,
    PopularRoomsSearchMessageComposer,
    RateFlatMessageComposer,
    RemoveOwnRoomRightsRoomMessageComposer,
    RoomAdEventTabAdClickedComposer,
    RoomAdEventTabViewedComposer,
    RoomAdSearchMessageComposer,
    RoomsWhereMyFriendsAreSearchMessageComposer,
    RoomsWithHighestScoreSearchMessageComposer,
    RoomTextSearchMessageComposer,
    SetRoomSessionTagsMessageComposer,
    ToggleStaffPickMessageComposer,
    UpdateHomeRoomMessageComposer,
    ForwardToARandomPromotedRoomMessageComposer,
} from './messages/outgoing/navigator';

// Outgoing Composers - New Navigator
import {
    NavigatorAddCollapsedCategoryMessageComposer,
    NavigatorAddSavedSearchComposer,
    NavigatorDeleteSavedSearchComposer,
    NavigatorRemoveCollapsedCategoryMessageComposer,
    NavigatorSetSearchCodeViewModeMessageComposer,
    NewNavigatorInitComposer,
    NewNavigatorSearchComposer,
} from './messages/outgoing/newnavigator';

// Outgoing Composers - Room Session
import {
    ChangeQueueMessageComposer,
    OpenFlatConnectionMessageComposer,
    QuitMessageComposer,
    RoomNetworkOpenConnectionMessageComposer,
} from './messages/outgoing/room/session';

// Outgoing Composers - Room Engine
import {
    GetFurnitureAliasesMessageComposer,
    GetHeightMapMessageComposer,
    MoveAvatarMessageComposer,
    MoveObjectMessageComposer,
    PickupObjectMessageComposer,
    PlaceObjectMessageComposer,
} from './messages/outgoing/room/engine';

// Outgoing Composers - Room Chat
import {
    CancelTypingMessageComposer,
    ChatMessageComposer,
    Game2GameChatMessageComposer,
    ShoutMessageComposer,
    StartTypingMessageComposer,
    WhisperMessageComposer,
} from './messages/outgoing/room/chat';

// Outgoing Composers - Room Avatar
import {
    AvatarExpressionMessageComposer,
    ChangeMottoMessageComposer,
    ChangePostureMessageComposer,
    DanceMessageComposer,
    SignMessageComposer,
} from './messages/outgoing/room/avatar';

// Outgoing Composers - Room Action
import {
    AmbassadorAlertMessageComposer,
    AssignRightsMessageComposer,
    BanUserWithDurationMessageComposer,
    KickUserMessageComposer,
    LetUserInMessageComposer,
    MuteAllInRoomComposer,
    MuteUserMessageComposer,
    RemoveRightsMessageComposer,
    UnmuteUserMessageComposer,
} from './messages/outgoing/room/action';

// Incoming Events - Room Settings
import {
    BannedUsersFromRoomEvent,
    FlatControllerAddedEvent,
    FlatControllerRemovedEvent,
    FlatControllersEvent,
    RoomSettingsDataEvent,
    RoomSettingsSavedEvent,
    RoomSettingsSaveErrorEvent,
    ShowEnforceRoomCategoryDialogEvent,
    UserUnbannedFromRoomEvent,
} from './messages/incoming/roomsettings';

// Outgoing Composers - Room (settings)
import {
    DeleteRoomMessageComposer,
    GetBannedUsersFromRoomMessageComposer,
    GetCustomRoomFilterMessageComposer,
    GetFlatControllersMessageComposer,
    GetRoomSettingsMessageComposer,
    RemoveAllRightsMessageComposer,
    SaveRoomSettingsMessageComposer,
    UnbanUserFromRoomMessageComposer,
    UpdateRoomCategoryAndTradeSettingsComposer,
    UpdateRoomFilterMessageComposer,
} from './messages/outgoing/room/settings';

// Outgoing Composers - Room (root)
import {RespectPetMessageComposer, RespectUserMessageComposer,} from './messages/outgoing/room';

// Outgoing Composers - Preferences
import {
    SetNewNavigatorWindowPreferencesMessageComposer,
    SetUIFlagsMessageComposer,
} from './messages/outgoing/preferences';

// Outgoing Composers - Room Furniture
import {
    ConfigureRentableSpaceMessageComposer,
    CreditFurniRedeemMessageComposer,
    GetRentableSpaceConfigMessageComposer,
    OpenPetPackageMessageComposer,
    PresentOpenMessageComposer,
    RoomDimmerChangeStateComposer,
    RoomDimmerGetPresetsComposer,
    RoomDimmerSavePresetComposer,
    UpdateClothingChangeFurnitureComposer,
    UseFurnitureMessageComposer,
} from './messages/outgoing/room/furniture';

// Outgoing Composers - Room Pet
import {
    CompostPlantComposer,
    GetPetCommandsComposer,
    GiveSupplementToPetMessageComposer,
    HarvestPetComposer,
    IssuePetCommandMessageComposer,
    MountPetComposer,
    MovePetMessageComposer,
    PickUpPetComposer,
    RemoveSaddleFromPetComposer,
    TogglePetBreedingPermissionComposer,
    TogglePetRidingPermissionComposer,
    UseProductForPetComposer,
} from './messages/outgoing/room/pet';

// Outgoing Composers - Poll
import {PollAnswerComposer, PollRejectComposer, PollStartComposer,} from './messages/outgoing/poll';

// Outgoing Composers - Landing View
import {GetPromoArticlesComposer, CommunityGoalVoteMessageComposer,} from './messages/outgoing/landingview';

// Outgoing Composers - Catalog
import {
    GetBonusRareInfoMessageComposer,
    GetCatalogIndexComposer,
    GetCatalogPageComposer,
    GetClubGiftMessageComposer,
    GetProductOfferComposer,
    PurchaseFromCatalogComposer,
    BuildersClubQueryFurniCountMessageComposer,
    GetLimitedOfferAppearingNextComposer,
    GetCatalogPageWithEarliestExpiryComposer,
    RedeemVoucherMessageComposer,
    GetClubOffersMessageComposer,
    PurchaseVipMembershipExtensionComposer,
    PurchaseBasicMembershipExtensionComposer,
    SelectClubGiftComposer,
    GetRecyclerStatusMessageComposer,
    GetRecyclerPrizesMessageComposer,
    RecycleItemsMessageComposer,
} from './messages/outgoing/catalog';

// Outgoing Composers - Marketplace
import {
    GetMarketplaceConfigurationMessageComposer,
    GetMarketplaceOffersMessageComposer,
    GetMarketplaceOwnOffersMessageComposer,
    CancelAllMarketplaceOffersMessageComposer,
    ClearOwnMarketplaceHistoryMessageComposer,
    BuyMarketplaceOfferMessageComposer,
    RedeemMarketplaceOfferCreditsMessageComposer,
    CancelMarketplaceOfferMessageComposer,
    GetMarketplaceItemStatsComposer,
} from './messages/outgoing/marketplace';

// Outgoing Composers - Quest
import {
    GetCommunityGoalHallOfFameMessageComposer,
    GetDailyQuestMessageComposer,
    ActivateQuestMessageComposer,
    CancelQuestMessageComposer,
    GetCommunityGoalProgressMessageComposer,
    GetConcurrentUsersGoalProgressMessageComposer,
    GetConcurrentUsersRewardMessageComposer,
} from './messages/outgoing/quest';

// Outgoing Composers - Talent
import {GetTalentTrackMessageComposer} from './messages/outgoing/talent';

// Outgoing Composers - Competition
import {GetCurrentTimingCodeMessageComposer} from './messages/outgoing/competition';

// Outgoing Composers - Notifications
import {GetMOTDMessageComposer} from './messages/outgoing/notifications';

// Outgoing Composers - Tracking
import {
    LagWarningReportMessageComposer,
    LatencyPingReportMessageComposer,
    LatencyPingRequestMessageComposer,
    PerformanceLogMessageComposer,
} from './messages/outgoing/tracking';

// Outgoing Composers - Friendlist
import {
    AcceptFriendMessageComposer,
    DeclineFriendMessageComposer,
    FindNewFriendsMessageComposer,
    FollowFriendMessageComposer,
    FriendListUpdateMessageComposer,
    GetFriendRequestsMessageComposer,
    GetMessengerHistoryComposer,
    GetRelationshipStatusInfoMessageComposer,
    HabboSearchMessageComposer,
    MessengerInitMessageComposer,
    RemoveFriendMessageComposer,
    RequestFriendMessageComposer,
    SendMsgMessageComposer,
    SendRoomInviteMessageComposer,
    SetRelationshipStatusMessageComposer,
    VisitUserMessageComposer,
} from './messages/outgoing/friendlist';
import {
    ApproveNameMessageComposer,
    BlockListInitComposer,
    BlockUserMessageComposer,
    ChangeEmailComposer,
    DeselectFavouriteHabboGroupMessageComposer,
    GetEmailStatusComposer,
    GetExtendedProfileByNameMessageComposer,
    GetExtendedProfileMessageComposer,
    GetGuildCreationInfoMessageComposer,
    GetGuildMembershipsMessageComposer,
    GetHabboGroupDetailsMessageComposer,
    GetIgnoredUsersMessageComposer,
    GetSelectedBadgesMessageComposer,
    GetUserNftChatStylesMessageComposer,
    IgnoreUserMessageComposer,
    JoinHabboGroupMessageComposer,
    ReplenishRespectMessageComposer,
    ScrGetKickbackInfoMessageComposer,
    ScrGetUserInfoMessageComposer,
    SelectFavouriteHabboGroupMessageComposer,
    UnblockUserMessageComposer,
    UnignoreUserMessageComposer
} from './messages/outgoing/users';

// Outgoing Composers - Campaign
import {OpenCampaignCalendarDoorAsStaffComposer, OpenCampaignCalendarDoorComposer,} from './messages/outgoing/campaign';

// Outgoing Composers - Advertisement
import {InterstitialShownMessageComposer,} from './messages/outgoing/advertisement';

// Outgoing Composers - Handshake (NUX)
import {NewUserExperienceScriptProceedComposer,} from './messages/outgoing/handshake';

// Outgoing Composers - Inventory
import {
    AcceptTradingComposer,
    AddItemToTradeComposer,
    AvatarEffectActivatedComposer,
    AvatarEffectSelectedComposer,
    CloseTradingComposer,
    ConfirmAcceptTradingComposer,
    ConfirmDeclineTradingComposer,
    CreditVaultStatusMessageComposer,
    GetBadgesComposer,
    GetBotInventoryComposer,
    GetCreditsInfoComposer,
    GetPetInventoryComposer,
    IncomeRewardClaimMessageComposer,
    IncomeRewardStatusMessageComposer,
    OpenTradingComposer,
    RemoveItemFromTradeComposer,
    RequestFurniInventoryComposer,
    ResetUnseenItemsComposer,
    SetActivatedBadgesComposer,
    UnacceptTradingComposer,
    WithdrawCreditVaultMessageComposer,
    RequestABadgeComposer,
} from './messages/outgoing/inventory';

/**
 * Habbo message configuration
 * Maps message IDs to their composer and event classes
 */
export class HabboMessages implements IMessageConfiguration 
{
    constructor() 
    {
        this.registerEvents();
        this.registerComposers();
    }

    private _events: Map<number, EventClass> = new Map();

    get events(): Map<number, EventClass> 
    {
        return this._events;
    }

    private _composers: Map<number, ComposerClass> = new Map();

    get composers(): Map<number, ComposerClass> 
    {
        return this._composers;
    }

    /**
     * Register incoming message events (Server -> Client)
     */
    private registerEvents(): void 
    {
        // === HANDSHAKE ===
        this._events.set(3309, InitDiffieHandshakeMessageEvent);
        this._events.set(3401, CompleteDiffieHandshakeMessageEvent);
        this._events.set(230, AuthenticationOKMessageEvent);
        this._events.set(1973, UniqueMachineIdMessageEvent);
        this._events.set(4000, DisconnectReasonMessageEvent);
        this._events.set(1343, IdentityAccountsEvent);

        // === SESSION ===
        this._events.set(1407, PingMessageEvent);
        this._events.set(297, GenericErrorMessageEvent);
        this._events.set(3599, UserRightsMessageEvent);
        this._events.set(3985, UserObjectMessageEvent);
        this._events.set(3913, NoobnessLevelMessageEvent);

        // === AVAILABILITY ===
        this._events.set(1350, AvailabilityStatusMessageEvent);
        this._events.set(698, LoginFailedHotelClosedMessageEvent);
        // AS3: header corrected 184 -> 1737 - was swapped with InfoHotelClosingMessageEvent.
        // sources/WIN63-202607011411-782849652 unknowns/_SafePkg_2018/_SafeCls_3162.as
        // (isInMaintenance, minutesUntilMaintenance, conditional duration) matches this
        // parser exactly and is registered at 1737, not 184.
        this._events.set(1737, MaintenanceStatusMessageEvent);

        // === AVATAR ===
        this._events.set(132, FigureUpdateMessageEvent);

        // === NAVIGATOR ===
        this._events.set(3586, NavigatorSettingsMessageEvent);
        this._events.set(1055, FavouritesMessageEvent);
        // AS3: header corrected 3796 -> 3081 (_SafeCls_3187, onFavouriteChanged in
        // com/sulake/habbo/navigator/_SafeCls_1951.as / _SafeCls_2208.as). Header 3796
        // there is really onPetFigureUpdate (_SafeCls_2731), an unrelated, unported message.
        this._events.set(3081, FavouriteChangedMessageEvent);
        this._events.set(3042, GetGuestRoomResultMessageEvent);
        this._events.set(1265, GuestRoomSearchResultMessageEvent);
        this._events.set(837, UserFlatCatsMessageEvent);
        this._events.set(1370, UserEventCatsMessageEvent);
        this._events.set(2952, PopularRoomTagsResultMessageEvent);
        this._events.set(2211, OfficialRoomsMessageEvent);
        this._events.set(704, CategoriesWithVisitorCountMessageEvent);
        this._events.set(2831, CanCreateRoomMessageEvent);
        this._events.set(853, CanCreateRoomEventMessageEvent);
        this._events.set(1712, FlatCreatedMessageEvent);
        this._events.set(2502, RoomRatingMessageEvent);
        this._events.set(3030, RoomInfoUpdatedMessageEvent);
        this._events.set(466, DoorbellMessageEvent);
        this._events.set(2481, RoomEventMessageEvent);
        this._events.set(894, RoomEventCancelMessageEvent);
        this._events.set(1086, FlatAccessDeniedMessageEvent);
        this._events.set(3494, ConvertedRoomIdMessageEvent);
        this._events.set(84, CompetitionRoomsDataMessageEvent);

        // === NOTIFICATIONS ===
        this._events.set(509, ActivityPointsMessageEvent);
        this._events.set(1936, InfoFeedEnableMessageEvent);

        // === INVENTORY ===
        this._events.set(3642, CreditBalanceEvent);
        this._events.set(1231, FigureSetIdsMessageEvent);
        this._events.set(3070, AchievementsScoreMessageEvent);
        // AS3: header corrected 2475 -> 2405 (_SafeCls_2835, onAvatarEffects in
        // com/sulake/habbo/inventory/_SafeCls_1951.as). Header 2475 there is really
        // onPostMessageMessage (_SafeCls_3133, GroupForumController.as), an unrelated,
        // unported message.
        this._events.set(2405, AvatarEffectsMessageEvent);

        // === INVENTORY - FURNI ===
        this._events.set(2694, FurniListMessageEvent);
        this._events.set(3151, FurniListAddOrUpdateMessageEvent);
        this._events.set(1156, FurniListRemoveMessageEvent);
        this._events.set(1268, FurniListRemoveMultipleMessageEvent);
        // AS3: header corrected 3790 -> 1856 (_SafeCls_2440, onFurniListInvalidate,
        // confirmed also at com/sulake/habbo/ui/handler/CraftingWidgetHandler.as:223).
        // Header 3790 there is really onTreasureHuntFail (_SafeCls_3474), an unrelated,
        // unported message.
        this._events.set(1856, FurniListInvalidateMessageEvent);

        // === INVENTORY - BADGES ===
        // AS3: header corrected 1091 -> 2748 (_SafeCls_3926, onBadges in
        // com/sulake/habbo/inventory/_SafeCls_1951.as, also seen at
        // catalog/clubcenter/HabboClubCenter.as:120). Header 1091 there is really
        // onCollectibleMintingEnabledMessage (_SafeCls_2669), an unrelated, unported message.
        this._events.set(2748, BadgesMessageEvent);

        // === INVENTORY - PETS ===
        this._events.set(1200, PetInventoryMessageEvent);

        // === INVENTORY - BOTS ===
        // AS3: header corrected 2902 -> 682 (_SafeCls_3058, onBots in
        // com/sulake/habbo/inventory/_SafeCls_1951.as:168). Header 2902 there is really
        // onGameStarted (_SafeCls_3582), an unrelated, unported message.
        this._events.set(682, BotInventoryMessageEvent);

        // === INVENTORY - TRADING ===
        this._events.set(953, TradingOpenMessageEvent);
        this._events.set(699, TradingCloseMessageEvent);
        this._events.set(560, TradingAcceptMessageEvent);
        this._events.set(2275, TradingItemListMessageEvent);
        this._events.set(1070, TradingCompletedMessageEvent);
        this._events.set(3138, TradingConfirmationMessageEvent);
        this._events.set(3556, TradingNotOpenMessageEvent);

        // === INVENTORY - UNSEEN ===
        this._events.set(3059, UnseenItemsMessageEvent);

        // === MYSTERY BOX ===
        this._events.set(1389, MysteryBoxKeysMessageEvent);

        // === CATALOG ===
        this._events.set(1893, BuildersClubSubscriptionStatusMessageEvent);

        // === HANDSHAKE (continued) ===
        this._events.set(2313, IsFirstLoginOfDayMessageEvent);

        // === NEW NAVIGATOR ===
        this._events.set(24, NavigatorMetaDataMessageEvent);
        this._events.set(3708, NavigatorSearchResultSetMessageEvent);
        this._events.set(866, NavigatorSavedSearchesMessageEvent);
        this._events.set(1761, NavigatorLiftedRoomsMessageEvent);
        this._events.set(1754, NavigatorCollapsedCategoriesMessageEvent);
        this._events.set(3937, NavigatorWindowSettingsMessageEvent);

        // === ROOM SESSION ===
        this._events.set(2349, RoomReadyMessageEvent);
        this._events.set(611, OpenConnectionMessageEvent);
        this._events.set(2051, FlatAccessibleMessageEvent);
        this._events.set(3404, CloseConnectionMessageEvent);
        this._events.set(530, RoomQueueStatusMessageEvent);
        this._events.set(1901, YouAreSpectatorMessageEvent);
        // AS3: header corrected 1856 -> 412 (_SafeCls_3717, onYouAreNotSpectator,
        // com/sulake/habbo/room/_SafeCls_1984.as:286). Header 1856 there is really
        // onFurniListInvalidate (_SafeCls_2440), which has moved here from 3790 - see
        // the INVENTORY - FURNI section above.
        this._events.set(412, YouAreNotSpectatorMessageEvent);
        // TODO(AS3): header 2942 confirmed correct (_SafeCls_3587, onConfigurationItemStates,
        // com/sulake/habbo/room/_SafeCls_1984.as:288, parser _SafeCls_3235). Shape gap confirmed:
        // the real parser conditionally reads 3 more booleans after isHanditemControlBlocked -
        // chooserDisabled, freeFurniMovementsEnabled, invisibleFurni (each only if bytesAvailable) -
        // that this TS parser does not read at all.
        this._events.set(2942, HanditemConfigurationMessageEvent);
        this._events.set(3339, RoomForwardMessageEvent);
        this._events.set(1052, GamePlayerValueMessageEvent);
        this._events.set(1600, YouArePlayingGameMessageEvent);
        this._events.set(2430, CantConnectMessageEvent);

        // === ROOM PERMISSIONS ===
        this._events.set(934, YouAreControllerMessageEvent);
        this._events.set(456, YouAreNotControllerMessageEvent);
        this._events.set(1986, YouAreOwnerMessageEvent);

        // === ROOM ENGINE ===
        this._events.set(2885, FloorHeightMapMessageEvent);
        this._events.set(154, FurnitureAliasesMessageEvent);
        this._events.set(2260, HeightMapMessageEvent);
        this._events.set(3279, HeightMapUpdateMessageEvent);
        this._events.set(2792, RoomEntryTileMessageEvent);
        this._events.set(2914, RoomEntryInfoMessageEvent);
        this._events.set(2104, ObjectsMessageEvent);
        this._events.set(368, ObjectAddMessageEvent);
        this._events.set(114, ObjectUpdateMessageEvent);
        this._events.set(1916, ObjectRemoveMessageEvent);
        this._events.set(2329, ObjectDataUpdateMessageEvent);
        this._events.set(3379, ItemsMessageEvent);
        this._events.set(3733, ItemAddMessageEvent);
        this._events.set(1198, ItemUpdateMessageEvent);
        this._events.set(2859, ItemRemoveMessageEvent);
        // TODO(AS3): header verified against sources/WIN63-202607011411-782849652 (_SafeCls_2131), but
        // the new parser reads one more Integer than the TS parser - re-verify field order.
        this._events.set(996, UsersMessageEvent);
        this._events.set(2613, UserUpdateMessageEvent);
        this._events.set(3693, UserRemoveMessageEvent);
        this._events.set(2794, SlideObjectBundleMessageEvent);
        // AS3: sources/win63_version/habbo/communication/messages/incoming/room/engine/RoomPropertyMessageEvent.as
        // (name recovered; obfuscated in primary dump as _SafeStr_4546[1956] = _SafeCls_2935,
        // sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2102/_SafeCls_2935.as - exact
        // field match: floorType/wallType/landscapeType/animatedLandscapeType).
        this._events.set(1956, RoomPropertyMessageEvent);
        // AS3: sources/win63_version/habbo/communication/messages/incoming/room/engine/RoomVisualizationSettingsEvent.as
        // (name recovered; obfuscated in primary dump as _SafeStr_4546[2986] = _SafeCls_2101,
        // sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2102/_SafeCls_2101.as - exact
        // field match: wallsHidden/wallThicknessMultiplier/floorThicknessMultiplier).
        this._events.set(2986, RoomVisualizationSettingsEvent);

        // === ROOM CHAT ===
        this._events.set(311, ChatMessageEvent);
        this._events.set(1776, ShoutMessageEvent);
        this._events.set(3072, WhisperMessageEvent);
        this._events.set(206, UserTypingMessageEvent);

        // === ROOM ACTION ===
        // AS3: header corrected 1783 -> 1036 (_SafeCls_3215, onExpression,
        // com/sulake/habbo/room/_SafeCls_1984.as:270, parser _SafeCls_3947 - userId,
        // expressionType - matches this TS parser exactly). Header 1783 there is really
        // onRoomSettingsSaved (_SafeCls_2385), which has moved here - see ROOM SETTINGS below.
        this._events.set(1036, ExpressionMessageEvent);
        this._events.set(2217, DanceMessageEvent);
        this._events.set(3629, AvatarEffectMessageEvent);
        this._events.set(3517, SleepMessageEvent);
        this._events.set(2850, CarryObjectMessageEvent);
        // AS3: header corrected 2833 -> 1953 (_SafeCls_3578, onUseObject,
        // com/sulake/habbo/room/_SafeCls_1984.as:275, parser _SafeCls_3865 - userId,
        // itemType - matches this TS parser exactly). Header 2833 there is really
        // onStateMessage (_SafeCls_3686, com/sulake/habbo/phonenumber/HabboPhoneNumber.as:82),
        // an unrelated, unported message.
        this._events.set(1953, UseObjectMessageEvent);
        this._events.set(3798, UserChangeMessageEvent);

        // === ROOM FURNITURE ===
        this._events.set(1093, RoomDimmerPresetsMessageEvent);
        this._events.set(914, PresentOpenedMessageEvent);
        this._events.set(3568, OpenPetPackageRequestedMessageEvent);
        this._events.set(716, OpenPetPackageResultMessageEvent);
        // Vortex-custom (not in official AS3 dumps): vortex-client commit e8dc43d "chore(protocol):
        // register rentable space (4600/4601) and pet (3072/3073) message IDs"
        this._events.set(4600, RentableSpaceConfigMessageEvent);

        // === ROOM PET ===
        // Vortex-custom (not in official AS3 dumps): vortex-client commit d6bc0d0 "feat(pets): add
        // pet vocal message, IssuePetCommand compositor and command UI"
        this._events.set(3073, PetVocalMessageEvent);

        // === WIRED ===
        // AS3: sources/win63_version/habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredPermissionsEvent.as
        // (name recovered; obfuscated in primary dump as _SafeStr_4546[3483] = _SafeCls_3768,
        // sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/_SafeCls_3768.as, whose
        // parser is the real, non-obfuscated com/sulake/habbo/communication/messages/parser/
        // userdefinedroomevents/wiredmenu/_SafeCls_2783.as - exact field match: canModify/canRead).
        this._events.set(3483, WiredPermissionsEvent);

        // === USERS ===
        this._events.set(1879, ApproveNameMessageEvent);
        // TODO(AS3): header 3909 really belongs to onTalentTrack (_SafeCls_2633,
        // com/sulake/habbo/friendbar/talent/TalentTrackController.as:133), an unrelated,
        // unported message - left unchanged since this class appears to be a dead
        // duplicate: its shape (a single int "result", EMAIL_STATUS_OK=0) matches no
        // AS3 message found in sources/WIN63-202607011411-782849652, and the real
        // onEmailStatus message (_SafeCls_2315/_SafeCls_1994: email, isVerified,
        // allowChange) is already correctly ported as EmailStatusResultEvent at 2343
        // (see USERS section below) and live-wired in SessionDataManager.ts. This class
        // has no other callers in the engine.
        this._events.set(3909, ChangeEmailResultEvent);
        this._events.set(1400, HabboGroupBadgesMessageEvent);
        // AS3-verified (vortex-emulator Turbo.Revisions/Revision20260701/Headers.cs:1014,
        // "GuildMembershipsMessageComposer = 3994 ... onGuildMemberships @ HabboCatalog"):
        // matches the real consumer confirmed by reading HabboCatalog.as directly.
        this._events.set(3994, GuildMembershipsMessageEvent);
        this._events.set(2847, HabboGroupDetailsMessageEvent);
        this._events.set(12, GroupDetailsChangedMessageEvent);
        this._events.set(2087, HabboGroupDeactivatedMessageEvent);
        this._events.set(3356, HabboGroupJoinFailedMessageEvent);
        this._events.set(1292, HabboUserBadgesMessageEvent);
        this._events.set(3874, HandItemReceivedMessageEvent);
        this._events.set(1554, InClientLinkMessageEvent);
        this._events.set(1918, ExtendedProfileMessageEvent);
        this._events.set(3369, ExtendedProfileChangedMessageEvent);
        this._events.set(3360, RelationshipStatusInfoEvent);
        this._events.set(3887, ScrSendKickbackInfoMessageEvent);
        // AS3: header corrected 1948 -> 1097 (_SafeCls_2180, onClubStatus,
        // com/sulake/habbo/inventory/_SafeCls_1951.as:462, parser _SafeCls_1956 - exact
        // field-for-field match with this TS parser). Header 1948 there is really
        // onGroupDeactivated (_SafeCls_2104, com/sulake/habbo/groups/HabboGroupsManager.as:199),
        // an unrelated, unported message.
        this._events.set(1097, ScrSendUserInfoEvent);
        this._events.set(2343, EmailStatusResultEvent);
        this._events.set(253, IgnoreResultMessageEvent);
        this._events.set(191, IgnoredUsersMessageEvent);
        this._events.set(505, BlockListMessageEvent);
        this._events.set(1825, BlockUserUpdateMessageEvent);

        // === HELP (name change) ===
        this._events.set(2319, UserNameChangedMessageEvent);
        this._events.set(1621, ChangeUserNameResultMessageEvent);

        // === HELP (FAQ) ===
        // AS3: sources/flash_version/src/com/sulake/habbo/communication/messages/incoming/help/FaqTextMessageEvent.as
        // (name recovered via sources/flash_version/OriginalClassNames.txt; obfuscated in primary dump
        // as _SafeStr_4546[2913] = _SafeCls_3480, sources/WIN63-202607011411-782849652/src/unknowns/
        // _SafePkg_1843/_SafeCls_3480.as, whose parser is the real, non-obfuscated
        // com/sulake/habbo/communication/messages/parser/help/_SafeCls_4068.as - exact field match:
        // questionId/answerText - vs. sources/flash_version's FaqTextMessageParser). Response to
        // GetFaqTextMessageComposer(questionId), not yet ported.
        this._events.set(2913, FaqTextMessageEvent);

        // === PREFERENCES ===
        this._events.set(724, AccountPreferencesEvent);

        // === PERK ===
        this._events.set(1535, PerkAllowancesMessageEvent);

        // === NFT ===
        this._events.set(2996, UserNftChatStylesMessageEvent);
        this._events.set(3774, UserPurchasableChatStylesMessageEvent);
        this._events.set(3971, UserPurchasableChatStyleChangedMessageEvent);

        // === CAMPAIGN ===
        this._events.set(1028, CampaignCalendarDataMessageEvent);
        this._events.set(2164, CampaignCalendarDoorOpenedMessageEvent);

        // === ADVERTISEMENT ===
        this._events.set(3898, InterstitialMessageEvent);
        // AS3: header corrected 2247 -> 2396 (_SafeCls_3880, onRoomAdError,
        // com/sulake/habbo/navigator/inroom/RoomEventViewCtrl.as:172, parser _SafeCls_2955 -
        // errorCode, filteredText - exact match with this TS parser). Header 2247 there is
        // really onCollectibles (_SafeCls_3840, com/sulake/habbo/inventory/_SafeCls_1951.as:166),
        // an unrelated, unported message.
        this._events.set(2396, RoomAdErrorMessageEvent);

        // === TRACKING ===
        this._events.set(188, LatencyPingResponseMessageEvent);

        // === FRIENDLIST / MESSENGER ===
        this._events.set(1590, MessengerInitEvent);
        this._events.set(468, NewConsoleMessageEvent);
        this._events.set(933, ConsoleMessageHistoryEvent);
        this._events.set(3501, InstantMessageErrorEvent);
        this._events.set(358, MessengerErrorEvent);
        this._events.set(3194, RoomInviteEvent);
        this._events.set(2641, FriendListFragmentMessageEvent);
        this._events.set(3611, FriendListUpdateMessageEvent);
        this._events.set(1120, FriendRequestsMessageEvent);
        this._events.set(1860, NewFriendRequestMessageEvent);
        this._events.set(3407, AcceptFriendResultMessageEvent);
        this._events.set(2094, FriendNotificationMessageEvent);
        this._events.set(2642, FindFriendsProcessResultMessageEvent);
        this._events.set(2637, HabboSearchResultMessageEvent);
        this._events.set(240, FollowFriendFailedMessageEvent);
        this._events.set(3065, RoomInviteErrorMessageEvent);

        // === NOTIFICATIONS (extended) ===
        this._events.set(1330, MOTDNotificationEvent);
        this._events.set(334, HabboBroadcastMessageEvent);
        // AS3: sources/win63_version/habbo/communication/class_1881.as — name_1[2806] = ElementPointerMessageEvent
        this._events.set(1807, ElementPointerMessageEvent);
        this._events.set(3885, ModeratorMessageEvent);
        this._events.set(2243, NotificationDialogMessageEvent);
        this._events.set(2686, RespectNotificationMessageEvent);
        this._events.set(1702, PetLevelNotificationEvent);
        this._events.set(639, HabboAchievementNotificationMessageEvent);
        // AS3: header corrected 1737 -> 184 - was swapped with MaintenanceStatusMessageEvent
        // (see AVAILABILITY section above). sources/WIN63-202607011411-782849652
        // unknowns/_SafePkg_2018/_SafeCls_2483.as (minutesUntilClosing only) matches this
        // parser exactly and is registered at 184, not 1737.
        this._events.set(184, InfoHotelClosingMessageEvent);
        this._events.set(3058, InfoHotelClosedMessageEvent);
        this._events.set(3621, UserBannedMessageEvent);
        this._events.set(2619, ModeratorCautionEvent);
        this._events.set(1023, ClubGiftNotificationEvent);
        this._events.set(3345, RestoreClientMessageEvent);
        this._events.set(70, AccountSafetyLockStatusChangeMessageEvent);
        this._events.set(1692, PetReceivedMessageEvent);
        this._events.set(31, PetRespectFailedEvent);
        this._events.set(1784, PetRespectNotificationEvent);
        this._events.set(1842, ClubGiftSelectedEvent);
        // AS3: header corrected 160 -> 1740 (_SafeCls_3168, onRoomMessagesNotification,
        // com/sulake/habbo/notifications/_SafeCls_1951.as:112, parser _SafeCls_3790 -
        // roomId, roomName, messageCount - exact field-for-field match, including default
        // flush values, with this TS parser). Header 160 there is really
        // onGuestRoomSearchResult (_SafeCls_3509, com/sulake/habbo/navigator/_SafeCls_1951.as),
        // an unrelated, unported message.
        this._events.set(1740, RoomMessageNotificationMessageEvent);

        // === POLL / WORD QUIZ ===
        this._events.set(579, PollOfferEvent);
        this._events.set(969, PollErrorEvent);
        this._events.set(1297, PollContentsEvent);
        this._events.set(2157, QuestionEvent);
        this._events.set(1659, QuestionAnsweredEvent);
        this._events.set(2108, QuestionFinishedEvent);

        // === ERROR ===
        this._events.set(1107, ErrorReportEvent);

        // === LANDING VIEW ===
        this._events.set(1082, PromoArticlesMessageEvent);
        this._events.set(2524, CommunityVoteReceivedEvent);

        // === COMPETITION ===
        this._events.set(3076, CurrentTimingCodeMessageEvent);

        // === CATALOG (bonus rare) ===
        this._events.set(3573, BonusRareInfoMessageEvent);
        this._events.set(1084, LimitedOfferAppearingNextMessageEvent);
        this._events.set(3389, CatalogPageWithEarliestExpiryMessageEvent);
        this._events.set(3422, ClubGiftInfoEvent);
        this._events.set(3666, CatalogIndexMessageEvent);
        this._events.set(1660, CatalogPageMessageEvent);
        this._events.set(1570, PurchaseOKMessageEvent);
        this._events.set(1029, PurchaseErrorMessageEvent);
        this._events.set(2493, PurchaseNotAllowedMessageEvent);
        this._events.set(1038, NotEnoughBalanceMessageEvent);
        this._events.set(1771, VoucherRedeemOkMessageEvent);
        this._events.set(133, VoucherRedeemErrorMessageEvent);
        this._events.set(419, HabboClubOffersMessageEvent);
        this._events.set(3689, HabboClubExtendOfferMessageEvent);
        this._events.set(2442, MarketPlaceOffersEvent);
        this._events.set(88, MarketPlaceOwnOffersEvent);
        this._events.set(2249, MarketplaceBuyOfferResultEvent);
        this._events.set(2448, MarketplaceCancelOfferResultEvent);
        this._events.set(921, MarketplaceCancelAllOffersResultEvent);
        this._events.set(1760, MarketplaceClearOwnHistoryResultEvent);
        this._events.set(1397, MarketplaceConfigurationEvent);
        this._events.set(2821, MarketplaceItemStatsEvent);
        this._events.set(1919, RecyclerStatusMessageEvent);
        this._events.set(281, RecyclerFinishedMessageEvent);
        this._events.set(3783, RecyclerPrizesMessageEvent);

        // === QUEST ===
        this._events.set(363, CommunityGoalHallOfFameMessageEvent);
        this._events.set(1417, QuestDailyMessageEvent);
        this._events.set(283, CommunityGoalProgressMessageEvent);
        this._events.set(1003, ConcurrentUsersGoalProgressMessageEvent);

        // === ROOM SETTINGS ===
        this._events.set(791, RoomSettingsDataEvent);
        this._events.set(726, FlatControllersEvent);
        this._events.set(845, BannedUsersFromRoomEvent);
        this._events.set(1359, FlatControllerAddedEvent);
        this._events.set(3335, FlatControllerRemovedEvent);
        // AS3: header corrected 2631 -> 1783 (_SafeCls_2385, onRoomSettingsSaved,
        // com/sulake/habbo/navigator/_SafeCls_1951.as / _SafeCls_2208.as). Header 2631
        // there is really onCallForHelpResult (_SafeCls_3126,
        // com/sulake/habbo/help/CallForHelpManager.as:81), an unrelated, unported message.
        // Header 1783 was freed by ExpressionMessageEvent moving to 1036 (see ROOM ACTION).
        this._events.set(1783, RoomSettingsSavedEvent);
        this._events.set(879, RoomSettingsSaveErrorEvent);
        this._events.set(2089, UserUnbannedFromRoomEvent);
        this._events.set(2944, ShowEnforceRoomCategoryDialogEvent);
    }

    /**
     * Register outgoing message composers (Client -> Server)
     */
    private registerComposers(): void 
    {
        // === HANDSHAKE ===
        this._composers.set(4000, ClientHelloMessageComposer);
        this._composers.set(2022, InitDiffieHandshakeMessageComposer);
        this._composers.set(2526, CompleteDiffieHandshakeMessageComposer);
        this._composers.set(3584, VersionCheckMessageComposer);
        // TODO(AS3): header fixed to match sources/WIN63-202607011411-782849652 (_SafeCls_2052 via
        // demo sendConnectionParameters()), but field shape may also need re-verification - the
        // AS3 composer takes only the ticket string, the TS one has an extra second param.
        this._composers.set(882, SSOTicketMessageComposer);
        this._composers.set(2309, UniqueIDMessageComposer);

        // === SESSION ===
        this._composers.set(362, PongMessageComposer);
        this._composers.set(2864, DisconnectMessageComposer);
        this._composers.set(756, InfoRetrieveMessageComposer);

        // === TRACKING ===
        this._composers.set(3809, EventLogMessageComposer);

        // === NAVIGATOR ===
        this._composers.set(2603, GetGuestRoomMessageComposer);
        this._composers.set(354, CreateFlatMessageComposer);
        this._composers.set(3169, AddFavouriteRoomMessageComposer);
        this._composers.set(1654, DeleteFavouriteRoomMessageComposer);
        this._composers.set(3487, RoomTextSearchMessageComposer);
        this._composers.set(2857, PopularRoomsSearchMessageComposer);
        this._composers.set(361, MyRoomsSearchMessageComposer);
        this._composers.set(2334, MyFavouriteRoomsSearchMessageComposer);
        this._composers.set(3942, GetOfficialRoomsMessageComposer);
        this._composers.set(2617, CanCreateRoomMessageComposer);
        this._composers.set(235, GetUserFlatCatsMessageComposer);
        this._composers.set(3018, GetUserEventCatsMessageComposer);
        this._composers.set(1817, UpdateHomeRoomMessageComposer);
        this._composers.set(407, RateFlatMessageComposer);
        this._composers.set(2985, ToggleStaffPickMessageComposer);
        this._composers.set(3214, GetPopularRoomTagsMessageComposer);
        this._composers.set(1903, MyFriendsRoomsSearchMessageComposer);
        this._composers.set(3427, ForwardToSomeRoomMessageComposer);
        this._composers.set(584, ConvertGlobalRoomIdMessageComposer);
        this._composers.set(3551, ForwardToARandomPromotedRoomMessageComposer);
        this._composers.set(3402, CancelEventMessageComposer);
        this._composers.set(2117, EditEventMessageComposer);
        this._composers.set(1307, CompetitionRoomsSearchMessageComposer);
        this._composers.set(2135, RoomsWithHighestScoreSearchMessageComposer);
        this._composers.set(2517, RoomsWhereMyFriendsAreSearchMessageComposer);
        this._composers.set(632, MyRoomHistorySearchMessageComposer);
        this._composers.set(2174, MyFrequentRoomHistorySearchMessageComposer);
        this._composers.set(1091, MyRoomRightsSearchMessageComposer);
        this._composers.set(2224, MyGuildBasesSearchMessageComposer);
        // AS3-verified (vortex-emulator Turbo.Revisions/Revision20260701/Headers.cs:184/181):
        // "GetGuildMembershipsMessageEvent = 3918 ... registerGuildSelectorWidget()" and
        // "GetGuildCreationInfoMessageEvent = 2989 ... BuyGuildWidget::onButtonClicked()".
        this._composers.set(3918, GetGuildMembershipsMessageComposer);
        this._composers.set(2989, GetGuildCreationInfoMessageComposer);
        this._composers.set(184, MyRecommendedRoomsMessageComposer);
        this._composers.set(3744, GuildBaseSearchMessageComposer);
        this._composers.set(3101, SetRoomSessionTagsMessageComposer);
        this._composers.set(1971, RoomAdSearchMessageComposer);
        this._composers.set(260, RemoveOwnRoomRightsRoomMessageComposer);
        this._composers.set(759, RoomAdEventTabAdClickedComposer);
        this._composers.set(3729, RoomAdEventTabViewedComposer);

        // === NEW NAVIGATOR ===
        this._composers.set(1590, NewNavigatorInitComposer);
        this._composers.set(81, NewNavigatorSearchComposer);
        this._composers.set(1188, NavigatorAddSavedSearchComposer);
        this._composers.set(2444, NavigatorDeleteSavedSearchComposer);
        this._composers.set(3920, NavigatorAddCollapsedCategoryMessageComposer);
        this._composers.set(3449, NavigatorRemoveCollapsedCategoryMessageComposer);
        this._composers.set(3681, NavigatorSetSearchCodeViewModeMessageComposer);

        // === ROOM SESSION ===
        this._composers.set(3234, OpenFlatConnectionMessageComposer);
        this._composers.set(2704, ChangeQueueMessageComposer);
        // AS3: sources/win63_version/habbo/communication/class_1881.as:628 — was incorrectly
        // registered as 2722 (that ID actually belongs to the unported groupforums
        // PostMessageMessageComposer, per class_1881.as:747).
        this._composers.set(3061, QuitMessageComposer);
        this._composers.set(2045, RoomNetworkOpenConnectionMessageComposer);

        // === ROOM AVATAR ===
        this._composers.set(2659, ChangeMottoMessageComposer);
        this._composers.set(2912, AvatarExpressionMessageComposer);
        this._composers.set(211, SignMessageComposer);
        this._composers.set(48, DanceMessageComposer);
        this._composers.set(3181, ChangePostureMessageComposer);

        // === ROOM ACTION ===
        this._composers.set(3361, AmbassadorAlertMessageComposer);
        this._composers.set(2748, KickUserMessageComposer);
        this._composers.set(120, BanUserWithDurationMessageComposer);
        this._composers.set(2339, MuteUserMessageComposer);
        this._composers.set(32, MuteAllInRoomComposer);
        this._composers.set(498, UnmuteUserMessageComposer);
        this._composers.set(3946, UpdateRoomCategoryAndTradeSettingsComposer);
        this._composers.set(1622, UpdateRoomFilterMessageComposer);
        this._composers.set(790, GetCustomRoomFilterMessageComposer);
        this._composers.set(373, AssignRightsMessageComposer);
        this._composers.set(3444, RemoveRightsMessageComposer);
        this._composers.set(963, LetUserInMessageComposer);

        // === ROOM RESPECT ===
        this._composers.set(3770, RespectUserMessageComposer);
        this._composers.set(576, RespectPetMessageComposer);

        // === ROOM FURNITURE ===
        this._composers.set(434, CreditFurniRedeemMessageComposer);
        this._composers.set(2485, PresentOpenMessageComposer);
        this._composers.set(1884, OpenPetPackageMessageComposer);
        this._composers.set(3145, RoomDimmerGetPresetsComposer);
        this._composers.set(130, RoomDimmerSavePresetComposer);
        this._composers.set(3894, RoomDimmerChangeStateComposer);
        this._composers.set(1220, UpdateClothingChangeFurnitureComposer);
        this._composers.set(3353, UseFurnitureMessageComposer);
        // Vortex-custom (not in official AS3 dumps): vortex-client commit f3bba54 "feat(rentablespace):
        // add config message, compositors and updated display widget"
        this._composers.set(4600, GetRentableSpaceConfigMessageComposer);
        this._composers.set(4601, ConfigureRentableSpaceMessageComposer);

        // === ROOM PET ===
        this._composers.set(1640, PickUpPetComposer);
        // Vortex-custom (not in official AS3 dumps): vortex-client commit e8dc43d "chore(protocol):
        // register rentable space (4600/4601) and pet (3072/3073) message IDs"
        this._composers.set(3072, IssuePetCommandMessageComposer);
        this._composers.set(2761, MovePetMessageComposer);
        this._composers.set(1996, MountPetComposer); // Also used for dismount — AS3 sends an explicit `mount` boolean, same message ID for both
        this._composers.set(3713, TogglePetRidingPermissionComposer);
        this._composers.set(2884, RemoveSaddleFromPetComposer);
        this._composers.set(2425, GetPetCommandsComposer);
        this._composers.set(1210, HarvestPetComposer);
        this._composers.set(144, TogglePetBreedingPermissionComposer);
        this._composers.set(1989, CompostPlantComposer);
        this._composers.set(2099, UseProductForPetComposer);
        this._composers.set(1694, GiveSupplementToPetMessageComposer);

        // === POLL ===
        this._composers.set(743, PollStartComposer);
        this._composers.set(1088, PollRejectComposer);
        this._composers.set(3386, PollAnswerComposer);

        // === NOTIFICATIONS ===
        this._composers.set(3163, GetMOTDMessageComposer);

        // === TRACKING ===
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as
        // registers this composer's real class (_SafeCls_2653, confirmed via LatencyTracker.as's
        // single-int-param usage) at 544, not 1242 - 1242 belongs to
        // ClearOwnMarketplaceHistoryMessageComposer, a different composer in the same registry.
        this._composers.set(544, LatencyPingRequestMessageComposer);
        this._composers.set(1744, LatencyPingReportMessageComposer);
        this._composers.set(481, LagWarningReportMessageComposer);
        this._composers.set(3983, PerformanceLogMessageComposer);

        // === FRIENDLIST ===
        this._composers.set(1515, VisitUserMessageComposer);
        this._composers.set(3357, SendMsgMessageComposer);
        this._composers.set(727, GetMessengerHistoryComposer);
        this._composers.set(886, FollowFriendMessageComposer);
        this._composers.set(3278, MessengerInitMessageComposer);
        // TODO(AS3): header fixed to match sources/WIN63-202607011411-782849652 (_SafeCls_3920), but
        // field shape may also need re-verification - the AS3 composer is built via
        // addAcceptedRequest() mutation, not a request-id array constructor arg.
        this._composers.set(1772, AcceptFriendMessageComposer);
        // TODO(AS3): header fixed to match sources/WIN63-202607011411-782849652 (_SafeCls_3339), but
        // field shape may also need re-verification - same mutation-style building as accept.
        this._composers.set(2778, DeclineFriendMessageComposer);
        this._composers.set(546, FindNewFriendsMessageComposer);
        this._composers.set(3679, FriendListUpdateMessageComposer);
        this._composers.set(3797, GetFriendRequestsMessageComposer);
        this._composers.set(3219, GetRelationshipStatusInfoMessageComposer);
        this._composers.set(3686, HabboSearchMessageComposer);
        this._composers.set(3005, RemoveFriendMessageComposer);
        this._composers.set(1, RequestFriendMessageComposer);
        this._composers.set(617, SendRoomInviteMessageComposer);
        this._composers.set(1773, SetRelationshipStatusMessageComposer);

        // === USERS ===
        this._composers.set(1211, ApproveNameMessageComposer);
        this._composers.set(3706, ChangeEmailComposer);
        this._composers.set(306, DeselectFavouriteHabboGroupMessageComposer);
        this._composers.set(2306, GetEmailStatusComposer);
        this._composers.set(321, GetExtendedProfileByNameMessageComposer);
        this._composers.set(847, GetExtendedProfileMessageComposer);
        this._composers.set(1683, GetHabboGroupDetailsMessageComposer);
        this._composers.set(1026, GetIgnoredUsersMessageComposer);
        this._composers.set(3726, GetSelectedBadgesMessageComposer);
        this._composers.set(3642, GetUserNftChatStylesMessageComposer);
        this._composers.set(2070, IgnoreUserMessageComposer);
        this._composers.set(1469, JoinHabboGroupMessageComposer);
        this._composers.set(1111, ScrGetKickbackInfoMessageComposer);
        this._composers.set(1071, ScrGetUserInfoMessageComposer);
        this._composers.set(1887, SelectFavouriteHabboGroupMessageComposer);
        this._composers.set(2512, UnblockUserMessageComposer);
        this._composers.set(483, BlockUserMessageComposer);
        this._composers.set(798, BlockListInitComposer);
        this._composers.set(426, ReplenishRespectMessageComposer);
        this._composers.set(3542, UnignoreUserMessageComposer);

        // === CAMPAIGN ===
        this._composers.set(3643, OpenCampaignCalendarDoorComposer);
        this._composers.set(3863, OpenCampaignCalendarDoorAsStaffComposer);

        // === ADVERTISEMENT ===
        // NOTE: GetInterstitialMessageComposer had ID 3698 in win63 source, but that conflicts
        // with OpenPetPackageMessageComposer (also 3698). Removed to avoid collision.
        // GetInterstitialMessageComposer can be re-added with the correct ID if needed.
        this._composers.set(1408, InterstitialShownMessageComposer);

        // === PREFERENCES ===
        this._composers.set(3653, SetUIFlagsMessageComposer);
        this._composers.set(1276, SetNewNavigatorWindowPreferencesMessageComposer);

        // === ROOM ENGINE ===
        this._composers.set(1901, GetFurnitureAliasesMessageComposer);
        // TODO(AS3): header 1935 does not exist anywhere in the authoritative
        // composer registry (sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as
        // has exactly 581 _composers[N] entries; 1935 is not one of them), and no
        // zero-arg "get height map" request composer construction site could be
        // found via call-site tracing (this feature also has zero call sites in
        // the current TS port). Left unresolved rather than guessing a header.
        this._composers.set(1935, GetHeightMapMessageComposer);
        this._composers.set(2364, MoveAvatarMessageComposer);
        // TODO(AS3): header fixed to match sources/WIN63-202607011411-782849652 (_SafeCls_2135 via
        // HabboCatalog.as placement send), but field shape may also need re-verification - the
        // AS3 composer takes 6 params, the TS constructor only 4 (itemId, x, y, rotation).
        this._composers.set(1974, PlaceObjectMessageComposer);
        this._composers.set(1482, MoveObjectMessageComposer);
        // AS3: header corrected 443 -> 1919 (sources/WIN63-202607011411-782849652
        // unknowns/_SafePkg_2136/_SafeCls_3412.as, real construction confirmed at
        // com/sulake/habbo/room/_SafeCls_1821.as:2329 and _SafeCls_1984.as:316).
        // Header 443 there is the unrelated, readable ClickFurniMessageComposer.
        this._composers.set(1919, PickupObjectMessageComposer);

        // === ROOM CHAT ===
        this._composers.set(3034, ChatMessageComposer);
        this._composers.set(1763, ShoutMessageComposer);
        this._composers.set(1697, WhisperMessageComposer);
        this._composers.set(2106, StartTypingMessageComposer);
        this._composers.set(2718, CancelTypingMessageComposer);
        this._composers.set(3083, Game2GameChatMessageComposer);

        // === INVENTORY ===
        this._composers.set(41, RequestFurniInventoryComposer);
        this._composers.set(540, GetCreditsInfoComposer);
        this._composers.set(770, GetBadgesComposer);
        this._composers.set(2764, SetActivatedBadgesComposer);
        this._composers.set(3891, GetPetInventoryComposer);
        this._composers.set(3148, GetBotInventoryComposer);
        this._composers.set(3022, AvatarEffectActivatedComposer);
        this._composers.set(2362, AvatarEffectSelectedComposer);
        // TODO(AS3): header 699 is correct (sources/WIN63-202607011411-782849652
        // unknowns/_SafePkg_3364/_SafeCls_3363.as, real construction confirmed at
        // com/sulake/habbo/inventory/UnseenItemTracker.as:209), but the real
        // getMessageArray() sends only [category] - the TS composer's
        // (category, ...itemIds) shape sends extra fields the server never
        // receives from the real client. Low urgency: its only caller is
        // currently commented out in UnseenItemTracker.ts.
        this._composers.set(699, ResetUnseenItemsComposer);
        this._composers.set(3258, RequestABadgeComposer);

        // === LANDING VIEW ===
        this._composers.set(3152, GetPromoArticlesComposer);
        this._composers.set(2055, CommunityGoalVoteMessageComposer);

        // === CATALOG (bonus rare) ===
        this._composers.set(251, GetBonusRareInfoMessageComposer);
        this._composers.set(3682, GetLimitedOfferAppearingNextComposer);
        this._composers.set(287, GetCatalogPageWithEarliestExpiryComposer);
        this._composers.set(472, GetClubGiftMessageComposer);
        this._composers.set(2232, GetCatalogIndexComposer);
        this._composers.set(2093, GetCatalogPageComposer);
        this._composers.set(1692, GetProductOfferComposer);
        this._composers.set(1706, PurchaseFromCatalogComposer);
        this._composers.set(1739, BuildersClubQueryFurniCountMessageComposer);
        this._composers.set(2779, RedeemVoucherMessageComposer);
        this._composers.set(667, GetClubOffersMessageComposer);
        this._composers.set(2441, PurchaseVipMembershipExtensionComposer);
        this._composers.set(3561, PurchaseBasicMembershipExtensionComposer);
        this._composers.set(2087, SelectClubGiftComposer);
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as
        this._composers.set(780, GetMarketplaceConfigurationMessageComposer);
        this._composers.set(2731, GetMarketplaceOffersMessageComposer);
        this._composers.set(2086, GetMarketplaceOwnOffersMessageComposer);
        this._composers.set(831, CancelAllMarketplaceOffersMessageComposer);
        this._composers.set(1242, ClearOwnMarketplaceHistoryMessageComposer);
        this._composers.set(252, BuyMarketplaceOfferMessageComposer);
        this._composers.set(3546, RedeemMarketplaceOfferCreditsMessageComposer);
        this._composers.set(2096, CancelMarketplaceOfferMessageComposer);
        this._composers.set(1552, GetMarketplaceItemStatsComposer);
        this._composers.set(1246, GetRecyclerStatusMessageComposer);
        this._composers.set(2516, GetRecyclerPrizesMessageComposer);
        this._composers.set(2956, RecycleItemsMessageComposer);

        // === QUEST ===
        this._composers.set(2252, GetCommunityGoalHallOfFameMessageComposer);
        this._composers.set(397, GetDailyQuestMessageComposer);
        this._composers.set(555, ActivateQuestMessageComposer);
        this._composers.set(1221, CancelQuestMessageComposer);
        this._composers.set(1815, GetCommunityGoalProgressMessageComposer);
        this._composers.set(2167, GetConcurrentUsersGoalProgressMessageComposer);
        this._composers.set(2451, GetConcurrentUsersRewardMessageComposer);

        // === TALENT ===
        this._composers.set(3757, GetTalentTrackMessageComposer);

        // === COMPETITION ===
        this._composers.set(1503, GetCurrentTimingCodeMessageComposer);

        // === INVENTORY - TRADING ===
        this._composers.set(1865, OpenTradingComposer);
        this._composers.set(3639, CloseTradingComposer);
        this._composers.set(490, AcceptTradingComposer);
        this._composers.set(1030, UnacceptTradingComposer);
        this._composers.set(2662, ConfirmAcceptTradingComposer);
        this._composers.set(1217, ConfirmDeclineTradingComposer);
        this._composers.set(2177, AddItemToTradeComposer);
        this._composers.set(573, RemoveItemFromTradeComposer);

        // === INVENTORY - STAR GEMS / VAULT / REWARD ===
        // TODO(AS3): GiveStarGemToUserMessageComposer has no entry in the authoritative revision
        // (sources/WIN63-202607011411-782849652) - no registry entry traceable, no construction
        // call site, and SessionDataManager.as there has no giveStarGem() at all (the TS port's
        // trace comment points at a win63_version member that does not exist either). Left
        // unregistered so sending it warns-and-drops instead of colliding with
        // ScrGetKickbackInfoMessageComposer's real header (1111).
        // this._composers.set(1111, GiveStarGemToUserMessageComposer);
        this._composers.set(1645, CreditVaultStatusMessageComposer);
        this._composers.set(1105, WithdrawCreditVaultMessageComposer);
        this._composers.set(3417, IncomeRewardStatusMessageComposer);
        this._composers.set(809, IncomeRewardClaimMessageComposer);

        // === NUX ===
        this._composers.set(2048, NewUserExperienceScriptProceedComposer);

        // === ROOM SETTINGS ===
        this._composers.set(256, GetRoomSettingsMessageComposer);
        this._composers.set(725, SaveRoomSettingsMessageComposer);
        this._composers.set(342, GetFlatControllersMessageComposer);
        this._composers.set(2702, GetBannedUsersFromRoomMessageComposer);
        this._composers.set(701, DeleteRoomMessageComposer);
        this._composers.set(159, RemoveAllRightsMessageComposer);
        this._composers.set(2804, UnbanUserFromRoomMessageComposer);
    }
}
