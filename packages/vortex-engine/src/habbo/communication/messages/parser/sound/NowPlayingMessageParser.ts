import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * What a jukebox is playing right now, and what comes next. `syncCount` is how far into the
 * current song the room already is, in milliseconds — it is what keeps everyone in the room
 * hearing the same bar.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/sound/NowPlayingMessageEventParser.as
 * (obfuscated as `_SafeCls_4056` in the primary tree)
 */
export class NowPlayingMessageParser implements IMessageParser
{
    private _currentSongId: number = -1;

    // AS3: .../NowPlayingMessageEventParser.as::get currentSongId()
    get currentSongId(): number
    {
        return this._currentSongId;
    }

    private _currentPosition: number = -1;

    // AS3: .../NowPlayingMessageEventParser.as::get currentPosition()
    get currentPosition(): number
    {
        return this._currentPosition;
    }

    private _nextSongId: number = -1;

    // AS3: .../NowPlayingMessageEventParser.as::get nextSongId()
    get nextSongId(): number
    {
        return this._nextSongId;
    }

    private _nextPosition: number = -1;

    // AS3: .../NowPlayingMessageEventParser.as::get nextPosition()
    get nextPosition(): number
    {
        return this._nextPosition;
    }

    private _syncCount: number = -1;

    // AS3: .../NowPlayingMessageEventParser.as::get syncCount()
    get syncCount(): number
    {
        return this._syncCount;
    }

    // AS3: .../NowPlayingMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../NowPlayingMessageEventParser.as::parse()
    // Five ints, in this order — the two "next" fields sit between the current song and the
    // synchronisation count.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._currentSongId = wrapper.readInt();
        this._currentPosition = wrapper.readInt();
        this._nextSongId = wrapper.readInt();
        this._nextPosition = wrapper.readInt();
        this._syncCount = wrapper.readInt();

        return true;
    }
}
