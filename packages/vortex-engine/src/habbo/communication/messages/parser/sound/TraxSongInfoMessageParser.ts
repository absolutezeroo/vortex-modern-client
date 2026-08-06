import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * One song's metadata as it arrives on the wire.
 *
 * AS3 splits this over two classes — a base carrying id/length/name/creator, and a subclass adding
 * the Trax `data` string — because the base is also what `SongDataEntry` extends. Both are
 * obfuscated (`_SafeCls_2388` / `_SafeCls_2390`) and both live in the message package, so they are
 * merged here into the one record the parser produces; `SongDataEntry` copies the fields it needs
 * rather than extending it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2389/_SafeCls_2390.as
 */
export class SongData
{
    // AS3: .../_SafeCls_2388.as::_id
    readonly id: number;

    // AS3: .../_SafeCls_2388.as::_length
    readonly length: number;

    // AS3: .../_SafeCls_2388.as::_songName
    readonly name: string;

    // AS3: .../_SafeCls_2388.as::_creator
    readonly creator: string;

    // AS3: .../_SafeCls_2390.as::get data()
    readonly data: string;

    // AS3: .../_SafeCls_2390.as::_SafeCls_2390()
    constructor(id: number, length: number, name: string, creator: string, data: string)
    {
        this.id = id;
        this.length = length;
        this.name = name;
        this.creator = creator;
        this.data = data;
    }
}

/**
 * The answer to `GetSongInfoMessageComposer`: metadata for a batch of songs.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/sound/TraxSongInfoMessageEventParser.as
 * (obfuscated as `_SafeCls_2898` in the primary tree)
 */
export class TraxSongInfoMessageParser implements IMessageParser
{
    private _songs: SongData[] = [];

    // AS3: .../TraxSongInfoMessageEventParser.as::get songs()
    get songs(): SongData[]
    {
        return this._songs;
    }

    // AS3: .../TraxSongInfoMessageEventParser.as::flush()
    flush(): boolean
    {
        this._songs = [];

        return true;
    }

    /**
     * AS3: .../TraxSongInfoMessageEventParser.as::parse()
     *
     * Six fields per song, and note the order: **id, an unread string, name, data, length,
     * creator** — the constructor is then called as `(id, length, name, creator, data)`, which
     * reorders them. The second field is read and dropped by AS3 as well; skipping the read
     * instead would desynchronise every following song.
     */
    parse(wrapper: IMessageDataWrapper): boolean
    {
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const id = wrapper.readInt();

            wrapper.readString();

            const name = wrapper.readString();
            const data = wrapper.readString();
            const length = wrapper.readInt();
            const creator = wrapper.readString();

            this._songs.push(new SongData(id, length, name, creator, data));
        }

        return true;
    }
}
