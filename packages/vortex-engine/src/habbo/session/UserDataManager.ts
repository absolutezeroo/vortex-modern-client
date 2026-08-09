import type {IUserDataManager} from './IUserDataManager';
import type {IUserData} from './IUserData';
import {UserDataType} from './UserData';
import type {IConnection} from '@core/communication/connection/IConnection';
import {GetSelectedBadgesMessageComposer} from '../communication/messages/outgoing/users/GetSelectedBadgesMessageComposer';
import {GetPetInfoMessageComposer} from '../communication/messages/outgoing/room/pet/GetPetInfoMessageComposer';

/**
 * Room user data manager
 * Based on AS3 com.sulake.habbo.session.UserDataManager
 */
export class UserDataManager implements IUserDataManager
{
    private _usersByTypeAndWebId: Map<number, Map<number, IUserData>> = new Map();
    private _usersByRoomIndex: Map<number, IUserData> = new Map();
    private _userBadges: Map<number, string[]> = new Map();
    private _connection: IConnection | null = null;

    constructor()
    {
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::set connection()
    set connection(connection: IConnection | null)
    {
        this._connection = connection;
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._usersByTypeAndWebId.clear();
        this._usersByRoomIndex.clear();
        this._userBadges.clear();
        this._connection = null;
        this._disposed = true;
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::getUserData()
    getUserData(webId: number): IUserData | null
    {
        return this.getUserDataByType(webId, UserDataType.USER);
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::getUserDataByType()
    getUserDataByType(webId: number, type: number): IUserData | null
    {
        const typeMap = this._usersByTypeAndWebId.get(type);

        if(typeMap)
        {
            return typeMap.get(webId) ?? null;
        }

        return null;
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::getUserDataByIndex()
    getUserDataByIndex(roomIndex: number): IUserData | null
    {
        return this._usersByRoomIndex.get(roomIndex) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::getUserDataByName()
    getUserDataByName(name: string): IUserData | null
    {
        for(const userData of this._usersByRoomIndex.values())
        {
            if(userData.name === name)
            {
                return userData;
            }
        }

        return null;
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::getPetUserData()
    getPetUserData(webId: number): IUserData | null
    {
        return this.getUserDataByType(webId, UserDataType.PET);
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::getRentableBotUserData()
    getRentableBotUserData(webId: number): IUserData | null
    {
        return this.getUserDataByType(webId, UserDataType.RENTABLE_BOT);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/UserDataManager.as::requestUserSelectedBadges()
    requestUserSelectedBadges(userId: number): void
    {
        this._connection?.send(new GetSelectedBadgesMessageComposer(userId));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/UserDataManager.as::getUserSelectedBadges()
    // A pure cache read, no side effect - AS3 keeps this strictly separate from
    // requestUserSelectedBadges() above, which is the only one that sends the composer.
    // The previous getUserBadges() fused both, so every read fired a fresh network request.
    getUserSelectedBadges(userId: number): string[]
    {
        return this._userBadges.get(userId) ?? [];
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::setUserData()
    setUserData(userData: IUserData): void
    {
        if(!userData) return;

        // Remove any existing data for this room index
        this.removeUserDataByRoomIndex(userData.roomObjectId);

        // Get or create the type map
        let typeMap = this._usersByTypeAndWebId.get(userData.type);

        if(!typeMap)
        {
            typeMap = new Map();
            this._usersByTypeAndWebId.set(userData.type, typeMap);
        }

        // Add by webID
        typeMap.set(userData.webID, userData);

        // Add by room index
        this._usersByRoomIndex.set(userData.roomObjectId, userData);
    }

    // AS3: sources/win63_version/habbo/session/UserDataManager.as::setUserBadges()
    setUserBadges(userId: number, badges: string[]): void
    {
        this._userBadges.delete(userId);
        this._userBadges.set(userId, badges);
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::removeUserDataByRoomIndex()
    removeUserDataByRoomIndex(roomIndex: number): void
    {
        const userData = this._usersByRoomIndex.get(roomIndex);

        if(userData)
        {
            this._usersByRoomIndex.delete(roomIndex);

            const typeMap = this._usersByTypeAndWebId.get(userData.type);

            if(typeMap)
            {
                typeMap.delete(userData.webID);
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::updateFigure()
    updateFigure(roomIndex: number, figure: string, sex: string, hasSaddle: boolean, isRiding: boolean): void
    {
        const userData = this.getUserDataByIndex(roomIndex);

        if(userData)
        {
            userData.figure = figure;
            userData.sex = sex;
            userData.hasSaddle = hasSaddle;
            userData.isRiding = isRiding;
        }
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::updatePetLevel()
    updatePetLevel(roomIndex: number, level: number): void
    {
        const userData = this.getUserDataByIndex(roomIndex);

        if(userData)
        {
            userData.petLevel = level;
        }
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::updatePetBreedingStatus()
    updatePetBreedingStatus(roomIndex: number, canBreed: boolean, canHarvest: boolean, canRevive: boolean, hasBreedingPermission: boolean): void
    {
        const userData = this.getUserDataByIndex(roomIndex);

        if(userData)
        {
            userData.canBreed = canBreed;
            userData.canHarvest = canHarvest;
            userData.canRevive = canRevive;
            userData.hasBreedingPermission = hasBreedingPermission;
        }
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::updateCustom()
    updateCustom(roomIndex: number, custom: string): void
    {
        const userData = this.getUserDataByIndex(roomIndex);

        if(userData)
        {
            userData.custom = custom;
        }
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::updateAchievementScore()
    updateAchievementScore(roomIndex: number, score: number): void
    {
        const userData = this.getUserDataByIndex(roomIndex);

        if(userData)
        {
            userData.achievementScore = score;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/UserDataManager.as::updateBadgesRank()
    updateBadgesRank(roomIndex: number, badgesRank: number): void
    {
        const userData = this.getUserDataByIndex(roomIndex);

        if(userData)
        {
            userData.badgesRank = badgesRank;
        }
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::markAsBlocked()
    markAsBlocked(roomIndex: number, blocked: boolean = true): void
    {
        const userData = this.getUserDataByIndex(roomIndex);

        if(userData)
        {
            userData.isBlocked = blocked;
        }
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::updateNameByIndex()
    updateNameByIndex(roomIndex: number, name: string): void
    {
        const userData = this.getUserDataByIndex(roomIndex);

        if(userData)
        {
            userData.name = name;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/UserDataManager.as::requestPetInfo()
    // First link in the pet-infostand chain: the server answers with PetInfoMessageEvent (3192),
    // which RoomUsersHandler turns into RoomSessionPetInfoUpdateEvent for InfoStandWidgetHandler.
    requestPetInfo(webId: number): void
    {
        const petData = this.getPetUserData(webId);

        if(petData && this._connection)
        {
            this._connection.send(new GetPetInfoMessageComposer(petData.webID));
        }
    }

    // AS3: .../src/com/sulake/habbo/session/UserDataManager.as::getAllUserIds()
    getAllUserIds(): number[]
    {
        const userIds: number[] = [];

        for(const userData of this._usersByRoomIndex.values())
        {
            userIds.push(userData.webID);
        }

        return userIds;
    }
}
