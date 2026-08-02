import type {IDisposable} from '@core/runtime/IDisposable';
import type {ISongInfo} from './ISongInfo';

/**
 * A play list the music controller can run: the room's jukebox, or the user's own.
 *
 * The class name is recovered from `PRODUCTION-201601012205-226667486`
 * (`IPlayListController`); WIN63 has it as `_SafeCls_2657` with every member readable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/_SafeCls_2657.as
 */
export interface IPlayListController extends IDisposable
{
    // AS3: .../sound/_SafeCls_2657.as::get priority()
    get priority(): number;

    // AS3: .../sound/_SafeCls_2657.as::get length()
    get length(): number;

    // AS3: .../sound/_SafeCls_2657.as::get playPosition()
    get playPosition(): number;

    // AS3: .../sound/_SafeCls_2657.as::get nowPlayingSongId()
    get nowPlayingSongId(): number;

    // AS3: .../sound/_SafeCls_2657.as::get isPlaying()
    get isPlaying(): boolean;

    // AS3: .../sound/_SafeCls_2657.as::getEntry()
    getEntry(index: number): ISongInfo | null;

    // AS3: .../sound/_SafeCls_2657.as::requestPlayList()
    requestPlayList(): void;
}
