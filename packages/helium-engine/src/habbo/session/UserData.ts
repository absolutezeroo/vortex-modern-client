import type {IUserData} from './IUserData';

/**
 * User data type constants
 */
export const UserDataType = {
    USER: 1,
    PET: 2,
    BOT: 3,
    RENTABLE_BOT: 4
} as const;

/**
 * Room user data
 * Based on AS3 com.sulake.habbo.session.UserData
 */
export class UserData implements IUserData
{
    private readonly _roomObjectId: number;

    constructor(roomObjectId: number)
    {
        this._roomObjectId = roomObjectId;
    }

    private _type: number = 0;

    get type(): number
    {
        return this._type;
    }

    set type(value: number)
    {
        this._type = value;
    }

    private _webID: number = 0;

    get webID(): number
    {
        return this._webID;
    }

    set webID(value: number)
    {
        this._webID = value;
    }

    private _name: string = '';

    get name(): string
    {
        if(this._isBlocked) return '';

        return this._name;
    }

    set name(value: string)
    {
        this._name = value;
    }

    private _figure: string = '';

    get figure(): string
    {
        if(this._isBlocked) return '';

        return this._figure;
    }

    set figure(value: string)
    {
        this._figure = value;
    }

    private _sex: string = '';

    get sex(): string
    {
        if(this._isBlocked) return 'M';

        return this._sex;
    }

    set sex(value: string)
    {
        this._sex = value;
    }

    private _custom: string = '';

    get custom(): string
    {
        if(this._isBlocked) return '';

        return this._custom;
    }

    set custom(value: string)
    {
        this._custom = value;
    }

    private _achievementScore: number = 0;

    get achievementScore(): number
    {
        if(this._isBlocked) return 0;

        return this._achievementScore;
    }

    set achievementScore(value: number)
    {
        this._achievementScore = value;
    }

    private _groupID: string = '';

    get groupID(): string
    {
        if(this._isBlocked) return '';

        return this._groupID;
    }

    set groupID(value: string)
    {
        this._groupID = value;
    }

    private _groupName: string = '';

    get groupName(): string
    {
        if(this._isBlocked) return '';

        return this._groupName;
    }

    set groupName(value: string)
    {
        this._groupName = value;
    }

    private _groupStatus: number = 0;

    get groupStatus(): number
    {
        if(this._isBlocked) return 0;

        return this._groupStatus;
    }

    set groupStatus(value: number)
    {
        this._groupStatus = value;
    }

    private _ownerId: number = 0;

    get ownerId(): number
    {
        return this._ownerId;
    }

    set ownerId(value: number)
    {
        this._ownerId = value;
    }

    private _ownerName: string = '';

    get ownerName(): string
    {
        return this._ownerName;
    }

    set ownerName(value: string)
    {
        this._ownerName = value;
    }

    private _petLevel: number = 0;

    get petLevel(): number
    {
        return this._petLevel;
    }

    set petLevel(value: number)
    {
        this._petLevel = value;
    }

    private _rarityLevel: number = 0;

    get rarityLevel(): number
    {
        return this._rarityLevel;
    }

    set rarityLevel(value: number)
    {
        this._rarityLevel = value;
    }

    private _hasSaddle: boolean = false;

    get hasSaddle(): boolean
    {
        return this._hasSaddle;
    }

    set hasSaddle(value: boolean)
    {
        this._hasSaddle = value;
    }

    private _isRiding: boolean = false;

    get isRiding(): boolean
    {
        return this._isRiding;
    }

    set isRiding(value: boolean)
    {
        this._isRiding = value;
    }

    private _canBreed: boolean = false;

    get canBreed(): boolean
    {
        return this._canBreed;
    }

    set canBreed(value: boolean)
    {
        this._canBreed = value;
    }

    private _canHarvest: boolean = false;

    get canHarvest(): boolean
    {
        return this._canHarvest;
    }

    set canHarvest(value: boolean)
    {
        this._canHarvest = value;
    }

    private _canRevive: boolean = false;

    get canRevive(): boolean
    {
        return this._canRevive;
    }

    set canRevive(value: boolean)
    {
        this._canRevive = value;
    }

    private _hasBreedingPermission: boolean = false;

    get hasBreedingPermission(): boolean
    {
        return this._hasBreedingPermission;
    }

    set hasBreedingPermission(value: boolean)
    {
        this._hasBreedingPermission = value;
    }

    private _botSkills: number[] = [];

    get botSkills(): number[]
    {
        return this._botSkills;
    }

    set botSkills(value: number[])
    {
        this._botSkills = value;
    }

    private _botSkillData: unknown[] = [];

    get botSkillData(): unknown[]
    {
        return this._botSkillData;
    }

    set botSkillData(value: unknown[])
    {
        this._botSkillData = value;
    }

    private _isModerator: boolean = false;

    get isModerator(): boolean
    {
        return this._isModerator;
    }

    set isModerator(value: boolean)
    {
        this._isModerator = value;
    }

    private _isBlocked: boolean = false;

    get isBlocked(): boolean
    {
        return this._isBlocked;
    }

    set isBlocked(value: boolean)
    {
        this._isBlocked = value;
    }

    get roomObjectId(): number
    {
        return this._roomObjectId;
    }
}
