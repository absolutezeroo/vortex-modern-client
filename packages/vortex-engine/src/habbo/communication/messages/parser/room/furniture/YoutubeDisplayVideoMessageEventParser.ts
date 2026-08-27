import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the YouTube display's current video: which furni, which video, the trim points (both
 * zero when the whole video plays), and the player state to resume into
 * (`YoutubePlayerStateEnum`).
 *
 * The real name is recovered from `sources/win63_version/habbo/communication/messages/parser/
 * room/furniture/YoutubeDisplayVideoMessageEventParser.as` — obfuscated as `_SafeCls_4078` in the
 * primary tree. Field read order matches the primary tree exactly.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as
 */
export class YoutubeDisplayVideoMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::_SafeStr_6628
    private _furniId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::_SafeStr_10040
    private _videoId: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::_SafeStr_10151
    private _startAtSeconds: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::_SafeStr_9665
    private _endAtSeconds: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::_SafeStr_4597
    private _state: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::get furniId()
    get furniId(): number
    {
        return this._furniId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::get videoId()
    get videoId(): string
    {
        return this._videoId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::get startAtSeconds()
    get startAtSeconds(): number
    {
        return this._startAtSeconds;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::get endAtSeconds()
    get endAtSeconds(): number
    {
        return this._endAtSeconds;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::get state()
    get state(): number
    {
        return this._state;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4078.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._furniId = wrapper.readInt();
        this._videoId = wrapper.readString();
        this._startAtSeconds = wrapper.readInt();
        this._endAtSeconds = wrapper.readInt();
        this._state = wrapper.readInt();

        return true;
    }
}
