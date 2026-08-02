import type {IHabboSound} from './IHabboSound';

/**
 * One Trax song: its metadata, and the sequencer instance once its samples have loaded.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/ISongInfo.as
 */
export interface ISongInfo
{
    // AS3: .../sound/ISongInfo.as::get loaded()
    get loaded(): boolean;

    // AS3: .../sound/ISongInfo.as::get id()
    get id(): number;

    // AS3: .../sound/ISongInfo.as::get diskId()
    get diskId(): number;

    // AS3: .../sound/ISongInfo.as::get length()
    get length(): number;

    // AS3: .../sound/ISongInfo.as::get name()
    get name(): string;

    // AS3: .../sound/ISongInfo.as::get creator()
    get creator(): string;

    // AS3: .../sound/ISongInfo.as::get songData()
    get songData(): string;

    // AS3: .../sound/ISongInfo.as::get soundObject()
    get soundObject(): IHabboSound | null;
}
