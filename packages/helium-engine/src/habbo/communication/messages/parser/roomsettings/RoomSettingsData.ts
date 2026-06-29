import type {RoomChatSettings} from './RoomChatSettings';
import type {RoomModerationSettings} from './RoomModerationSettings';
import type {RoomSettingsController} from './RoomSettingsController';
import type {RoomSettingsBannedUser} from './RoomSettingsBannedUser';

export class RoomSettingsData
{
    static readonly DOOR_MODE_OPEN: number = 0;
    static readonly DOOR_MODE_CLOSED: number = 1;
    static readonly DOOR_MODE_PASSWORD: number = 2;
    static readonly DOOR_MODE_INVISIBLE: number = 3;
    static readonly DOOR_MODE_NOOBS_ONLY: number = 4;

    static readonly TRADE_MODE_NOT_ALLOWED: number = 0;
    static readonly TRADE_MODE_NOT_WITH_CONTROLLER: number = 1;
    static readonly TRADE_MODE_ALLOWED: number = 2;

    roomId: number = 0;
    name: string = '';
    description: string = '';
    doorMode: number = 0;
    categoryId: number = 0;
    maximumVisitors: number = 0;
    maximumVisitorsLimit: number = 0;
    tags: string[] = [];
    tradeMode: number = 0;
    allowPets: boolean = false;
    allowFoodConsume: boolean = false;
    allowWalkThrough: boolean = false;
    hideWalls: boolean = false;
    wallThickness: number = 0;
    floorThickness: number = 0;
    chatSettings: RoomChatSettings | null = null;
    allowNavigatorDynamicCats: boolean = false;
    roomModerationSettings: RoomModerationSettings | null = null;
    hiddenByBc: boolean = false;

    controllersById: Map<number, RoomSettingsController> = new Map();
    bannedUsersById: Map<number, RoomSettingsBannedUser> = new Map();

    private _controllerListDirty: boolean = true;
    private _controllerList: RoomSettingsController[] | null = null;
    private _bannedListDirty: boolean = true;
    private _bannedList: RoomSettingsBannedUser[] | null = null;

    static getDoorModeLocalizationKey(doorMode: number): string
    {
        switch(doorMode)
        {
            case 0: return '${navigator.door.mode.open}';
            case 1: return '${navigator.door.mode.closed}';
            case 2: return '${navigator.door.mode.password}';
            case 3: return '${navigator.door.mode.invisible}';
            case 4: return '${navigator.door.mode.noobs_only}';
            default: return '';
        }
    }

    setController(userId: number, controller: RoomSettingsController): void
    {
        this.controllersById.set(userId, controller);
        this._controllerListDirty = true;
        this._controllerList = null;
    }

    get controllerList(): RoomSettingsController[]
    {
        if(this._controllerList === null || this._controllerListDirty)
        {
            this._controllerList = Array.from(this.controllersById.values())
                .sort((a, b) => a.userName.localeCompare(b.userName));
            this._controllerListDirty = false;
        }

        return this._controllerList;
    }

    setBannedUser(userId: number, banned: RoomSettingsBannedUser): void
    {
        this.bannedUsersById.set(userId, banned);
        this._bannedListDirty = true;
        this._bannedList = null;
    }

    get bannedUsersList(): RoomSettingsBannedUser[]
    {
        if(this._bannedList === null || this._bannedListDirty)
        {
            this._bannedList = Array.from(this.bannedUsersById.values())
                .sort((a, b) => a.userName.localeCompare(b.userName));
            this._bannedListDirty = false;
        }

        return this._bannedList;
    }
}
