import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Achievement data - holds all fields for a single achievement
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/achievements/class_1724.as
 */
export class AchievementData
{
    public static readonly STATE_UNKNOWN: number = -1;
    public static readonly STATE_INACTIVE: number = 0;
    public static readonly STATE_STARTED: number = 1;
    public static readonly STATE_COMPLETED: number = 2;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._achievementId = wrapper.readInt();
        this._level = wrapper.readInt();
        this._badgeId = wrapper.readString();
        this._scoreAtStartOfLevel = wrapper.readInt();
        this._scoreLimit = Math.max(1, wrapper.readInt());
        this._levelRewardPoints = wrapper.readInt();
        this._levelRewardPointType = wrapper.readInt();
        this._currentPoints = wrapper.readInt();
        this._finalLevel = wrapper.readBoolean();
        this._category = wrapper.readString();
        this._subCategory = wrapper.readString();
        this._levelCount = wrapper.readInt();
        this._displayMethod = wrapper.readInt();
        this._state = wrapper.readShort();

        // The achievement's *family*, derived from the badge id in AS3's own constructor: drop the
        // "ACH_" prefix, then the trailing level number. "ACH_WF_Kissing3" becomes "WF_Kissing",
        // which is what the wired filter and the localization keys are written against.
        let code = this._badgeId;

        if(code.indexOf('ACH_') === 0) code = code.substr(4);

        while(code.length > 0 && '0123456789'.indexOf(code.charAt(code.length - 1)) !== -1)
        {
            code = code.substr(0, code.length - 1);
        }

        this._code = code;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2411/_SafeCls_3764.as::_code
    private _code: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2411/_SafeCls_3764.as::get code()
    get code(): string
    {
        return this._code;
    }

    private _achievementId: number = 0;

    get achievementId(): number
    {
        return this._achievementId;
    }

    private _level: number = 0;

    get level(): number
    {
        return this._level;
    }

    private _badgeId: string = '';

    get badgeId(): string
    {
        return this._badgeId;
    }

    private _scoreAtStartOfLevel: number = 0;

    get scoreAtStartOfLevel(): number
    {
        return this._scoreAtStartOfLevel;
    }

    private _scoreLimit: number = 0;

    get scoreLimit(): number
    {
        return this._scoreLimit - this._scoreAtStartOfLevel;
    }

    private _levelRewardPoints: number = 0;

    get levelRewardPoints(): number
    {
        return this._levelRewardPoints;
    }

    private _levelRewardPointType: number = 0;

    get levelRewardPointType(): number
    {
        return this._levelRewardPointType;
    }

    private _currentPoints: number = 0;

    get currentPoints(): number
    {
        return this._currentPoints - this._scoreAtStartOfLevel;
    }

    private _finalLevel: boolean = false;

    get finalLevel(): boolean
    {
        return this._finalLevel;
    }

    private _category: string = '';

    get category(): string
    {
        return this._category;
    }

    private _subCategory: string = '';

    get subCategory(): string
    {
        return this._subCategory;
    }

    private _levelCount: number = 0;

    get levelCount(): number
    {
        return this._levelCount;
    }

    private _displayMethod: number = 0;

    get displayMethod(): number
    {
        return this._displayMethod;
    }

    private _state: number = 0;

    get state(): number
    {
        return this._state;
    }

    get firstLevelAchieved(): boolean
    {
        return this._level > 1 || this._finalLevel;
    }

    setMaxProgress(): void
    {
        this._currentPoints = this._scoreLimit;
    }
}
