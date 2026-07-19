import type {IPetInfo} from './IPetInfo';

/**
 * Pet info implementation
 *
 * @see source_as_win63/habbo/session/PetInfo.as
 */
export class PetInfo implements IPetInfo
{
    private _petId: number = 0;

    get petId(): number
    {
        return this._petId;
    }

    set petId(value: number)
    {
        this._petId = value;
    }

    private _level: number = 0;

    get level(): number
    {
        return this._level;
    }

    set level(value: number)
    {
        this._level = value;
    }

    private _levelMax: number = 0;

    get levelMax(): number
    {
        return this._levelMax;
    }

    set levelMax(value: number)
    {
        this._levelMax = value;
    }

    private _experience: number = 0;

    get experience(): number
    {
        return this._experience;
    }

    set experience(value: number)
    {
        this._experience = value;
    }

    private _experienceMax: number = 0;

    get experienceMax(): number
    {
        return this._experienceMax;
    }

    set experienceMax(value: number)
    {
        this._experienceMax = value;
    }

    private _energy: number = 0;

    get energy(): number
    {
        return this._energy;
    }

    set energy(value: number)
    {
        this._energy = value;
    }

    private _energyMax: number = 0;

    get energyMax(): number
    {
        return this._energyMax;
    }

    set energyMax(value: number)
    {
        this._energyMax = value;
    }

    private _nutrition: number = 0;

    get nutrition(): number
    {
        return this._nutrition;
    }

    set nutrition(value: number)
    {
        this._nutrition = value;
    }

    private _nutritionMax: number = 0;

    get nutritionMax(): number
    {
        return this._nutritionMax;
    }

    set nutritionMax(value: number)
    {
        this._nutritionMax = value;
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

    private _respect: number = 0;

    get respect(): number
    {
        return this._respect;
    }

    set respect(value: number)
    {
        this._respect = value;
    }

    private _age: number = 0;

    get age(): number
    {
        return this._age;
    }

    set age(value: number)
    {
        this._age = value;
    }

    private _breedId: number = 0;

    get breedId(): number
    {
        return this._breedId;
    }

    set breedId(value: number)
    {
        this._breedId = value;
    }

    private _hasFreeSaddle: boolean = false;

    get hasFreeSaddle(): boolean
    {
        return this._hasFreeSaddle;
    }

    set hasFreeSaddle(value: boolean)
    {
        this._hasFreeSaddle = value;
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

    private _rarityLevel: number = 0;

    get rarityLevel(): number
    {
        return this._rarityLevel;
    }

    set rarityLevel(value: number)
    {
        this._rarityLevel = value;
    }

    private _skillTresholds: number[] = [];

    get skillTresholds(): number[]
    {
        return this._skillTresholds;
    }

    set skillTresholds(value: number[])
    {
        this._skillTresholds = value;
    }

    private _accessRights: number = 0;

    get accessRights(): number
    {
        return this._accessRights;
    }

    set accessRights(value: number)
    {
        this._accessRights = value;
    }

    private _maxWellBeingSeconds: number = 0;

    get maxWellBeingSeconds(): number
    {
        return this._maxWellBeingSeconds;
    }

    set maxWellBeingSeconds(value: number)
    {
        this._maxWellBeingSeconds = value;
    }

    private _remainingWellBeingSeconds: number = 0;

    get remainingWellBeingSeconds(): number
    {
        return this._remainingWellBeingSeconds;
    }

    set remainingWellBeingSeconds(value: number)
    {
        this._remainingWellBeingSeconds = value;
    }

    private _remainingGrowingSeconds: number = 0;

    get remainingGrowingSeconds(): number
    {
        return this._remainingGrowingSeconds;
    }

    set remainingGrowingSeconds(value: number)
    {
        this._remainingGrowingSeconds = value;
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

    private _adultLevel: number = 0;

    get adultLevel(): number
    {
        return this._adultLevel;
    }

    set adultLevel(value: number)
    {
        this._adultLevel = value;
    }
}
