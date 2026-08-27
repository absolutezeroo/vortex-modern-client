import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses a server-driven playback command for a YouTube display — the server telling the client's
 * player to react (see `YoutubeDisplayWidget.controlVideo()`), the counterpart of the client's own
 * `ControlYoutubeDisplayPlaybackMessageComposer`.
 *
 * The real name is recovered from `sources/win63_version/habbo/communication/messages/parser/
 * room/furniture/YoutubeControlVideoMessageEventParser.as` — obfuscated as `_SafeCls_4338` in the
 * primary tree. Field read order matches the primary tree exactly.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4338.as
 */
export class YoutubeControlVideoMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4338.as::_SafeStr_6628
    private _furniId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4338.as::_SafeStr_7819
    private _commandId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4338.as::get furniId()
    get furniId(): number
    {
        return this._furniId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4338.as::get commandId()
    get commandId(): number
    {
        return this._commandId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4338.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4338.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._furniId = wrapper.readInt();
        this._commandId = wrapper.readInt();

        return true;
    }
}
