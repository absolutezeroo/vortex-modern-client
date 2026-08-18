import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The answer to buying a reward track's premium tier, and the point total it leaves behind.
 *
 * **The name is DERIVED** — named for its handler,
 * `RewardTrackController.onRewardTrackPremiumPurchaseResult()`.
 *
 * Nine unnamed failure codes, same story as the claim result: the controller only tests
 * `resultCode != 0` and appends the number to `reward_track.premium.notification.fail.`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2623/_SafeCls_3538.as
 */
export class RewardTrackPremiumPurchaseResultMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_3538.as::SUCCESS
    public static readonly SUCCESS: number = 0;

    /** Derived name — obfuscated in AS3; see the class note. */
    // AS3: _SafeCls_3538.as::_SafeStr_10272
    public static readonly FAILURE_1: number = 1;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_3538.as::_SafeStr_10385
    public static readonly FAILURE_2: number = 2;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_3538.as::_SafeStr_10315
    public static readonly FAILURE_3: number = 3;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_3538.as::_SafeStr_11286
    public static readonly FAILURE_4: number = 4;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_3538.as::_SafeStr_11294
    public static readonly FAILURE_5: number = 5;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_3538.as::_SafeStr_11609
    public static readonly FAILURE_6: number = 6;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_3538.as::_SafeStr_11009
    public static readonly FAILURE_7: number = 7;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_3538.as::_SafeStr_10775
    public static readonly FAILURE_8: number = 8;

    /** Derived name — obfuscated in AS3. */
    // AS3: _SafeCls_3538.as::_SafeStr_10451
    public static readonly FAILURE_9: number = 9;

    // AS3: _SafeCls_3538.as::_SafeStr_7925
    private _trackId: string = '';

    // AS3: _SafeCls_3538.as::_SafeStr_6204
    private _resultCode: number = 0;

    // AS3: _SafeCls_3538.as::_SafeStr_6600
    private _points: number = 0;

    // AS3: _SafeCls_3538.as::get trackId()
    get trackId(): string
    {
        return this._trackId;
    }

    // AS3: _SafeCls_3538.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    // AS3: _SafeCls_3538.as::get points()
    get points(): number
    {
        return this._points;
    }

    // AS3: _SafeCls_3538.as::flush()
    flush(): boolean
    {
        this._trackId = '';
        this._resultCode = 0;
        this._points = 0;

        return true;
    }

    // AS3: _SafeCls_3538.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._trackId = wrapper.readString();
        this._resultCode = wrapper.readInt();
        this._points = wrapper.readInt();

        return true;
    }
}
