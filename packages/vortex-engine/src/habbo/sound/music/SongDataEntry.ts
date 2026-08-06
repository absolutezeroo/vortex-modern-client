import type {ISongInfo} from '../ISongInfo';
import type {IHabboSound} from '../IHabboSound';

/**
 * One song in the controller's cache: its metadata, plus the sequencer instance once the samples
 * have been loaded.
 *
 * AS3 extends the message package's song record and re-declares the four inherited getters
 * verbatim; here the fields are held directly, because that base is a parser DTO
 * (see `TraxSongInfoMessageParser`'s `SongData`) and this is engine state.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/music/SongDataEntry.as
 */
export class SongDataEntry implements ISongInfo
{
    // AS3: .../SongDataEntry.as::_id (inherited)
    private _id: number;

    // AS3: .../SongDataEntry.as::_length (inherited)
    private _length: number;

    // AS3: .../SongDataEntry.as::_songName (inherited)
    private _name: string;

    // AS3: .../SongDataEntry.as::_creator (inherited)
    private _creator: string;

    // AS3: .../SongDataEntry.as::_soundObject
    private _soundObject: IHabboSound | null = null;

    // AS3: .../SongDataEntry.as::_songData
    private _songData: string = '';

    // AS3: .../SongDataEntry.as::_diskId
    private _diskId: number = -1;

    // AS3: .../SongDataEntry.as::SongDataEntry()
    constructor(id: number, length: number, name: string, creator: string, soundObject: IHabboSound | null)
    {
        this._id = id;
        this._length = length;
        this._name = name;
        this._creator = creator;
        this._soundObject = soundObject;
    }

    // AS3: .../SongDataEntry.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../SongDataEntry.as::get length()
    get length(): number
    {
        return this._length;
    }

    // AS3: .../SongDataEntry.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../SongDataEntry.as::get creator()
    get creator(): string
    {
        return this._creator;
    }

    // AS3: .../SongDataEntry.as::get loaded()
    // AS3's `_soundObject?.ready` — undefined when there is no sound object, which is falsy there
    // and is normalised to false here.
    get loaded(): boolean
    {
        return this._soundObject?.ready ?? false;
    }

    // AS3: .../SongDataEntry.as::get soundObject()
    get soundObject(): IHabboSound | null
    {
        return this._soundObject;
    }

    // AS3: .../SongDataEntry.as::set soundObject()
    set soundObject(value: IHabboSound | null)
    {
        this._soundObject = value;
    }

    // AS3: .../SongDataEntry.as::get songData()
    get songData(): string
    {
        return this._songData;
    }

    // AS3: .../SongDataEntry.as::set songData()
    set songData(value: string)
    {
        this._songData = value;
    }

    // AS3: .../SongDataEntry.as::get diskId()
    get diskId(): number
    {
        return this._diskId;
    }

    // AS3: .../SongDataEntry.as::set diskId()
    set diskId(value: number)
    {
        this._diskId = value;
    }
}
