import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {SongData} from './TraxSongInfoMessageParser';

/**
 * One song appended to a sound machine's play list.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/sound/PlayListSongAddedMessageEventParser.as
 * (obfuscated as `_SafeCls_4161` in the primary tree)
 */
export class PlayListSongAddedMessageParser implements IMessageParser
{
    private _entry: SongData | null = null;

    // AS3: .../PlayListSongAddedMessageEventParser.as::get entry()
    get entry(): SongData | null
    {
        return this._entry;
    }

    // AS3: .../PlayListSongAddedMessageEventParser.as::flush()
    flush(): boolean
    {
        this._entry = null;

        return true;
    }

    // AS3: .../PlayListSongAddedMessageEventParser.as::parse()
    // id, length, name, creator — the same four fields, and the same order, as a play-list entry.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        const id = wrapper.readInt();
        const length = wrapper.readInt();
        const name = wrapper.readString();
        const creator = wrapper.readString();

        this._entry = new SongData(id, length, name, creator, '');

        return true;
    }
}
