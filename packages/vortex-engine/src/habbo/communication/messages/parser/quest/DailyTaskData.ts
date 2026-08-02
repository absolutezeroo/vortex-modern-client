import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {DailyTaskRewardData} from './DailyTaskRewardData';

/**
 * A single daily task, as carried by both the active-list (1824) and tasks-added (2506) messages.
 *
 * **The class name is derived, not recovered.** The type is obfuscated in every available tree
 * (`_SafeCls_2991` in the primary dump, `class_3417` in `win63_version`, absent from the 2016
 * PRODUCTION build), so only its member names survive. `DailyTaskData` follows this folder's own
 * `*Data` convention for parser-side DTOs.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as
 */
export class DailyTaskData
{
    /**
	 * **The three status names are derived, not recovered** — they are `_SafeStr_10175` /
	 * `_SafeStr_8608` / `_SafeStr_10290` in the primary dump and `var_5180` / `var_3480` /
	 * `var_5228` in `win63_version`. The values come from
	 * habbo/quest/dailytasks/DailyTasksController.as::onTaskUpdated(), which raises
	 * "dailytasks.completed.caption" on 1 and "dailytasks.claimed.caption" on 2, and from
	 * `isExpired`, which treats 0 as the not-yet-finished state.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::_SafeStr_10175
    static readonly STATUS_ACTIVE: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::_SafeStr_8608
    static readonly STATUS_COMPLETED: number = 1;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::_SafeStr_10290
    static readonly STATUS_CLAIMED: number = 2;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::_SafeCls_2991()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._receiveTime = new Date();

        this._taskId = wrapper.readLong();
        this._taskCode = wrapper.readString();
        this._questTypeCode = wrapper.readString();
        this._isBonus = wrapper.readBoolean();
        this._imageVersion = wrapper.readString();
        this._catalogName = wrapper.readString();
        this._requiredRepeats = wrapper.readInt();
        this._repeats = wrapper.readInt();
        this._status = wrapper.readByte();
        this._secondsLeft = wrapper.readInt();

        const rewardCount = wrapper.readInt();

        for(let i = 0; i < rewardCount; i++)
        {
            this._rewards.push(new DailyTaskRewardData(wrapper));
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::taskId
    private _taskId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get taskId()
    get taskId(): number
    {
        return this._taskId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::taskCode
    private _taskCode: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get taskCode()
    get taskCode(): string
    {
        return this._taskCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::questTypeCode
    private _questTypeCode: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get questTypeCode()
    get questTypeCode(): string
    {
        return this._questTypeCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::isBonus
    private _isBonus: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get isBonus()
    get isBonus(): boolean
    {
        return this._isBonus;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::imageVersion
    private _imageVersion: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get imageVersion()
    get imageVersion(): string
    {
        return this._imageVersion;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::catalogName
    private _catalogName: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get catalogName()
    get catalogName(): string
    {
        return this._catalogName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::requiredRepeats
    private _requiredRepeats: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get requiredRepeats()
    get requiredRepeats(): number
    {
        return this._requiredRepeats;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::repeats
    private _repeats: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get repeats()
    get repeats(): number
    {
        return this._repeats;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::set repeats()
    set repeats(value: number)
    {
        this._repeats = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::status
    private _status: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get status()
    get status(): number
    {
        return this._status;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::set status()
    set status(value: number)
    {
        this._status = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::secondsLeft
    private _secondsLeft: number = 0;

    /**
	 * Counts down from the value on the wire: the server sends a duration, and AS3 subtracts the
	 * time elapsed since the packet arrived rather than re-asking.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get secondsLeft()
    get secondsLeft(): number
    {
        if(this._secondsLeft <= 0) return 0;

        const elapsed = Math.trunc((new Date().getTime() - this._receiveTime.getTime()) / 1000);

        return this._secondsLeft - elapsed;
    }

    /**
	 * Reads the raw wire value, not the `secondsLeft` getter above — a task whose countdown has
	 * merely run out reports 0 there, while a task the server already sent as negative is the
	 * expired one.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get isExpired()
    get isExpired(): boolean
    {
        return this._secondsLeft < 0 && this._status !== DailyTaskData.STATUS_ACTIVE;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::rewards
    private _rewards: DailyTaskRewardData[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get rewards()
    get rewards(): DailyTaskRewardData[]
    {
        return this._rewards;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as — the
    // `Date` field stamped at construction and read only by `secondsLeft`. Its identifier is
    // obfuscated in every tree (`_SafeStr_7817` here, `var_2926` in win63_version) and AS3 exposes
    // no accessor for it, so `_receiveTime` is a derived name for a member that stays private.
    private _receiveTime: Date;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get nameLocalizationKey()
    get nameLocalizationKey(): string
    {
        return 'dailytask.' + this._taskCode + '.name';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get descriptionLocalizationKey()
    get descriptionLocalizationKey(): string
    {
        return 'dailytask.' + this._taskCode + '.desc';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_2991.as::get hintLocalizationKey()
    get hintLocalizationKey(): string
    {
        return 'dailytask.' + this._taskCode + '.hint';
    }
}
