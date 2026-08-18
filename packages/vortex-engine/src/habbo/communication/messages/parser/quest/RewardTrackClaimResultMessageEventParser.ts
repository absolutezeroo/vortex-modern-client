import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The answer to claiming a reward-track prize.
 *
 * **The name is DERIVED** — named for its handler,
 * `RewardTrackController.onRewardTrackClaimResult()`. See `RewardTrackTaskReward` for why nothing
 * corroborates it.
 *
 * **Only `SUCCESS` has a name in AS3.** The other eight are `_SafeStr_N` constants, and the
 * controller never compares against them individually — it tests `resultCode != 0` and appends the
 * number to `reward_track.claim.notification.fail.` to pick a localization key. They are kept as
 * numbered constants for that reason; inventing names would be guessing at meanings the client
 * itself does not use.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2623/_SafeCls_2641.as
 */
export class RewardTrackClaimResultMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_2641.as::SUCCESS
    public static readonly SUCCESS: number = 0;

    /** Derived name — obfuscated in AS3; see the class note. */
    // AS3: _SafeCls_2641.as::_SafeStr_10272
    public static readonly FAILURE_1: number = 1;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_2641.as::_SafeStr_10385
    public static readonly FAILURE_2: number = 2;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_2641.as::_SafeStr_11015
    public static readonly FAILURE_3: number = 3;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_2641.as::_SafeStr_10315
    public static readonly FAILURE_4: number = 4;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_2641.as::_SafeStr_11204
    public static readonly FAILURE_5: number = 5;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_2641.as::_SafeStr_11518
    public static readonly FAILURE_6: number = 6;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_2641.as::_SafeStr_10451
    public static readonly FAILURE_7: number = 7;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_2641.as::_SafeStr_10698
    public static readonly FAILURE_8: number = 8;

    // AS3: _SafeCls_2641.as::_SafeStr_7925
    private _trackId: string = '';

    // AS3: _SafeCls_2641.as::_SafeStr_7604
    private _rewardId: string = '';

    // AS3: _SafeCls_2641.as::_SafeStr_6204
    private _resultCode: number = 0;

    // AS3: _SafeCls_2641.as::get trackId()
    get trackId(): string
    {
        return this._trackId;
    }

    // AS3: _SafeCls_2641.as::get rewardId()
    get rewardId(): string
    {
        return this._rewardId;
    }

    // AS3: _SafeCls_2641.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    // AS3: _SafeCls_2641.as::flush()
    flush(): boolean
    {
        this._trackId = '';
        this._rewardId = '';
        this._resultCode = 0;

        return true;
    }

    // AS3: _SafeCls_2641.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._trackId = wrapper.readString();
        this._rewardId = wrapper.readString();
        this._resultCode = wrapper.readInt();

        return true;
    }
}
