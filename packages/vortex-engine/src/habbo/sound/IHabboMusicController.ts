import type EventEmitter from 'eventemitter3';
import type {IPlayListController} from './IPlayListController';
import type {ISongInfo} from './ISongInfo';

/**
 * Owns everything that plays a *song* rather than an effect: the room jukebox, the user's
 * play list, single-song playback and purchase previews, arbitrated by
 * `HabboMusicPrioritiesEnum`.
 *
 * The class name is recovered from `PRODUCTION-201601012205-226667486`
 * (`IHabboMusicController`); WIN63 has it as `_SafeCls_2082` with every member readable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/_SafeCls_2082.as
 */
export interface IHabboMusicController
{
    // AS3: .../sound/_SafeCls_2082.as::getRoomItemPlaylist()
    getRoomItemPlaylist(itemId?: number): IPlayListController | null;

    // AS3: .../sound/_SafeCls_2082.as::getSongDiskInventorySize()
    getSongDiskInventorySize(): number;

    // AS3: .../sound/_SafeCls_2082.as::getSongDiskInventoryDiskId()
    getSongDiskInventoryDiskId(index: number): number;

    // AS3: .../sound/_SafeCls_2082.as::getSongDiskInventorySongId()
    getSongDiskInventorySongId(index: number): number;

    // AS3: .../sound/_SafeCls_2082.as::getSongInfo()
    getSongInfo(songId: number): ISongInfo | null;

    // AS3: .../sound/_SafeCls_2082.as::getSongIdPlayingAtPriority()
    getSongIdPlayingAtPriority(priority: number): number;

    // AS3: .../sound/_SafeCls_2082.as::playSong()
    playSong(
        songId: number,
        priority: number,
        startPosition?: number,
        playLength?: number,
        fadeInSeconds?: number,
        fadeOutSeconds?: number
    ): boolean;

    // AS3: .../sound/_SafeCls_2082.as::stop()
    stop(priority: number): void;

    // AS3: .../sound/_SafeCls_2082.as::addSongInfoRequest()
    addSongInfoRequest(songId: number): void;

    // AS3: .../sound/_SafeCls_2082.as::requestSongInfoWithoutSamples()
    requestSongInfoWithoutSamples(songId: number): void;

    // AS3: .../sound/_SafeCls_2082.as::requestUserSongDisks()
    requestUserSongDisks(): void;

    // AS3: .../sound/_SafeCls_2082.as::onSongLoaded()
    onSongLoaded(songId: number): void;

    // AS3: .../sound/_SafeCls_2082.as::updateVolume()
    updateVolume(volume: number): void;

    // AS3: .../sound/_SafeCls_2082.as::samplesUnloaded()
    samplesUnloaded(sampleIds: number[]): void;

    // AS3: .../sound/_SafeCls_2082.as::get samplesIdsInUse()
    get samplesIdsInUse(): number[];

    // AS3: .../sound/_SafeCls_2082.as::get events()
    get events(): EventEmitter;

    // AS3: .../sound/_SafeCls_2082.as::dispose()
    dispose(): void;
}
