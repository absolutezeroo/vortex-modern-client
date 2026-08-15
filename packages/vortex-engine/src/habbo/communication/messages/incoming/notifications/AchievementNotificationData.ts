import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for achievement notification information
 *
 * Parses achievement data from the message wrapper including type, level,
 * points, badge info, and category.
 *
 * **The last two fields were added in the 2026 build** and this port stopped at `showDialogToUser`,
 * silently dropping them — vortex-emulator has been writing both all along
 * (`HabboAchievementNotificationMessageComposerSerializer`). They are what
 * `BadgesModel.updateBadge()` needs to keep a badge's rarity bracket current.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2010/_SafeCls_3576.as
 * (name recovered from sources/win63_version/.../incoming/notifications/class_1681.as)
 */
export class AchievementNotificationData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._type = wrapper.readInt();
        this._level = wrapper.readInt();
        this._badgeId = wrapper.readInt();
        this._badgeCode = wrapper.readString();
        this._points = wrapper.readInt();
        this._levelRewardPoints = wrapper.readInt();
        this._levelRewardPointType = wrapper.readInt();
        this._bonusPoints = wrapper.readInt();
        this._achievementID = wrapper.readInt();
        this._removedBadgeCode = wrapper.readString();
        this._category = wrapper.readString();
        this._showDialogToUser = wrapper.readBoolean();
        this._ownerCount = wrapper.readInt();
        this._badgeRarityId = wrapper.readInt();
    }

    // AS3: _SafeCls_3576.as::_SafeStr_4788 (name derived: backs ownerCount)
    private _ownerCount: number = 0;

    // AS3: _SafeCls_3576.as::_SafeStr_7592 (name derived: backs badgeRarityId)
    private _badgeRarityId: number = 0;

    private _type: number = 0;

    get type(): number
    {
        return this._type;
    }

    private _level: number = 0;

    get level(): number
    {
        return this._level;
    }

    private _badgeId: number = 0;

    get badgeId(): number
    {
        return this._badgeId;
    }

    private _badgeCode: string = '';

    get badgeCode(): string
    {
        return this._badgeCode;
    }

    private _points: number = 0;

    get points(): number
    {
        return this._points;
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

    private _bonusPoints: number = 0;

    get bonusPoints(): number
    {
        return this._bonusPoints;
    }

    private _achievementID: number = 0;

    get achievementID(): number
    {
        return this._achievementID;
    }

    private _removedBadgeCode: string = '';

    get removedBadgeCode(): string
    {
        return this._removedBadgeCode;
    }

    private _category: string = '';

    get category(): string
    {
        return this._category;
    }

    private _showDialogToUser: boolean = false;

    get showDialogToUser(): boolean
    {
        return this._showDialogToUser;
    }

    // AS3: _SafeCls_3576.as::get ownerCount()
    get ownerCount(): number
    {
        return this._ownerCount;
    }

    // AS3: _SafeCls_3576.as::get badgeRarityId()
    get badgeRarityId(): number
    {
        return this._badgeRarityId;
    }
}
