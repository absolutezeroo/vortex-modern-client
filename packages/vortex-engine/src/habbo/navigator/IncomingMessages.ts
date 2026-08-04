import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {HabboNavigator} from './HabboNavigator';
import type {NavigatorData} from './domain';
import {Logger} from '@core/utils/Logger';

// Message events
import {UserObjectMessageEvent} from '../communication/messages/incoming/handshake/UserObjectMessageEvent';
import {
    BannedUsersFromRoomEvent,
    FlatControllerAddedEvent,
    FlatControllerRemovedEvent,
    FlatControllersEvent,
    RoomSettingsDataEvent,
    RoomSettingsSaveErrorEvent,
    ShowEnforceRoomCategoryDialogEvent,
    UserUnbannedFromRoomEvent,
} from '../communication/messages/incoming/roomsettings';
import type {
    BannedUsersFromRoomEventParser,
    FlatControllerAddedEventParser,
    FlatControllerRemovedEventParser,
    FlatControllersEventParser,
    RoomSettingsDataEventParser,
    RoomSettingsSaveErrorEventParser,
    ShowEnforceRoomCategoryDialogEventParser,
    UserUnbannedFromRoomEventParser,
} from '../communication/messages/parser/roomsettings';
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
} from '../communication/messages/incoming/navigator';

// Parsers
import type {
    CanCreateRoomEventMessageParser,
    CanCreateRoomMessageParser,
    CategoriesWithVisitorCountMessageParser,
    CompetitionRoomsDataMessageParser,
    ConvertedRoomIdMessageParser,
    DoorbellMessageParser,
    FavouriteChangedMessageParser,
    FavouritesMessageParser,
    FlatAccessDeniedMessageParser,
    FlatCreatedMessageParser,
    GetGuestRoomResultMessageParser,
    GuestRoomSearchResultMessageParser,
    NavigatorSettingsMessageParser,
    OfficialRoomsMessageParser,
    PopularRoomTagsResultMessageParser,
    RoomEventMessageParser,
    RoomInfoUpdatedMessageParser,
    RoomRatingMessageParser,
    UserEventCatsMessageParser,
    UserFlatCatsMessageParser,
} from '../communication/messages/parser/navigator';
import type {UserObjectMessageParser} from '../communication/messages/parser/handshake/UserObjectMessageParser';

import {
    GetUserEventCatsMessageComposer,
    GetUserFlatCatsMessageComposer,
} from '../communication/messages/outgoing/navigator';

const log = Logger.getLogger('habbo.navigator.IncomingMessages');

/**
 * Handles incoming navigator messages
 *
 */
export class IncomingMessages
{
    private _navigator: HabboNavigator;
    private _messageEvents: IMessageEvent[] = [];

    constructor(navigator: HabboNavigator)
    {
        this._navigator = navigator;

        this.registerEvents();
    }

    get data(): NavigatorData
    {
        return this._navigator.data;
    }

    dispose(): void
    {
        for(const event of this._messageEvents)
        {
            this._navigator.communication.removeMessageEvent(event);
        }

        this._messageEvents = [];
    }

    private registerEvents(): void
    {
        // Settings & Favourites
        // Room settings. AS3 registers these in the navigator's own incoming-messages class
        // (_SafeCls_1951.as lines 120-121/134 and the flat-controller/ban block) and routes
        // each to roomSettingsCtrl. None of them were subscribed here, so RoomSettingsCtrl —
        // complete, and holding every handler below — never heard a single reply: clicking
        // "room settings" sent GetRoomSettings (256) and nothing ever came back to open the
        // window. Room filter opened fine precisely because it needs no round trip.
        this.addMessageEvent(new RoomSettingsDataEvent(this.onRoomSettingsData.bind(this)));
        this.addMessageEvent(new RoomSettingsSaveErrorEvent(this.onRoomSettingsSaveError.bind(this)));
        this.addMessageEvent(new FlatControllersEvent(this.onFlatControllers.bind(this)));
        this.addMessageEvent(new FlatControllerAddedEvent(this.onFlatControllerAdded.bind(this)));
        this.addMessageEvent(new FlatControllerRemovedEvent(this.onFlatControllerRemoved.bind(this)));
        this.addMessageEvent(new BannedUsersFromRoomEvent(this.onBannedUsersFromRoom.bind(this)));
        this.addMessageEvent(new UserUnbannedFromRoomEvent(this.onUserUnbannedFromRoom.bind(this)));
        this.addMessageEvent(new ShowEnforceRoomCategoryDialogEvent(this.onEnforceRoomCategorySelection.bind(this)));

        this.addMessageEvent(new NavigatorSettingsMessageEvent(this.onNavigatorSettings.bind(this)));
        this.addMessageEvent(new FavouritesMessageEvent(this.onFavourites.bind(this)));
        this.addMessageEvent(new FavouriteChangedMessageEvent(this.onFavouriteChanged.bind(this)));

        // Room info
        this.addMessageEvent(new GetGuestRoomResultMessageEvent(this.onGetGuestRoomResult.bind(this)));
        this.addMessageEvent(new RoomInfoUpdatedMessageEvent(this.onRoomInfoUpdated.bind(this)));
        this.addMessageEvent(new RoomRatingMessageEvent(this.onRoomRating.bind(this)));

        // Search results
        this.addMessageEvent(new GuestRoomSearchResultMessageEvent(this.onGuestRoomSearchResult.bind(this)));
        this.addMessageEvent(new PopularRoomTagsResultMessageEvent(this.onPopularRoomTagsResult.bind(this)));
        this.addMessageEvent(new OfficialRoomsMessageEvent(this.onOfficialRooms.bind(this)));
        this.addMessageEvent(new CategoriesWithVisitorCountMessageEvent(this.onCategoriesWithVisitorCount.bind(this)));

        // Categories
        this.addMessageEvent(new UserFlatCatsMessageEvent(this.onUserFlatCats.bind(this)));
        this.addMessageEvent(new UserEventCatsMessageEvent(this.onUserEventCats.bind(this)));

        // Room creation
        this.addMessageEvent(new CanCreateRoomMessageEvent(this.onCanCreateRoom.bind(this)));
        this.addMessageEvent(new CanCreateRoomEventMessageEvent(this.onCanCreateRoomEvent.bind(this)));
        this.addMessageEvent(new FlatCreatedMessageEvent(this.onFlatCreated.bind(this)));

        // User data
        this.addMessageEvent(new UserObjectMessageEvent(this.onUserObject.bind(this)));

        // Room events
        this.addMessageEvent(new RoomEventMessageEvent(this.onRoomEvent.bind(this)));
        this.addMessageEvent(new RoomEventCancelMessageEvent(this.onRoomEventCancel.bind(this)));

        // Access
        this.addMessageEvent(new DoorbellMessageEvent(this.onDoorbell.bind(this)));
        this.addMessageEvent(new FlatAccessDeniedMessageEvent(this.onFlatAccessDenied.bind(this)));

        // Misc
        this.addMessageEvent(new ConvertedRoomIdMessageEvent(this.onConvertedRoomId.bind(this)));
        this.addMessageEvent(new CompetitionRoomsDataMessageEvent(this.onCompetitionRoomsData.bind(this)));
    }

    private addMessageEvent(event: IMessageEvent): void
    {
        this._navigator.communication.addMessageEvent(event);

        this._messageEvents.push(event);
    }

    private onNavigatorSettings(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as NavigatorSettingsMessageParser;

        if(!parser) return;

        this.data.homeRoomId = parser.homeRoomId;
        this.data.settingsReceived = true;

        log.trace(`Navigator settings received: homeRoomId=${parser.homeRoomId}`);
    }

    private onFavourites(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FavouritesMessageParser;

        if(!parser) return;

        this.data.onFavourites(parser.limit, parser.favouriteRoomIds);

        log.trace(`Favourites received: ${parser.favouriteRoomIds.length} rooms`);
    }

    private onFavouriteChanged(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FavouriteChangedMessageParser;

        if(!parser) return;

        this.data.favouriteChanged(parser.flatId, parser.added);

        log.debug(`Favourite changed: roomId=${parser.flatId}, added=${parser.added}`);
    }

    private onGetGuestRoomResult(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as GetGuestRoomResultMessageParser;

        if(!parser) return;

        if(!parser.data) return;

        // Based on AS3: com.sulake.habbo.navigator.IncomingMessages.onRoomInfo
        if(parser.enterRoom)
        {
            this.data.enteredRoom = parser.data;
            this.data.currentRoomIsStaffPick = parser.staffPick;

            if(parser.data.displayRoomEntryAd)
            {
                // TODO: Port AS3 requestRoomEnterAd().
            }

            this.data.createdFlatId = 0;

            if(this.data.enteredGuestRoom !== null && this.data.enteredGuestRoom.habboGroupId > 0)
            {
                // TODO: Port AS3 roomEventInfoCtrl expanded=false + refresh().
            }
        }
        else if(parser.roomForward)
        {
            if(parser.openingConnection)
            {
                this._navigator.goToRoom(parser.data.flatId, false, '', -1, true);
            }
            else if(parser.data.doorMode === 1 && (!parser.isGroupMember && this._navigator.sessionData?.userName !== parser.data.ownerName))
            {
                // TODO: Port AS3 _navigator.doorbell.show(parser.data).
            }
            else if(parser.data.doorMode === 2 && (this._navigator.sessionData?.userName !== parser.data.ownerName && !parser.isGroupMember))
            {
                // TODO: Port AS3 _navigator.passwordInput.show(parser.data).
            }
            else
            {
                if(parser.data.doorMode === 4 &&
					!this._navigator.sessionData?.isAmbassador &&
					!this._navigator.sessionData?.isRealNoob &&
					!this._navigator.sessionData?.isAnyRoomController)
                {
                    return;
                }

                this._navigator.goToRoom(parser.data.flatId, false);
            }
        }
        else
        {
            this.data.enteredRoom = parser.data;
            this.data.currentRoomIsStaffPick = parser.staffPick;

            // TODO: Port AS3 _navigator.roomInfoViewCtrl.reload().
        }

        log.debug(`Guest room result: ${parser.data.roomName} (${parser.data.flatId}), enterRoom=${parser.enterRoom}, forward=${parser.roomForward}`);
    }

    private onRoomInfoUpdated(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as RoomInfoUpdatedMessageParser;

        if(!parser) return;

        log.debug(`Room info updated: ${parser.flatId}`);
        // Trigger refresh of room info
    }

    private onRoomRating(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as RoomRatingMessageParser;

        if(!parser) return;

        this.data.currentRoomRating = parser.rating;
        this.data.canRate = parser.canRate;

        log.debug(`Room rating: ${parser.rating}, canRate=${parser.canRate}`);
    }

    private onGuestRoomSearchResult(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as GuestRoomSearchResultMessageParser;

        if(!parser) return;

        this.data.guestRoomSearchResults = parser.data;

        log.debug(`Guest room search results: ${parser.data?.rooms.length ?? 0} rooms`);
    }

    private onPopularRoomTagsResult(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as PopularRoomTagsResultMessageParser;

        if(!parser) return;

        this.data.popularTags = parser.data;

        log.trace(`Popular tags received: ${parser.data?.tags.length ?? 0} tags`);
    }

    private onOfficialRooms(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as OfficialRoomsMessageParser;

        if(!parser) return;

        this.data.officialRooms = parser.data;
        this.data.adRoom = parser.adRoom;
        this.data.promotedRooms = parser.promotedRooms;

        log.trace(`Official rooms received: ${parser.data?.entries.length ?? 0} entries`);
    }

    private onCategoriesWithVisitorCount(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as CategoriesWithVisitorCountMessageParser;

        if(!parser) return;

        this.data.categoriesWithVisitorData = parser.data;

        log.trace('Categories with visitor count received');
    }

    private onUserFlatCats(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as UserFlatCatsMessageParser;

        if(!parser) return;

        this.data.categories = parser.nodes;

        log.trace(`User flat categories received: ${parser.nodes.length} categories`);
    }

    private onUserEventCats(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as UserEventCatsMessageParser;

        if(!parser) return;

        this.data.eventCategories = parser.eventCategories;

        log.trace(`User event categories received: ${parser.eventCategories.length} categories`);
    }

    private onCanCreateRoom(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as CanCreateRoomMessageParser;

        if(!parser) return;

        log.debug(`Can create room: code=${parser.resultCode}, limit=${parser.roomLimit}`);
        // Handle room creation permission check result
    }

    private onCanCreateRoomEvent(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as CanCreateRoomEventMessageParser;

        if(!parser) return;

        log.debug(`Can create room event: ${parser.canCreateEvent}, error=${parser.errorCode}`);
        // Handle room event creation permission check result
    }

    private onFlatCreated(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FlatCreatedMessageParser;

        if(!parser) return;

        this.data.createdFlatId = parser.flatId;

        log.info(`Flat created: ${parser.flatName} (${parser.flatId})`);
    }

    private onUserObject(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as UserObjectMessageParser;

        if(!parser) return;

        this.data.avatarId = parser.id;
        this._navigator.send(new GetUserFlatCatsMessageComposer());
        this._navigator.send(new GetUserEventCatsMessageComposer());
    }

    private onRoomEvent(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as RoomEventMessageParser;

        if(!parser) return;

        this.data.roomEventData = parser.data;

        log.debug(`Room event: ${parser.data?.eventName}`);
    }

    private onRoomEventCancel(_event: IMessageEvent): void
    {
        this.data.roomEventData = null;

        log.debug('Room event cancelled');
    }

    private onDoorbell(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as DoorbellMessageParser;

        if(!parser) return;

        log.debug(`Doorbell: ${parser.userName}`);
        // Handle doorbell notification
    }

    private onFlatAccessDenied(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FlatAccessDeniedMessageParser;

        if(!parser) return;

        log.debug(`Flat access denied: roomId=${parser.flatId}, user=${parser.userName}`);
        // Handle access denied
    }

    private onConvertedRoomId(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as ConvertedRoomIdMessageParser;

        if(!parser) return;

        log.debug(`Converted room ID: ${parser.globalId} -> ${parser.convertedId}`);
        // Handle room ID conversion result
    }

    private onCompetitionRoomsData(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as CompetitionRoomsDataMessageParser;

        if(!parser) return;

        this.data.competitionRoomsData = parser.data;

        log.debug(`Competition rooms data: goal=${parser.data?.goalId}, page=${parser.data?.pageIndex}`);
    }

    /**
     * The room-settings replies all land on the same controller, which this port hangs off
     * the transitional navigator rather than off HabboNavigator as AS3 does.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/_SafeCls_1951.as::onRoomSettingsData()
    private onRoomSettingsData(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as RoomSettingsDataEventParser;
        const data = parser?.data ?? null;

        if(data === null) return;

        this._navigator.transitionalNavigator?.roomSettingsCtrl?.onRoomSettings(data);
    }

    // AS3: .../_SafeCls_1951.as::onRoomSettingsSaveError()
    private onRoomSettingsSaveError(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as RoomSettingsSaveErrorEventParser;

        if(!parser) return;

        this._navigator.transitionalNavigator?.roomSettingsCtrl?.onRoomSettingsSaveError(
            parser.roomId, parser.errorCode, parser.info
        );
    }

    // AS3: .../_SafeCls_1951.as::onFlatControllers()
    private onFlatControllers(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FlatControllersEventParser;

        if(!parser) return;

        this._navigator.transitionalNavigator?.roomSettingsCtrl?.onFlatControllers(parser.roomId, parser.controllers);
    }

    // AS3: .../_SafeCls_1951.as::onFlatControllerAdded()
    private onFlatControllerAdded(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FlatControllerAddedEventParser;
        const data = parser?.data ?? null;

        if(data === null) return;

        this._navigator.transitionalNavigator?.roomSettingsCtrl?.onFlatControllerAdded(parser.flatId, data);
    }

    // AS3: .../_SafeCls_1951.as::onFlatControllerRemoved()
    private onFlatControllerRemoved(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FlatControllerRemovedEventParser;

        if(!parser) return;

        this._navigator.transitionalNavigator?.roomSettingsCtrl?.onFlatControllerRemoved(parser.flatId, parser.userId);
    }

    // AS3: .../_SafeCls_1951.as::onBannedUsersFromRoom()
    private onBannedUsersFromRoom(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as BannedUsersFromRoomEventParser;

        if(!parser) return;

        this._navigator.transitionalNavigator?.roomSettingsCtrl?.onBannedUsersFromRoom(parser.roomId, parser.bannedUsers);
    }

    // AS3: .../_SafeCls_1951.as::onUserUnbannedFromRoom()
    private onUserUnbannedFromRoom(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as UserUnbannedFromRoomEventParser;

        if(!parser) return;

        this._navigator.transitionalNavigator?.roomSettingsCtrl?.onUserUnbannedFromRoom(parser.roomId, parser.userId);
    }

    /** AS3 passes the entered room's id, not the selection type the parser carries. */
    // AS3: .../_SafeCls_1951.as::onEnforceRoomCategorySelection()
    private onEnforceRoomCategorySelection(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as ShowEnforceRoomCategoryDialogEventParser;

        if(!parser) return;

        this._navigator.transitionalNavigator?.enforceCategoryCtrl?.show(
            this.data.enteredGuestRoom?.flatId ?? 0
        );
    }
}
