/**
 * RoomUserData
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.class_1668
 *
 * Data structure for room users (avatars, pets, bots).
 */
export class RoomUserData
{
    public static readonly USER_TYPE_USER = 1;
    public static readonly USER_TYPE_PET = 2;
    public static readonly USER_TYPE_OLD_BOT = 3;
    public static readonly USER_TYPE_BOT = 4;
    private _readOnly: boolean = false;

    constructor(roomIndex: number)
    {
        this._roomIndex = roomIndex;
    }

    private _roomIndex: number;

    get roomIndex(): number
    {
        return this._roomIndex;
    }

    private _x: number = 0;

    get x(): number
    {
        return this._x;
    }

    set x(value: number)
    {
        if(!this._readOnly) this._x = value;
    }

    private _y: number = 0;

    get y(): number
    {
        return this._y;
    }

    set y(value: number)
    {
        if(!this._readOnly) this._y = value;
    }

    private _z: number = 0;

    get z(): number
    {
        return this._z;
    }

    set z(value: number)
    {
        if(!this._readOnly) this._z = value;
    }

    private _dir: number = 0;

    get dir(): number
    {
        return this._dir;
    }

    set dir(value: number)
    {
        if(!this._readOnly) this._dir = value;
    }

    private _name: string = '';

    get name(): string
    {
        return this._name;
    }

    set name(value: string)
    {
        if(!this._readOnly) this._name = value;
    }

    private _custom: string = '';

    get custom(): string
    {
        return this._custom;
    }

    set custom(value: string)
    {
        if(!this._readOnly) this._custom = value;
    }

    private _figure: string = '';

    get figure(): string
    {
        return this._figure;
    }

    set figure(value: string)
    {
        if(!this._readOnly) this._figure = value;
    }

    private _sex: string = 'M';

    get sex(): string
    {
        return this._sex;
    }

    set sex(value: string)
    {
        if(!this._readOnly) this._sex = value;
    }

    private _webID: number = 0;

    get webID(): number
    {
        return this._webID;
    }

    set webID(value: number)
    {
        if(!this._readOnly) this._webID = value;
    }

    private _userType: number = 1;

    get userType(): number
    {
        return this._userType;
    }

    set userType(value: number)
    {
        if(!this._readOnly) this._userType = value;
    }

    private _groupID: string = '';

    get groupID(): string
    {
        return this._groupID;
    }

    set groupID(value: string)
    {
        if(!this._readOnly) this._groupID = value;
    }

    private _groupStatus: number = 0;

    get groupStatus(): number
    {
        return this._groupStatus;
    }

    set groupStatus(value: number)
    {
        if(!this._readOnly) this._groupStatus = value;
    }

    private _groupName: string = '';

    get groupName(): string
    {
        return this._groupName;
    }

    set groupName(value: string)
    {
        if(!this._readOnly) this._groupName = value;
    }

    private _achievementScore: number = 0;

    get achievementScore(): number
    {
        return this._achievementScore;
    }

    set achievementScore(value: number)
    {
        if(!this._readOnly) this._achievementScore = value;
    }

    private _isModerator: boolean = false;

    get isModerator(): boolean
    {
        return this._isModerator;
    }

    set isModerator(value: boolean)
    {
        if(!this._readOnly) this._isModerator = value;
    }

    private _subType: string = '';

    get subType(): string
    {
        return this._subType;
    }

    set subType(value: string)
    {
        if(!this._readOnly) this._subType = value;
    }

    private _ownerId: number = 0;

    get ownerId(): number
    {
        return this._ownerId;
    }

    set ownerId(value: number)
    {
        if(!this._readOnly) this._ownerId = value;
    }

    private _ownerName: string = '';

    get ownerName(): string
    {
        return this._ownerName;
    }

    set ownerName(value: string)
    {
        if(!this._readOnly) this._ownerName = value;
    }

    private _rarityLevel: number = 0;

    get rarityLevel(): number
    {
        return this._rarityLevel;
    }

    set rarityLevel(value: number)
    {
        if(!this._readOnly) this._rarityLevel = value;
    }

    private _hasSaddle: boolean = false;

    get hasSaddle(): boolean
    {
        return this._hasSaddle;
    }

    set hasSaddle(value: boolean)
    {
        if(!this._readOnly) this._hasSaddle = value;
    }

    private _isRiding: boolean = false;

    get isRiding(): boolean
    {
        return this._isRiding;
    }

    set isRiding(value: boolean)
    {
        if(!this._readOnly) this._isRiding = value;
    }

    private _canBreed: boolean = false;

    get canBreed(): boolean
    {
        return this._canBreed;
    }

    set canBreed(value: boolean)
    {
        if(!this._readOnly) this._canBreed = value;
    }

    private _canHarvest: boolean = false;

    get canHarvest(): boolean
    {
        return this._canHarvest;
    }

    set canHarvest(value: boolean)
    {
        if(!this._readOnly) this._canHarvest = value;
    }

    private _canRevive: boolean = false;

    get canRevive(): boolean
    {
        return this._canRevive;
    }

    set canRevive(value: boolean)
    {
        if(!this._readOnly) this._canRevive = value;
    }

    private _hasBreedingPermission: boolean = false;

    get hasBreedingPermission(): boolean
    {
        return this._hasBreedingPermission;
    }

    set hasBreedingPermission(value: boolean)
    {
        if(!this._readOnly) this._hasBreedingPermission = value;
    }

    private _petLevel: number = 0;

    get petLevel(): number
    {
        return this._petLevel;
    }

    set petLevel(value: number)
    {
        if(!this._readOnly) this._petLevel = value;
    }

    private _petPosture: string = '';

    get petPosture(): string
    {
        return this._petPosture;
    }

    set petPosture(value: string)
    {
        if(!this._readOnly) this._petPosture = value;
    }

    private _botSkills: number[] = [];

    get botSkills(): number[]
    {
        return this._botSkills;
    }

    set botSkills(value: number[])
    {
        if(!this._readOnly) this._botSkills = value;
    }

    setReadOnly(): void
    {
        this._readOnly = true;
    }
}
