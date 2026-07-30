import type {IFriendEntity} from './IFriendEntity';
import type {IFriendNotification} from './IFriendNotification';

/**
 * FriendEntity
 *
 * One friend in the bar, with the badges queued against it.
 *
 * The notification vector is built on first read, not in the constructor — most
 * friends never get one, and the bar holds every friend the server sent.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/data/FriendEntity.as
 */
export class FriendEntity implements IFriendEntity
{
    /**
     * Shared across every entity: `getNextLogEventId()` hands out one id per tracked
     * interaction, and the counter is class-level so two friends never share one.
     */
    // AS3: .../data/FriendEntity.as::ROLLING_LOG_EVENT_ID
    private static _rollingLogEventId: number = 0;

    // AS3: .../data/FriendEntity.as::FriendEntity()
    constructor(
        id: number,
        name: string,
        realName: string,
        motto: string,
        gender: number,
        online: boolean,
        allowFollow: boolean,
        figure: string,
        categoryId: number,
        lastAccess: string
    )
    {
        this._id = id;
        this._name = name;
        this._realName = realName;
        this._motto = motto;
        this._gender = gender;
        this._online = online;
        this._allowFollow = allowFollow;
        this._figure = figure;
        this._categoryId = categoryId;
        this._lastAccess = lastAccess;
    }

    // AS3: .../data/FriendEntity.as::_SafeStr_4872
    private _id: number;

    // AS3: .../data/FriendEntity.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../data/FriendEntity.as::_name
    private _name: string;

    // AS3: .../data/FriendEntity.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../data/FriendEntity.as::set name()
    set name(value: string)
    {
        this._name = value;
    }

    // AS3: .../data/FriendEntity.as::_SafeStr_4645
    private _gender: number;

    // AS3: .../data/FriendEntity.as::get gender()
    get gender(): number
    {
        return this._gender;
    }

    // AS3: .../data/FriendEntity.as::set gender()
    set gender(value: number)
    {
        this._gender = value;
    }

    // AS3: .../data/FriendEntity.as::_SafeStr_7958
    private _online: boolean;

    // AS3: .../data/FriendEntity.as::get online()
    get online(): boolean
    {
        return this._online;
    }

    // AS3: .../data/FriendEntity.as::set online()
    set online(value: boolean)
    {
        this._online = value;
    }

    // AS3: .../data/FriendEntity.as::_allowFollow
    private _allowFollow: boolean;

    // AS3: .../data/FriendEntity.as::get allowFollow()
    get allowFollow(): boolean
    {
        return this._allowFollow;
    }

    // AS3: .../data/FriendEntity.as::set allowFollow()
    set allowFollow(value: boolean)
    {
        this._allowFollow = value;
    }

    // AS3: .../data/FriendEntity.as::_SafeStr_5551
    private _figure: string;

    // AS3: .../data/FriendEntity.as::get figure()
    get figure(): string
    {
        return this._figure;
    }

    // AS3: .../data/FriendEntity.as::set figure()
    set figure(value: string)
    {
        this._figure = value;
    }

    // AS3: .../data/FriendEntity.as::_SafeStr_7619
    private _categoryId: number;

    // AS3: .../data/FriendEntity.as::get categoryId()
    get categoryId(): number
    {
        return this._categoryId;
    }

    // AS3: .../data/FriendEntity.as::set categoryId()
    set categoryId(value: number)
    {
        this._categoryId = value;
    }

    // AS3: .../data/FriendEntity.as::_SafeStr_7860
    private _motto: string;

    // AS3: .../data/FriendEntity.as::get motto()
    get motto(): string
    {
        return this._motto;
    }

    // AS3: .../data/FriendEntity.as::set motto()
    set motto(value: string)
    {
        this._motto = value;
    }

    // AS3: .../data/FriendEntity.as::_SafeStr_7699
    private _lastAccess: string;

    // AS3: .../data/FriendEntity.as::get lastAccess()
    get lastAccess(): string
    {
        return this._lastAccess;
    }

    // AS3: .../data/FriendEntity.as::set lastAccess()
    set lastAccess(value: string)
    {
        this._lastAccess = value;
    }

    // AS3: .../data/FriendEntity.as::_realName
    private _realName: string;

    // AS3: .../data/FriendEntity.as::get realName()
    get realName(): string
    {
        return this._realName;
    }

    // AS3: .../data/FriendEntity.as::set realName()
    set realName(value: string)
    {
        this._realName = value;
    }

    // AS3: .../data/FriendEntity.as::_SafeStr_9687
    private _logEventId: number = -1;

    // AS3: .../data/FriendEntity.as::get logEventId()
    get logEventId(): number
    {
        return this._logEventId;
    }

    // AS3: .../data/FriendEntity.as::set logEventId()
    set logEventId(value: number)
    {
        this._logEventId = value;
    }

    // AS3: .../data/FriendEntity.as::_notifications
    private _notifications: IFriendNotification[] | null = null;

    // AS3: .../data/FriendEntity.as::get notifications()
    get notifications(): IFriendNotification[]
    {
        if(this._notifications === null)
        {
            this._notifications = [];
        }

        return this._notifications;
    }

    // AS3: .../data/FriendEntity.as::getNextLogEventId()
    getNextLogEventId(): number
    {
        return ++FriendEntity._rollingLogEventId;
    }
}
