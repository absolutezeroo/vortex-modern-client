import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {RewardTrackData} from './RewardTrackData';

/**
 * Every reward track the user can see, plus the two flags the controller reads before showing
 * anything: `disabled` switches the feature off hotel-wide, `reload` asks the view to rebuild
 * rather than patch.
 *
 * **The name is DERIVED** — named for its handler, `RewardTrackController.onRewardTracks()`, which
 * is unobfuscated. See `RewardTrackTaskReward` for why nothing corroborates it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2623/_SafeCls_2622.as
 */
export class RewardTracksMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_2622.as::_SafeStr_6948
    private _disabled: boolean = false;

    // AS3: _SafeCls_2622.as::_SafeStr_5633
    private _tracks: RewardTrackData[] | null = null;

    // AS3: _SafeCls_2622.as::_SafeStr_8171
    private _reload: boolean = false;

    // AS3: _SafeCls_2622.as::get disabled()
    get disabled(): boolean
    {
        return this._disabled;
    }

    // AS3: _SafeCls_2622.as::get tracks()
    get tracks(): RewardTrackData[] | null
    {
        return this._tracks;
    }

    // AS3: _SafeCls_2622.as::get reload()
    get reload(): boolean
    {
        return this._reload;
    }

    // AS3: _SafeCls_2622.as::flush()
    flush(): boolean
    {
        this._disabled = false;
        this._tracks = null;
        this._reload = false;

        return true;
    }

    // AS3: _SafeCls_2622.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._disabled = wrapper.readBoolean();
        this._tracks = [];

        const count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this._tracks.push(new RewardTrackData(wrapper));
        }

        this._reload = wrapper.readBoolean();

        return true;
    }
}
