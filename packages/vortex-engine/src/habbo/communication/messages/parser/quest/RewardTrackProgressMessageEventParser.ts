import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * One task moved: its new progress count, and the track's new point total.
 *
 * **The name is DERIVED** — named for its handler,
 * `RewardTrackController.onRewardTrackProgress()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2623/_SafeCls_3769.as
 */
export class RewardTrackProgressMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_3769.as::_SafeStr_7925
    private _trackId: string = '';

    // AS3: _SafeCls_3769.as::_SafeStr_7852
    private _taskId: string = '';

    // AS3: _SafeCls_3769.as::_SafeStr_6082
    private _progressCount: number = 0;

    // AS3: _SafeCls_3769.as::_SafeStr_6600
    private _points: number = 0;

    // AS3: _SafeCls_3769.as::get trackId()
    get trackId(): string
    {
        return this._trackId;
    }

    // AS3: _SafeCls_3769.as::get taskId()
    get taskId(): string
    {
        return this._taskId;
    }

    // AS3: _SafeCls_3769.as::get progressCount()
    get progressCount(): number
    {
        return this._progressCount;
    }

    // AS3: _SafeCls_3769.as::get points()
    get points(): number
    {
        return this._points;
    }

    // AS3: _SafeCls_3769.as::flush()
    flush(): boolean
    {
        this._trackId = '';
        this._taskId = '';
        this._progressCount = 0;
        this._points = 0;

        return true;
    }

    // AS3: _SafeCls_3769.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._trackId = wrapper.readString();
        this._taskId = wrapper.readString();
        this._progressCount = wrapper.readInt();
        this._points = wrapper.readInt();

        return true;
    }
}
