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
import {BonusRareInfoMessageEvent, BuildersClubSubscriptionStatusMessageEvent,} from './messages/incoming/catalog';

// Incoming Events - Landing View
import {PromoArticlesMessageEvent,} from './messages/incoming/landingview';

// Incoming Events - Quest (hall of fame)
import {CommunityGoalHallOfFameMessageEvent,} from './messages/incoming/quest';

// Incoming Events - Room Session
import {
	CantConnectMessageEvent,
	CloseConnectionMessageEvent,
	FlatAccessibleMessageEvent,
	GamePlayerValueMessageEvent,
	HanditemConfigurationMessageEvent,
	OpenConnectionMessageEvent,
	RoomQueueStatusMessageEvent,
	RoomForwardMessageEvent,
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
	RoomDimmerPresetsMessageEvent,
} from './messages/incoming/room/furniture';

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
import {ChangeUserNameResultMessageEvent, UserNameChangedMessageEvent,} from './messages/incoming/help';

// Incoming Events - Error
import {ErrorReportEvent} from './messages/incoming/error';

// Incoming Events - Users
import {
	ApproveNameMessageEvent,
	BlockListMessageEvent,
	BlockUserUpdateMessageEvent,
	ChangeEmailResultEvent,
	EmailStatusResultEvent,
	GroupDetailsChangedMessageEvent,
	ExtendedProfileChangedMessageEvent,
	ExtendedProfileMessageEvent,
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
	CreditFurniRedeemMessageComposer,
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
	HarvestPetComposer,
	MountPetComposer,
	PickUpPetComposer,
	RemoveSaddleFromPetComposer,
	TogglePetBreedingPermissionComposer,
	TogglePetRidingPermissionComposer,
	UseProductForPetComposer,
} from './messages/outgoing/room/pet';

// Outgoing Composers - Poll
import {PollAnswerComposer, PollRejectComposer, PollStartComposer,} from './messages/outgoing/poll';

// Outgoing Composers - Landing View
import {GetPromoArticlesComposer,} from './messages/outgoing/landingview';

// Outgoing Composers - Catalog
import {GetBonusRareInfoMessageComposer,} from './messages/outgoing/catalog';

// Outgoing Composers - Quest (hall of fame)
import {GetCommunityGoalHallOfFameMessageComposer,} from './messages/outgoing/quest';

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
	GiveStarGemToUserMessageComposer,
	IncomeRewardClaimMessageComposer,
	IncomeRewardStatusMessageComposer,
	OpenTradingComposer,
	RemoveItemFromTradeComposer,
	RequestFurniInventoryComposer,
	ResetUnseenItemsComposer,
	SetActivatedBadgesComposer,
	UnacceptTradingComposer,
	WithdrawCreditVaultMessageComposer,
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
		this._events.set(2334, InitDiffieHandshakeMessageEvent);
		this._events.set(3034, CompleteDiffieHandshakeMessageEvent);
		this._events.set(3014, AuthenticationOKMessageEvent);
		this._events.set(836, UniqueMachineIdMessageEvent);
		this._events.set(4000, DisconnectReasonMessageEvent);
		this._events.set(2585, IdentityAccountsEvent);

		// === SESSION ===
		this._events.set(2449, PingMessageEvent);
		this._events.set(195, GenericErrorMessageEvent);
		this._events.set(3337, UserRightsMessageEvent);
		this._events.set(2305, UserObjectMessageEvent);
		this._events.set(782, NoobnessLevelMessageEvent);

		// === AVAILABILITY ===
		this._events.set(995, AvailabilityStatusMessageEvent);
		this._events.set(2761, LoginFailedHotelClosedMessageEvent);
		this._events.set(184, MaintenanceStatusMessageEvent);

		// === AVATAR ===
		this._events.set(744, FigureUpdateMessageEvent);

		// === NAVIGATOR ===
		this._events.set(3969, NavigatorSettingsMessageEvent);
		this._events.set(1338, FavouritesMessageEvent);
		this._events.set(3796, FavouriteChangedMessageEvent);
		this._events.set(2582, GetGuestRoomResultMessageEvent);
		this._events.set(1265, GuestRoomSearchResultMessageEvent);
		this._events.set(2202, UserFlatCatsMessageEvent);
		this._events.set(2544, UserEventCatsMessageEvent);
		this._events.set(1475, PopularRoomTagsResultMessageEvent);
		this._events.set(1458, OfficialRoomsMessageEvent);
		this._events.set(563, CategoriesWithVisitorCountMessageEvent);
		this._events.set(3592, CanCreateRoomMessageEvent);
		this._events.set(1497, CanCreateRoomEventMessageEvent);
		this._events.set(2700, FlatCreatedMessageEvent);
		this._events.set(989, RoomRatingMessageEvent);
		this._events.set(1999, RoomInfoUpdatedMessageEvent);
		this._events.set(2505, DoorbellMessageEvent);
		this._events.set(481, RoomEventMessageEvent);
		this._events.set(2529, RoomEventCancelMessageEvent);
		this._events.set(2007, FlatAccessDeniedMessageEvent);
		this._events.set(3521, ConvertedRoomIdMessageEvent);
		this._events.set(1954, CompetitionRoomsDataMessageEvent);

		// === NOTIFICATIONS ===
		this._events.set(1368, ActivityPointsMessageEvent);
		this._events.set(2196, InfoFeedEnableMessageEvent);

		// === INVENTORY ===
		this._events.set(118, CreditBalanceEvent);
		this._events.set(2302, FigureSetIdsMessageEvent);
		this._events.set(1625, AchievementsScoreMessageEvent);
		this._events.set(2475, AvatarEffectsMessageEvent);

		// === INVENTORY - FURNI ===
		this._events.set(227, FurniListMessageEvent);
		this._events.set(1319, FurniListAddOrUpdateMessageEvent);
		this._events.set(2763, FurniListRemoveMessageEvent);
		this._events.set(3790, FurniListInvalidateMessageEvent);

		// === INVENTORY - BADGES ===
		this._events.set(1091, BadgesMessageEvent);

		// === INVENTORY - PETS ===
		this._events.set(3259, PetInventoryMessageEvent);

		// === INVENTORY - BOTS ===
		this._events.set(2902, BotInventoryMessageEvent);

		// === INVENTORY - TRADING ===
		this._events.set(536, TradingOpenMessageEvent);
		this._events.set(1088, TradingCloseMessageEvent);
		this._events.set(996, TradingAcceptMessageEvent);
		this._events.set(1183, TradingItemListMessageEvent);
		this._events.set(3207, TradingCompletedMessageEvent);
		this._events.set(2595, TradingConfirmationMessageEvent);
		this._events.set(2498, TradingNotOpenMessageEvent);

		// === INVENTORY - UNSEEN ===
		this._events.set(748, UnseenItemsMessageEvent);

		// === MYSTERY BOX ===
		this._events.set(1646, MysteryBoxKeysMessageEvent);

		// === CATALOG ===
		this._events.set(1325, BuildersClubSubscriptionStatusMessageEvent);

		// === HANDSHAKE (continued) ===
		this._events.set(2149, IsFirstLoginOfDayMessageEvent);

		// === NEW NAVIGATOR ===
		this._events.set(2004, NavigatorMetaDataMessageEvent);
		this._events.set(3002, NavigatorSearchResultSetMessageEvent);
		this._events.set(866, NavigatorSavedSearchesMessageEvent);
		this._events.set(386, NavigatorLiftedRoomsMessageEvent);
		this._events.set(3826, NavigatorCollapsedCategoriesMessageEvent);
		this._events.set(3183, NavigatorWindowSettingsMessageEvent);

		// === ROOM SESSION ===
		this._events.set(2244, RoomReadyMessageEvent);
		this._events.set(1915, OpenConnectionMessageEvent);
		this._events.set(3731, FlatAccessibleMessageEvent);
		this._events.set(3241, CloseConnectionMessageEvent);
		this._events.set(1111, RoomQueueStatusMessageEvent);
		this._events.set(3216, YouAreSpectatorMessageEvent);
		this._events.set(1856, YouAreNotSpectatorMessageEvent);
		this._events.set(3768, HanditemConfigurationMessageEvent);
		this._events.set(3678, RoomForwardMessageEvent);
		this._events.set(2309, GamePlayerValueMessageEvent);
		this._events.set(677, YouArePlayingGameMessageEvent);
		this._events.set(671, CantConnectMessageEvent);

		// === ROOM PERMISSIONS ===
		this._events.set(168, YouAreControllerMessageEvent);
		this._events.set(3352, YouAreNotControllerMessageEvent);
		this._events.set(2791, YouAreOwnerMessageEvent);

		// === ROOM ENGINE ===
		this._events.set(2724, FloorHeightMapMessageEvent);
		this._events.set(234, FurnitureAliasesMessageEvent);
		this._events.set(1721, HeightMapMessageEvent);
		this._events.set(3175, HeightMapUpdateMessageEvent);
		this._events.set(2777, RoomEntryTileMessageEvent);
		this._events.set(1120, RoomEntryInfoMessageEvent);
		this._events.set(3997, ObjectsMessageEvent);
		this._events.set(3829, ObjectAddMessageEvent);
		this._events.set(970, ObjectUpdateMessageEvent);
		this._events.set(2963, ObjectRemoveMessageEvent);
		this._events.set(391, ObjectDataUpdateMessageEvent);
		this._events.set(3255, ItemsMessageEvent);
		this._events.set(2579, ItemAddMessageEvent);
		this._events.set(934, ItemUpdateMessageEvent);
		this._events.set(1903, ItemRemoveMessageEvent);
		this._events.set(1835, UsersMessageEvent);
		this._events.set(534, UserUpdateMessageEvent);
		this._events.set(833, UserRemoveMessageEvent);
		this._events.set(369, SlideObjectBundleMessageEvent);

		// === ROOM CHAT ===
		this._events.set(1264, ChatMessageEvent);
		this._events.set(3310, ShoutMessageEvent);
		this._events.set(492, WhisperMessageEvent);
		this._events.set(2514, UserTypingMessageEvent);

		// === ROOM ACTION ===
		this._events.set(1783, ExpressionMessageEvent);
		this._events.set(2910, DanceMessageEvent);
		this._events.set(2555, AvatarEffectMessageEvent);
		this._events.set(3524, SleepMessageEvent);
		this._events.set(1104, CarryObjectMessageEvent);
		this._events.set(2833, UseObjectMessageEvent);
		this._events.set(3173, UserChangeMessageEvent);

		// === ROOM FURNITURE ===
		this._events.set(2355, RoomDimmerPresetsMessageEvent);
		this._events.set(3064, PresentOpenedMessageEvent);
		this._events.set(1428, OpenPetPackageRequestedMessageEvent);
		this._events.set(3835, OpenPetPackageResultMessageEvent);

		// === USERS ===
		this._events.set(3923, ApproveNameMessageEvent);
		this._events.set(3375, ChangeEmailResultEvent);
		this._events.set(1995, HabboGroupBadgesMessageEvent);
		this._events.set(3676, HabboGroupDetailsMessageEvent);
		this._events.set(894, GroupDetailsChangedMessageEvent);
		this._events.set(3237, HabboGroupDeactivatedMessageEvent);
		this._events.set(2243, HabboGroupJoinFailedMessageEvent);
		this._events.set(1968, HabboUserBadgesMessageEvent);
		this._events.set(2144, HandItemReceivedMessageEvent);
		this._events.set(3096, InClientLinkMessageEvent);
		this._events.set(2920, ExtendedProfileMessageEvent);
		this._events.set(2051, ExtendedProfileChangedMessageEvent);
		this._events.set(3841, RelationshipStatusInfoEvent);
		this._events.set(105, ScrSendKickbackInfoMessageEvent);
		this._events.set(1114, ScrSendUserInfoEvent);
		this._events.set(3401, EmailStatusResultEvent);
		this._events.set(2293, IgnoreResultMessageEvent);
		this._events.set(2499, IgnoredUsersMessageEvent);
		this._events.set(214, BlockListMessageEvent);
		this._events.set(219, BlockUserUpdateMessageEvent);

		// === HELP (name change) ===
		this._events.set(906, UserNameChangedMessageEvent);
		this._events.set(679, ChangeUserNameResultMessageEvent);

		// === PREFERENCES ===
		this._events.set(2082, AccountPreferencesEvent);

		// === PERK ===
		this._events.set(2000, PerkAllowancesMessageEvent);

		// === NFT ===
		this._events.set(3709, UserNftChatStylesMessageEvent);
		this._events.set(2255, UserPurchasableChatStylesMessageEvent);
		this._events.set(2894, UserPurchasableChatStyleChangedMessageEvent);

		// === CAMPAIGN ===
		this._events.set(1854, CampaignCalendarDataMessageEvent);
		this._events.set(789, CampaignCalendarDoorOpenedMessageEvent);

		// === ADVERTISEMENT ===
		this._events.set(2727, InterstitialMessageEvent);
		this._events.set(2247, RoomAdErrorMessageEvent);

		// === TRACKING ===
		this._events.set(1084, LatencyPingResponseMessageEvent);

		// === FRIENDLIST / MESSENGER ===
		this._events.set(1680, MessengerInitEvent);
		this._events.set(2536, NewConsoleMessageEvent);
		this._events.set(2760, ConsoleMessageHistoryEvent);
		this._events.set(3235, InstantMessageErrorEvent);
		this._events.set(3487, MessengerErrorEvent);
		this._events.set(3819, RoomInviteEvent);
		this._events.set(1375, FriendListFragmentMessageEvent);
		this._events.set(1570, FriendListUpdateMessageEvent);
		this._events.set(3968, FriendRequestsMessageEvent);
		this._events.set(1515, NewFriendRequestMessageEvent);
		this._events.set(3407, AcceptFriendResultMessageEvent);
		this._events.set(3122, FriendNotificationMessageEvent);
		this._events.set(2105, FindFriendsProcessResultMessageEvent);
		this._events.set(252, HabboSearchResultMessageEvent);
		this._events.set(1799, FollowFriendFailedMessageEvent);
		this._events.set(3744, RoomInviteErrorMessageEvent);

		// === NOTIFICATIONS (extended) ===
		this._events.set(3873, MOTDNotificationEvent);
		this._events.set(3555, HabboBroadcastMessageEvent);
		// AS3: sources/win63_version/habbo/communication/class_1881.as — name_1[2806] = ElementPointerMessageEvent
		this._events.set(2806, ElementPointerMessageEvent);
		this._events.set(2281, ModeratorMessageEvent);
		this._events.set(1702, NotificationDialogMessageEvent);
		this._events.set(486, RespectNotificationMessageEvent);
		this._events.set(2888, PetLevelNotificationEvent);
		this._events.set(1656, HabboAchievementNotificationMessageEvent);
		this._events.set(2974, InfoHotelClosingMessageEvent);
		this._events.set(3338, InfoHotelClosedMessageEvent);
		this._events.set(1246, UserBannedMessageEvent);
		this._events.set(555, ModeratorCautionEvent);
		this._events.set(1891, ClubGiftNotificationEvent);
		this._events.set(1802, RestoreClientMessageEvent);
		this._events.set(2981, AccountSafetyLockStatusChangeMessageEvent);
		this._events.set(337, PetReceivedMessageEvent);
		this._events.set(3340, PetRespectFailedEvent);
		this._events.set(2652, PetRespectNotificationEvent);
		this._events.set(2829, ClubGiftSelectedEvent);
		this._events.set(160, RoomMessageNotificationMessageEvent);

		// === POLL / WORD QUIZ ===
		this._events.set(2078, PollOfferEvent);
		this._events.set(2085, PollErrorEvent);
		this._events.set(1808, PollContentsEvent);
		this._events.set(18, QuestionEvent);
		this._events.set(1073, QuestionAnsweredEvent);
		this._events.set(1219, QuestionFinishedEvent);

		// === ERROR ===
		this._events.set(1790, ErrorReportEvent);

		// === LANDING VIEW ===
		this._events.set(1655, PromoArticlesMessageEvent);

		// === CATALOG (bonus rare) ===
		this._events.set(1984, BonusRareInfoMessageEvent);

		// === QUEST (hall of fame) ===
		this._events.set(2134, CommunityGoalHallOfFameMessageEvent);

		// === ROOM SETTINGS ===
		this._events.set(1028, RoomSettingsDataEvent);
		this._events.set(302, FlatControllersEvent);
		this._events.set(3879, BannedUsersFromRoomEvent);
		this._events.set(2965, FlatControllerAddedEvent);
		this._events.set(2423, FlatControllerRemovedEvent);
		this._events.set(2631, RoomSettingsSavedEvent);
		this._events.set(31, RoomSettingsSaveErrorEvent);
		this._events.set(1024, UserUnbannedFromRoomEvent);
		this._events.set(2648, ShowEnforceRoomCategoryDialogEvent);
	}

	/**
	 * Register outgoing message composers (Client -> Server)
	 */
	private registerComposers(): void
	{
		// === HANDSHAKE ===
		this._composers.set(4000, ClientHelloMessageComposer);
		this._composers.set(3644, InitDiffieHandshakeMessageComposer);
		this._composers.set(1517, CompleteDiffieHandshakeMessageComposer);
		this._composers.set(3517, VersionCheckMessageComposer);
		this._composers.set(749, SSOTicketMessageComposer);
		this._composers.set(2920, UniqueIDMessageComposer);

		// === SESSION ===
		this._composers.set(2134, PongMessageComposer);
		this._composers.set(1863, DisconnectMessageComposer);
		this._composers.set(3241, InfoRetrieveMessageComposer);

		// === TRACKING ===
		this._composers.set(849, EventLogMessageComposer);

		// === NAVIGATOR ===
		this._composers.set(2758, GetGuestRoomMessageComposer);
		this._composers.set(1737, CreateFlatMessageComposer);
		this._composers.set(2303, AddFavouriteRoomMessageComposer);
		this._composers.set(3492, DeleteFavouriteRoomMessageComposer);
		this._composers.set(3372, RoomTextSearchMessageComposer);
		this._composers.set(1820, PopularRoomsSearchMessageComposer);
		this._composers.set(2356, MyRoomsSearchMessageComposer);
		this._composers.set(1076, MyFavouriteRoomsSearchMessageComposer);
		this._composers.set(2092, GetOfficialRoomsMessageComposer);
		this._composers.set(2897, CanCreateRoomMessageComposer);
		this._composers.set(3381, GetUserFlatCatsMessageComposer);
		this._composers.set(1679, GetUserEventCatsMessageComposer);
		this._composers.set(2213, UpdateHomeRoomMessageComposer);
		this._composers.set(1569, RateFlatMessageComposer);
		this._composers.set(1828, ToggleStaffPickMessageComposer);
		this._composers.set(1014, GetPopularRoomTagsMessageComposer);
		this._composers.set(3973, MyFriendsRoomsSearchMessageComposer);
		this._composers.set(282, ForwardToSomeRoomMessageComposer);
		this._composers.set(1474, ConvertGlobalRoomIdMessageComposer);
		this._composers.set(3860, CancelEventMessageComposer);
		this._composers.set(289, EditEventMessageComposer);
		this._composers.set(2683, CompetitionRoomsSearchMessageComposer);
		this._composers.set(3451, RoomsWithHighestScoreSearchMessageComposer);
		this._composers.set(2551, RoomsWhereMyFriendsAreSearchMessageComposer);
		this._composers.set(2018, MyRoomHistorySearchMessageComposer);
		this._composers.set(1131, MyFrequentRoomHistorySearchMessageComposer);
		this._composers.set(2382, MyRoomRightsSearchMessageComposer);
		this._composers.set(3143, MyGuildBasesSearchMessageComposer);
		this._composers.set(3960, MyRecommendedRoomsMessageComposer);
		this._composers.set(2573, GuildBaseSearchMessageComposer);
		this._composers.set(2774, SetRoomSessionTagsMessageComposer);
		this._composers.set(3877, RoomAdSearchMessageComposer);
		this._composers.set(3543, RemoveOwnRoomRightsRoomMessageComposer);
		this._composers.set(1774, RoomAdEventTabAdClickedComposer);
		this._composers.set(2865, RoomAdEventTabViewedComposer);

		// === NEW NAVIGATOR ===
		this._composers.set(823, NewNavigatorInitComposer);
		this._composers.set(1150, NewNavigatorSearchComposer);
		this._composers.set(2525, NavigatorAddSavedSearchComposer);
		this._composers.set(214, NavigatorDeleteSavedSearchComposer);
		this._composers.set(3069, NavigatorAddCollapsedCategoryMessageComposer);
		this._composers.set(3308, NavigatorRemoveCollapsedCategoryMessageComposer);
		this._composers.set(2852, NavigatorSetSearchCodeViewModeMessageComposer);

		// === ROOM SESSION ===
		this._composers.set(329, OpenFlatConnectionMessageComposer);
		this._composers.set(1047, ChangeQueueMessageComposer);
		this._composers.set(2722, QuitMessageComposer);
		this._composers.set(2407, RoomNetworkOpenConnectionMessageComposer);

		// === ROOM AVATAR ===
		this._composers.set(3706, ChangeMottoMessageComposer);
		this._composers.set(3447, AvatarExpressionMessageComposer);
		this._composers.set(524, SignMessageComposer);
		this._composers.set(3420, DanceMessageComposer);
		this._composers.set(3927, ChangePostureMessageComposer);

		// === ROOM ACTION ===
		this._composers.set(197, AmbassadorAlertMessageComposer);
		this._composers.set(906, KickUserMessageComposer);
		this._composers.set(1702, BanUserWithDurationMessageComposer);
		this._composers.set(2706, MuteUserMessageComposer);
		this._composers.set(2818, MuteAllInRoomComposer);
		this._composers.set(3628, UnmuteUserMessageComposer);
		this._composers.set(3149, UpdateRoomCategoryAndTradeSettingsComposer);
		this._composers.set(1967, UpdateRoomFilterMessageComposer);
		this._composers.set(3264, GetCustomRoomFilterMessageComposer);
		this._composers.set(355, AssignRightsMessageComposer);
		this._composers.set(2976, RemoveRightsMessageComposer);
		this._composers.set(732, LetUserInMessageComposer);

		// === ROOM RESPECT ===
		this._composers.set(3377, RespectUserMessageComposer);
		this._composers.set(1841, RespectPetMessageComposer);

		// === ROOM FURNITURE ===
		this._composers.set(2243, CreditFurniRedeemMessageComposer);
		this._composers.set(2358, PresentOpenMessageComposer);
		this._composers.set(760, OpenPetPackageMessageComposer);
		this._composers.set(2813, RoomDimmerGetPresetsComposer);
		this._composers.set(1648, RoomDimmerSavePresetComposer);
		this._composers.set(2296, RoomDimmerChangeStateComposer);
		this._composers.set(924, UpdateClothingChangeFurnitureComposer);
		this._composers.set(1675, UseFurnitureMessageComposer);

		// === ROOM PET ===
		this._composers.set(1581, PickUpPetComposer);
		this._composers.set(1036, MountPetComposer); // Also used for dismount (same ID, server toggles)
		this._composers.set(3575, TogglePetRidingPermissionComposer);
		this._composers.set(186, RemoveSaddleFromPetComposer);
		this._composers.set(2161, GetPetCommandsComposer);
		this._composers.set(1521, HarvestPetComposer);
		this._composers.set(3379, TogglePetBreedingPermissionComposer);
		this._composers.set(856, CompostPlantComposer);
		this._composers.set(3202, UseProductForPetComposer);

		// === POLL ===
		this._composers.set(1773, PollStartComposer);
		this._composers.set(3929, PollRejectComposer);
		this._composers.set(706, PollAnswerComposer);

		// === NOTIFICATIONS ===
		this._composers.set(3990, GetMOTDMessageComposer);

		// === TRACKING ===
		this._composers.set(1242, LatencyPingRequestMessageComposer);
		this._composers.set(3636, LatencyPingReportMessageComposer);
		this._composers.set(879, LagWarningReportMessageComposer);
		this._composers.set(1536, PerformanceLogMessageComposer);

		// === FRIENDLIST ===
		this._composers.set(1946, VisitUserMessageComposer);
		this._composers.set(253, SendMsgMessageComposer);
		this._composers.set(799, GetMessengerHistoryComposer);
		this._composers.set(2681, FollowFriendMessageComposer);
		this._composers.set(472, MessengerInitMessageComposer);
		this._composers.set(3207, AcceptFriendMessageComposer);
		this._composers.set(505, DeclineFriendMessageComposer);
		this._composers.set(2602, FindNewFriendsMessageComposer);
		this._composers.set(1399, FriendListUpdateMessageComposer);
		this._composers.set(406, GetFriendRequestsMessageComposer);
		this._composers.set(1035, GetRelationshipStatusInfoMessageComposer);
		this._composers.set(3936, HabboSearchMessageComposer);
		this._composers.set(3231, RemoveFriendMessageComposer);
		this._composers.set(2219, RequestFriendMessageComposer);
		this._composers.set(2352, SendRoomInviteMessageComposer);
		this._composers.set(2875, SetRelationshipStatusMessageComposer);

		// === USERS ===
		this._composers.set(683, ApproveNameMessageComposer);
		this._composers.set(1961, ChangeEmailComposer);
		this._composers.set(948, DeselectFavouriteHabboGroupMessageComposer);
		this._composers.set(3225, GetEmailStatusComposer);
		this._composers.set(2167, GetExtendedProfileByNameMessageComposer);
		this._composers.set(3859, GetHabboGroupDetailsMessageComposer);
		this._composers.set(2077, GetIgnoredUsersMessageComposer);
		this._composers.set(2316, GetSelectedBadgesMessageComposer);
		this._composers.set(1024, GetUserNftChatStylesMessageComposer);
		this._composers.set(3182, IgnoreUserMessageComposer);
		this._composers.set(3718, JoinHabboGroupMessageComposer);
		this._composers.set(3438, ScrGetKickbackInfoMessageComposer);
		this._composers.set(2791, ScrGetUserInfoMessageComposer);
		this._composers.set(773, SelectFavouriteHabboGroupMessageComposer);
		this._composers.set(1231, UnblockUserMessageComposer);
		this._composers.set(2371, BlockUserMessageComposer);
		this._composers.set(2610, BlockListInitComposer);
		this._composers.set(3323, ReplenishRespectMessageComposer);
		this._composers.set(3762, UnignoreUserMessageComposer);

		// === CAMPAIGN ===
		this._composers.set(2558, OpenCampaignCalendarDoorComposer);
		this._composers.set(2725, OpenCampaignCalendarDoorAsStaffComposer);

		// === ADVERTISEMENT ===
		// NOTE: GetInterstitialMessageComposer had ID 3698 in win63 source, but that conflicts
		// with OpenPetPackageMessageComposer (also 3698). Removed to avoid collision.
		// GetInterstitialMessageComposer can be re-added with the correct ID if needed.
		this._composers.set(3230, InterstitialShownMessageComposer);

		// === PREFERENCES ===
		this._composers.set(3260, SetUIFlagsMessageComposer);
		this._composers.set(3474, SetNewNavigatorWindowPreferencesMessageComposer);

		// === ROOM ENGINE ===
		this._composers.set(205, GetFurnitureAliasesMessageComposer);
		this._composers.set(1935, GetHeightMapMessageComposer);
		this._composers.set(144, MoveAvatarMessageComposer);

		// === ROOM CHAT ===
		this._composers.set(641, ChatMessageComposer);
		this._composers.set(2286, ShoutMessageComposer);
		this._composers.set(2317, WhisperMessageComposer);
		this._composers.set(2678, StartTypingMessageComposer);
		this._composers.set(3878, CancelTypingMessageComposer);
		this._composers.set(521, Game2GameChatMessageComposer);

		// === INVENTORY ===
		this._composers.set(3164, RequestFurniInventoryComposer);
		this._composers.set(3703, GetCreditsInfoComposer);
		this._composers.set(3616, GetBadgesComposer);
		this._composers.set(2073, SetActivatedBadgesComposer);
		this._composers.set(580, GetPetInventoryComposer);
		this._composers.set(3773, GetBotInventoryComposer);
		this._composers.set(2862, AvatarEffectActivatedComposer);
		this._composers.set(1253, AvatarEffectSelectedComposer);
		this._composers.set(3837, ResetUnseenItemsComposer);

		// === LANDING VIEW ===
		this._composers.set(1827, GetPromoArticlesComposer);

		// === CATALOG (bonus rare) ===
		this._composers.set(957, GetBonusRareInfoMessageComposer);

		// === QUEST (hall of fame) ===
		this._composers.set(1034, GetCommunityGoalHallOfFameMessageComposer);

		// === INVENTORY - TRADING ===
		this._composers.set(3123, OpenTradingComposer);
		this._composers.set(333, CloseTradingComposer);
		this._composers.set(2921, AcceptTradingComposer);
		this._composers.set(2563, UnacceptTradingComposer);
		this._composers.set(1781, ConfirmAcceptTradingComposer);
		this._composers.set(450, ConfirmDeclineTradingComposer);
		this._composers.set(1608, AddItemToTradeComposer);
		this._composers.set(395, RemoveItemFromTradeComposer);

		// === INVENTORY - STAR GEMS / VAULT / REWARD ===
		this._composers.set(1111, GiveStarGemToUserMessageComposer);
		this._composers.set(2482, CreditVaultStatusMessageComposer);
		this._composers.set(890, WithdrawCreditVaultMessageComposer);
		this._composers.set(1814, IncomeRewardStatusMessageComposer);
		this._composers.set(431, IncomeRewardClaimMessageComposer);

		// === NUX ===
		this._composers.set(470, NewUserExperienceScriptProceedComposer);

		// === ROOM SETTINGS ===
		this._composers.set(514, GetRoomSettingsMessageComposer);
		this._composers.set(971, SaveRoomSettingsMessageComposer);
		this._composers.set(69, GetFlatControllersMessageComposer);
		this._composers.set(984, GetBannedUsersFromRoomMessageComposer);
		this._composers.set(2151, DeleteRoomMessageComposer);
		this._composers.set(1560, RemoveAllRightsMessageComposer);
		this._composers.set(1744, UnbanUserFromRoomMessageComposer);
	}
}
