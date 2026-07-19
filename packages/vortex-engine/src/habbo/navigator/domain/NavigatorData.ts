import type {
    CategoriesWithVisitorCountData,
    CompetitionRoomsData,
    EventCategory,
    FlatCategory,
    GuestRoomData,
    GuestRoomSearchResultData,
    INavigatorSearchResultData,
    OfficialRoomEntryData,
    OfficialRoomsData,
    PopularTagsData,
    PromotedRoomsData,
    RoomEventData,
} from '../../communication/messages/incoming/navigator';
import type { RoomSessionTags } from './RoomSessionTags';
import type {
    NavigatorSearchResultSet,
    NavigatorTopLevelContext,
} from '../../communication/messages/incoming/newnavigator';
import {RoomSettingsFriendListManager} from '../roomsettings';

type NavigatorSecurityProvider = {
    readonly sessionData?: {
        hasSecurity(level: number): boolean;
    } | null;
};

/**
 * Navigator data domain model
 *
 * Based on AS3 com.sulake.habbo.navigator.domain.NavigatorData
 */
export class NavigatorData
{
    private readonly _navigator: NavigatorSecurityProvider | null;
    private _lastMessage: INavigatorSearchResultData | null = null;
    private _favouriteLimit: number = 0;
    private _favouriteCount: number = 0;
    private _favouriteRoomIds: Map<number, boolean> = new Map();
    private _isLoading: boolean = false;
    private _friendList: RoomSettingsFriendListManager = new RoomSettingsFriendListManager();

    constructor(navigator: NavigatorSecurityProvider | null = null)
    {
        this._navigator = navigator;
    }

    private _roomEventData: RoomEventData | null = null;

    get roomEventData(): RoomEventData | null
    {
        return this._roomEventData;
    }

    set roomEventData(value: RoomEventData | null)
    {
        if(this._roomEventData !== null)
        {
            (this._roomEventData as { dispose?: () => void }).dispose?.();
        }

        this._roomEventData = value;
    }

    private _eventMod: boolean = false;

    get eventMod(): boolean
    {
        return this._eventMod;
    }

    set eventMod(value: boolean)
    {
        this._eventMod = value;
    }

    private _roomPicker: boolean = false;

    get roomPicker(): boolean
    {
        return this._roomPicker;
    }

    set roomPicker(value: boolean)
    {
        this._roomPicker = value;
    }

    private _currentRoomOwner: boolean = false;

    get currentRoomOwner(): boolean
    {
        return this._currentRoomOwner;
    }

    private _currentRoomId: number = 0;

    get currentRoomId(): number
    {
        return this._currentRoomId;
    }

    private _avatarId: number = 0;

    get avatarId(): number
    {
        return this._avatarId;
    }

    set avatarId(value: number)
    {
        this._avatarId = value;
    }

    private _enteredGuestRoom: GuestRoomData | null = null;

    get enteredGuestRoom(): GuestRoomData | null
    {
        return this._enteredGuestRoom;
    }

    set enteredGuestRoom(value: GuestRoomData | null)
    {
        if(this._enteredGuestRoom !== null)
        {
            this._enteredGuestRoom.dispose();
        }

        this._enteredGuestRoom = value;
    }

    set enteredRoom(value: GuestRoomData | null)
    {
        this.enteredGuestRoom = value;
    }

    private _hcMember: boolean = false;

    get hcMember(): boolean
    {
        return this._hcMember;
    }

    set hcMember(value: boolean)
    {
        this._hcMember = value;
    }

    private _createdFlatId: number = 0;

    get createdFlatId(): number
    {
        return this._createdFlatId;
    }

    set createdFlatId(value: number)
    {
        this._createdFlatId = value;
    }

    private _hotRoomPopupOpen: boolean = false;

    get hotRoomPopupOpen(): boolean
    {
        return this._hotRoomPopupOpen;
    }

    set hotRoomPopupOpen(value: boolean)
    {
        this._hotRoomPopupOpen = value;
    }

    private _homeRoomId: number = 0;

    get homeRoomId(): number
    {
        return this._homeRoomId;
    }

    set homeRoomId(value: number)
    {
        this._homeRoomId = value;
    }

    private _settingsReceived: boolean = false;

    get settingsReceived(): boolean
    {
        return this._settingsReceived;
    }

    set settingsReceived(value: boolean)
    {
        this._settingsReceived = value;
    }

    private _allCategories: FlatCategory[] = [];
    private _categoryByNodeId: Map<number, FlatCategory> = new Map();

    get allCategories(): FlatCategory[]
    {
        return this._allCategories;
    }

    private _visibleCategories: FlatCategory[] = [];

    get visibleCategories(): FlatCategory[]
    {
        return this._visibleCategories;
    }

    private _allEventCategories: EventCategory[] = [];
    private _eventCategoryById: Map<number, EventCategory> = new Map();

    get allEventCategories(): EventCategory[]
    {
        return this._allEventCategories;
    }

    private _visibleEventCategories: EventCategory[] = [];

    get visibleEventCategories(): EventCategory[]
    {
        return this._visibleEventCategories;
    }

    private _currentRoomRating: number = 0;

    get currentRoomRating(): number
    {
        return this._currentRoomRating;
    }

    set currentRoomRating(value: number)
    {
        this._currentRoomRating = value;
    }

    private _canRate: boolean = false;

    get canRate(): boolean
    {
        return this._canRate;
    }

    set canRate(value: boolean)
    {
        this._canRate = value;
    }

    private _currentRoomIsStaffPick: boolean = false;

    get currentRoomIsStaffPick(): boolean
    {
        return this._currentRoomIsStaffPick;
    }

    set currentRoomIsStaffPick(value: boolean)
    {
        this._currentRoomIsStaffPick = value;
    }

    private _adIndex: number = 0;

    get adIndex(): number
    {
        return this._adIndex;
    }

    set adIndex(value: number)
    {
        this._adIndex = value;
    }

    private _adRoom: OfficialRoomEntryData | null = null;

    get adRoom(): OfficialRoomEntryData | null
    {
        return this._adRoom;
    }

    set adRoom(value: OfficialRoomEntryData | null)
    {
        this._adRoom = value;
    }

    private _promotedRooms: PromotedRoomsData | null = null;

    get promotedRooms(): PromotedRoomsData | null
    {
        return this._promotedRooms;
    }

    set promotedRooms(value: PromotedRoomsData | null)
    {
        this._promotedRooms = value;
    }

    private _roomSessionTags: RoomSessionTags | null = null;

    get roomSessionTags(): RoomSessionTags | null
    {
        return this._roomSessionTags;
    }

    set roomSessionTags(value: RoomSessionTags | null)
    {
        this._roomSessionTags = value;
    }

    private _competitionRoomsData: CompetitionRoomsData | null = null;

    get competitionRoomsData(): CompetitionRoomsData | null
    {
        return this._competitionRoomsData;
    }

    set competitionRoomsData(value: CompetitionRoomsData | null)
    {
        this._competitionRoomsData = value;
    }

    // New Navigator data
    private _topLevelContexts: NavigatorTopLevelContext[] = [];

    get topLevelContexts(): NavigatorTopLevelContext[]
    {
        return this._topLevelContexts;
    }

    set topLevelContexts(value: NavigatorTopLevelContext[])
    {
        this._topLevelContexts = value;
    }

    private _navigatorSearchResultSet: NavigatorSearchResultSet | null = null;

    get navigatorSearchResultSet(): NavigatorSearchResultSet | null
    {
        return this._navigatorSearchResultSet;
    }

    set navigatorSearchResultSet(value: NavigatorSearchResultSet | null)
    {
        this._navigatorSearchResultSet = value;

        this._isLoading = false;
    }

    get canAddFavourite(): boolean
    {
        return this._enteredGuestRoom !== null && !this._currentRoomOwner;
    }

    get canEditRoomSettings(): boolean
    {
        return this._enteredGuestRoom !== null && (this._currentRoomOwner || (this._navigator?.sessionData?.hasSecurity(5) ?? false));
    }

    get popularTagsArrived(): boolean
    {
        return this._lastMessage !== null && 'tags' in this._lastMessage;
    }

    get guestRoomSearchArrived(): boolean
    {
        return this._lastMessage !== null && 'rooms' in this._lastMessage;
    }

    get officialRoomsArrived(): boolean
    {
        return this._lastMessage !== null && 'entries' in this._lastMessage;
    }

    get categoriesWithUserCountArrived(): boolean
    {
        return this._lastMessage !== null && 'categories' in this._lastMessage;
    }

    get guestRoomSearchResults(): GuestRoomSearchResultData | null
    {
        return this._lastMessage as GuestRoomSearchResultData | null;
    }

    set guestRoomSearchResults(value: GuestRoomSearchResultData | null)
    {
        this.disposeCurrentMessage();

        this._lastMessage = value;

        if(value)
        {
            this._adRoom = value.ad;
        }

        this._isLoading = false;
    }

    get popularTags(): PopularTagsData | null
    {
        return this._lastMessage as PopularTagsData | null;
    }

    set popularTags(value: PopularTagsData | null)
    {
        this.disposeCurrentMessage();

        this._lastMessage = value;
        this._isLoading = false;
    }

    get officialRooms(): OfficialRoomsData | null
    {
        return this._lastMessage as OfficialRoomsData | null;
    }

    set officialRooms(value: OfficialRoomsData | null)
    {
        this.disposeCurrentMessage();

        this._lastMessage = value;
        this._isLoading = false;
    }

    get categoriesWithVisitorData(): CategoriesWithVisitorCountData | null
    {
        return this._lastMessage as CategoriesWithVisitorCountData | null;
    }

    set categoriesWithVisitorData(value: CategoriesWithVisitorCountData | null)
    {
        this.disposeCurrentMessage();

        this._lastMessage = value;
        this._isLoading = false;
    }

    set categories(value: FlatCategory[])
    {
        this._allCategories = value;
        this._categoryByNodeId.clear();
        this._visibleCategories = [];

        for(const cat of value)
        {
            this._categoryByNodeId.set(cat.nodeId, cat);

            if(cat.visible)
            {
                this._visibleCategories.push(cat);
            }
        }
    }

    set eventCategories(value: EventCategory[])
    {
        this._allEventCategories = value;
        this._eventCategoryById.clear();
        this._visibleEventCategories = [];

        for(const cat of value)
        {
            this._eventCategoryById.set(cat.categoryId, cat);

            if(cat.visible)
            {
                this._visibleEventCategories.push(cat);
            }
        }
    }

    onRoomEnter(roomEnterOrGuestRoomId: { readonly guestRoomId: number; readonly owner: boolean } | number, isOwner: boolean = false): void
    {
        const guestRoomId = typeof roomEnterOrGuestRoomId === 'number' ? roomEnterOrGuestRoomId : roomEnterOrGuestRoomId.guestRoomId;
        const owner = typeof roomEnterOrGuestRoomId === 'number' ? isOwner : roomEnterOrGuestRoomId.owner;

        this._enteredGuestRoom = null;
        this._currentRoomOwner = owner;
        this._currentRoomId = guestRoomId;
    }

    onRoomExit(): void
    {
        if(this._roomEventData !== null)
        {
            this.roomEventData = null;
        }

        if(this._enteredGuestRoom !== null)
        {
            this._enteredGuestRoom.dispose();
            this._enteredGuestRoom = null;
        }

        this._currentRoomOwner = false;
    }

    getCategoryById(nodeId: number): FlatCategory | null
    {
        return this._categoryByNodeId.get(nodeId) ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/domain/NavigatorData.as::getEventCategoryById()
    // Deliberate divergence, not an oversight: AS3's real body iterates _allCategories (room
    // categories, FlatCategory - which carries nodeId, not categoryId) and compares against
    // .categoryId, a property that doesn't exist on that type - so it always returns null. AS3 also
    // has zero callers for this method anywhere in the client, same as this port, so there is no
    // observable behavior to be bug-compatible with; this queries the correctly-separated
    // _eventCategoryById map instead of reproducing the dead, self-evidently broken lookup.
    getEventCategoryById(categoryId: number): EventCategory | null
    {
        return this._eventCategoryById.get(categoryId) ?? null;
    }

    onFavourites(favouritesOrLimit: { readonly limit: number; readonly favouriteRoomIds: number[] } | number, roomIds: number[] = []): void
    {
        const limit = typeof favouritesOrLimit === 'number' ? favouritesOrLimit : favouritesOrLimit.limit;
        const favouriteRoomIds = typeof favouritesOrLimit === 'number' ? roomIds : favouritesOrLimit.favouriteRoomIds;

        this._favouriteLimit = limit;
        this._favouriteCount = favouriteRoomIds.length;
        this._favouriteRoomIds.clear();

        for(const roomId of favouriteRoomIds)
        {
            this._favouriteRoomIds.set(roomId, true);
        }
    }

    favouriteChanged(roomId: number, added: boolean): void
    {
        if(added)
        {
            this._favouriteRoomIds.set(roomId, true);
            this._favouriteCount++;
        }
        else
        {
            this._favouriteRoomIds.delete(roomId);
            this._favouriteCount--;
        }
    }

    isCurrentRoomFavourite(): boolean
    {
        if(!this._enteredGuestRoom)
        {
            return false;
        }
        return this._favouriteRoomIds.has(this._enteredGuestRoom.flatId);
    }

    isCurrentRoomHome(): boolean
    {
        if(!this._enteredGuestRoom)
        {
            return false;
        }
        return this._homeRoomId === this._enteredGuestRoom.flatId;
    }

    isRoomFavourite(roomId: number): boolean
    {
        return this._favouriteRoomIds.has(roomId);
    }

    isFavouritesFull(): boolean
    {
        return this._favouriteCount >= this._favouriteLimit;
    }

    isRoomHome(roomId: number): boolean
    {
        return roomId === this._homeRoomId;
    }

    startLoading(): void
    {
        this._isLoading = true;
    }

    isLoading(): boolean
    {
        return this._isLoading;
    }

    get friendList(): RoomSettingsFriendListManager
    {
        return this._friendList;
    }

    getAndResetSessionTags(): RoomSessionTags | null
    {
        const tags = this._roomSessionTags;

        this._roomSessionTags = null;

        return tags;
    }

    dispose(): void
    {
        this.disposeCurrentMessage();

        if(this._enteredGuestRoom)
        {
            this._enteredGuestRoom.dispose();
            this._enteredGuestRoom = null;
        }

        if(this._promotedRooms)
        {
            this._promotedRooms.dispose();
            this._promotedRooms = null;
        }

        this._favouriteRoomIds.clear();

        this._allCategories.length = 0;
        this._categoryByNodeId.clear();
        this._visibleCategories.length = 0;
        this._allEventCategories.length = 0;
        this._eventCategoryById.clear();
        this._visibleEventCategories.length = 0;
    }

    private disposeCurrentMessage(): void
    {
        if(this._lastMessage === null)
        {
            return;
        }

        this._lastMessage.dispose();

        this._lastMessage = null;
    }
}
