import type EventEmitter from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';
import type {IPlayListController} from '../IPlayListController';
import type {ISongInfo} from '../ISongInfo';
import type {HabboSoundManagerFlash10} from '../HabboSoundManagerFlash10';
import type {HabboMusicController} from './HabboMusicController';
import {SongDataEntry} from './SongDataEntry';
import {PlayListStatusEvent} from '../events/PlayListStatusEvent';
import {SongInfoReceivedEvent} from '../events/SongInfoReceivedEvent';
import {PlayListMessageEvent} from '@habbo/communication/messages/incoming/sound/PlayListMessageEvent';
import {
    PlayListSongAddedMessageEvent
} from '@habbo/communication/messages/incoming/sound/PlayListSongAddedMessageEvent';
import type {PlayListMessageParser} from '@habbo/communication/messages/parser/sound/PlayListMessageParser';
import type {
    PlayListSongAddedMessageParser
} from '@habbo/communication/messages/parser/sound/PlayListSongAddedMessageParser';
import type {SongData} from '@habbo/communication/messages/parser/sound/TraxSongInfoMessageParser';
import {
    GetSoundMachinePlayListMessageComposer
} from '@habbo/communication/messages/outgoing/sound/GetSoundMachinePlayListMessageComposer';

const log = Logger.getLogger('habbo.sound.music.SoundMachinePlayListController');

/**
 * A room sound machine's play list. Unlike the jukebox this one chooses its own next track: it
 * plays through the list and wraps around, driven by the song-complete event.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/music/SoundMachinePlayListController.as
 */
export class SoundMachinePlayListController implements IPlayListController
{
    // AS3: .../SoundMachinePlayListController.as::_soundManager
    private _soundManager: HabboSoundManagerFlash10 | null;

    // AS3: .../SoundMachinePlayListController.as::_musicController
    private _musicController: HabboMusicController | null;

    // AS3: .../SoundMachinePlayListController.as::_connection
    private _connection: IConnection | null;

    // AS3: .../SoundMachinePlayListController.as::_events
    private _events: EventEmitter | null;

    // AS3: .../SoundMachinePlayListController.as::_roomEvents
    private _roomEvents: EventEmitter | null;

    // AS3: .../SoundMachinePlayListController.as::_nowPlayingSongId
    private _nowPlayingSongId: number = -1;

    // AS3: .../SoundMachinePlayListController.as::_playListEntries
    private _playListEntries: SongDataEntry[] = [];

    // AS3: .../SoundMachinePlayListController.as::_isPlaying
    private _isPlaying: boolean = false;

    // AS3: .../src/com/sulake/habbo/sound/music/SoundMachinePlayListController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../SoundMachinePlayListController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: .../SoundMachinePlayListController.as::SoundMachinePlayListController()
    // Note which bus each subscription goes on: the song events on the manager's, the machine's
    // on/off switches on the room engine's.
    constructor(
        soundManager: HabboSoundManagerFlash10,
        musicController: HabboMusicController,
        events: EventEmitter,
        roomEvents: EventEmitter,
        connection: IConnection
    )
    {
        this._soundManager = soundManager;
        this._events = events;
        this._roomEvents = roomEvents;
        this._connection = connection;
        this._musicController = musicController;

        this._messageEvents.push(new PlayListMessageEvent(this.onPlayListMessage));
        this._messageEvents.push(new PlayListSongAddedMessageEvent(this.onPlayListSongAddedMessage));

        for(const event of this._messageEvents)
        {
            this._connection.addMessageEvent(event);
        }

        this._events.on('SCE_TRAX_SONG_COMPLETE', this.onSongFinishedPlayingEvent);
        this._events.on(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, this.onSongInfoReceivedEvent);
        this._roomEvents.on('ROSM_SOUND_MACHINE_SWITCHED_ON', this.onSoundMachinePlayEvent);
        this._roomEvents.on('ROSM_SOUND_MACHINE_SWITCHED_OFF', this.onSoundMachineStopEvent);
    }

    // AS3: .../SoundMachinePlayListController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../SoundMachinePlayListController.as::get priority()
    get priority(): number
    {
        return 0;
    }

    // AS3: .../SoundMachinePlayListController.as::get length()
    get length(): number
    {
        return this._playListEntries.length;
    }

    // AS3: .../SoundMachinePlayListController.as::get playPosition()
    // Always -1: a sound machine has no shared play head to report, unlike the jukebox.
    get playPosition(): number
    {
        return -1;
    }

    // AS3: .../SoundMachinePlayListController.as::set playPosition()
    // Empty in AS3 too — the setter exists to satisfy the interface.
    set playPosition(_value: number)
    {
    }

    // AS3: .../SoundMachinePlayListController.as::get nowPlayingSongId()
    get nowPlayingSongId(): number
    {
        return this._nowPlayingSongId;
    }

    // AS3: .../SoundMachinePlayListController.as::get isPlaying()
    get isPlaying(): boolean
    {
        return this._isPlaying;
    }

    /**
     * AS3: .../SoundMachinePlayListController.as::startPlaying()
     *
     * With no list yet it asks for one and marks itself playing anyway — the answer's own handler
     * then starts the track, which is why `onPlayListMessage()` checks `isPlaying` at the end.
     */
    // AS3: .../src/com/sulake/habbo/sound/music/SoundMachinePlayListController.as::startPlaying()
    startPlaying(): void
    {
        if(this._isPlaying) return;

        if(this._playListEntries.length === 0)
        {
            this.requestPlayList();
            this._isPlaying = true;

            return;
        }

        this.stopPlaying();
        this._nowPlayingSongId = -1;
        this._isPlaying = true;
        this.playNextSong();
    }

    // AS3: .../SoundMachinePlayListController.as::stopPlaying()
    stopPlaying(): void
    {
        this._nowPlayingSongId = -1;
        this._isPlaying = false;
        this._musicController?.stop(0);
    }

    // AS3: .../SoundMachinePlayListController.as::checkSongPlayState()
    // Called when a song's samples finish loading: if it is still the current one, start it and
    // pre-load whatever follows.
    checkSongPlayState(songId: number): void
    {
        if(this._nowPlayingSongId !== songId) return;

        this.playCurrentSongAndNotify(this._nowPlayingSongId);

        const next = this.getNextEntry();

        if(next !== null) this._musicController?.addSongInfoRequest(next.id);
    }

    // AS3: .../SoundMachinePlayListController.as::updateVolume()
    // Empty in AS3 too — volume is the music controller's business.
    updateVolume(_volume: number): void
    {
    }

    // AS3: .../SoundMachinePlayListController.as::addItem()
    // AS3 returns -1 without doing anything: a sound machine's list is edited server-side.
    addItem(_song: ISongInfo, _index: number = 0): number
    {
        return -1;
    }

    // AS3: .../SoundMachinePlayListController.as::moveItem()
    moveItem(_from: number, _to: number): void
    {
    }

    // AS3: .../SoundMachinePlayListController.as::removeItem()
    removeItem(_index: number): void
    {
    }

    // AS3: .../SoundMachinePlayListController.as::getEntry()
    getEntry(index: number): ISongInfo | null
    {
        if(index < 0 || index >= this._playListEntries.length) return null;

        return this._playListEntries[index];
    }

    // AS3: .../SoundMachinePlayListController.as::getEntryWithId()
    getEntryWithId(songId: number): ISongInfo | null
    {
        for(const entry of this._playListEntries)
        {
            if(entry.id === songId) return entry;
        }

        return null;
    }

    // AS3: .../SoundMachinePlayListController.as::requestPlayList()
    requestPlayList(): void
    {
        if(this._connection === null) return;

        this._connection.send(new GetSoundMachinePlayListMessageComposer());
    }

    // AS3: .../SoundMachinePlayListController.as::onSoundMachinePlayEvent()
    private onSoundMachinePlayEvent = (): void =>
    {
        this.startPlaying();
    };

    // AS3: .../SoundMachinePlayListController.as::onSoundMachineStopEvent()
    private onSoundMachineStopEvent = (): void =>
    {
        this.stopPlaying();
    };

    // AS3: .../SoundMachinePlayListController.as::onSongFinishedPlayingEvent()
    private onSongFinishedPlayingEvent = (event: {id: number}): void =>
    {
        if(event.id === this._nowPlayingSongId) this.playNextSong();
    };

    // AS3: .../SoundMachinePlayListController.as::onSongInfoReceivedEvent()
    // Swaps a placeholder entry for the real one and stops at the first match.
    private onSongInfoReceivedEvent = (event: {id: number}): void =>
    {
        if(this._playListEntries.length === 0) return;

        for(let i = 0; i < this._playListEntries.length; i++)
        {
            if(this._playListEntries[i].id !== event.id) continue;

            const resolved = this._musicController?.getSongInfo(event.id) as SongDataEntry | null;

            if(resolved !== null && resolved !== undefined) this._playListEntries[i] = resolved;

            return;
        }
    };

    // AS3: .../SoundMachinePlayListController.as::playNextSong()
    private playNextSong(): void
    {
        const next = this.getNextEntry();

        if(next === null) return;

        this._nowPlayingSongId = next.id;
        this.playCurrentSongAndNotify(this._nowPlayingSongId);
    }

    /**
     * AS3: .../SoundMachinePlayListController.as::playCurrentSongAndNotify()
     *
     * The stored play-head offset is consumed: it is read, then cleared, so the room's
     * synchronisation offset applies only to the first song it joins mid-way through.
     */
    // AS3: .../src/com/sulake/habbo/sound/music/SoundMachinePlayListController.as::playCurrentSongAndNotify()
    private playCurrentSongAndNotify(songId: number): void
    {
        const entry = this.getEntryWithId(songId) as SongDataEntry | null;

        if(entry === null) return;

        const startPlayHeadPos = entry.startPlayHeadPos;

        entry.startPlayHeadPos = 0;

        if(this._musicController?.playSong(songId, 0, startPlayHeadPos, 0, 0, 0))
        {
            log.debug(`Trax song started by playlist: ${entry.name} by ${entry.creator}`);
        }
    }

    /**
     * AS3: .../SoundMachinePlayListController.as::getNextEntry()
     *
     * The scan does not stop at the current song — it runs the whole list, so the index it keeps
     * is the one after the *last* entry with that id. Past the end it wraps to 0, which is also
     * what an unknown current song gives.
     */
    // AS3: .../src/com/sulake/habbo/sound/music/SoundMachinePlayListController.as::getNextEntry()
    private getNextEntry(): SongDataEntry | null
    {
        if(this._playListEntries.length === 0) return null;

        let nextIndex = 0;

        for(let i = 0; i < this._playListEntries.length; i++)
        {
            if(this._playListEntries[i].id === this._nowPlayingSongId) nextIndex = i + 1;
        }

        if(nextIndex >= this._playListEntries.length) nextIndex = 0;

        return this._playListEntries[nextIndex];
    }

    // AS3: .../SoundMachinePlayListController.as::convertParserPlayList()
    private convertParserPlayList(playList: SongData[]): SongDataEntry[]
    {
        return playList.map((song) => new SongDataEntry(song.id, song.length, song.name, song.creator, null));
    }

    /**
     * AS3: .../SoundMachinePlayListController.as::onPlayListMessage()
     *
     * `synchronizationCount` is a position in milliseconds across the *whole* list: it is taken
     * modulo the total length, then walked entry by entry until it falls inside one, and that
     * entry becomes the current song with the remainder as its play-head offset. An empty list is
     * ignored outright — the previous one is kept.
     */
    private onPlayListMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as PlayListMessageParser | null;

        if(parser === null) return;

        const entries = this.convertParserPlayList(parser.playList);

        if(entries.length === 0) return;

        this._playListEntries = entries;

        let totalLength = 0;

        for(const entry of entries) totalLength += entry.length;

        let position = parser.synchronizationCount;

        if(position < 0) position = 0;

        position %= totalLength;

        let current: SongDataEntry | null = null;

        for(const entry of entries)
        {
            if(position <= entry.length)
            {
                current = entry;
                this._nowPlayingSongId = entry.id;
                entry.startPlayHeadPos = position / 1000;
                break;
            }

            position -= entry.length;
        }

        this._events?.emit(
            PlayListStatusEvent.PLAY_LIST_UPDATED,
            new PlayListStatusEvent(PlayListStatusEvent.PLAY_LIST_UPDATED)
        );

        if(current !== null && this._isPlaying) this.playCurrentSongAndNotify(current.id);
    };

    // AS3: .../SoundMachinePlayListController.as::onPlayListSongAddedMessage()
    // A song added to an empty, already-playing list starts immediately.
    private onPlayListSongAddedMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as PlayListSongAddedMessageParser | null;
        const song = parser?.entry ?? null;

        if(song === null) return;

        const entry = new SongDataEntry(song.id, song.length, song.name, song.creator, null);

        this._playListEntries.push(entry);
        this._events?.emit(
            PlayListStatusEvent.PLAY_LIST_UPDATED,
            new PlayListStatusEvent(PlayListStatusEvent.PLAY_LIST_UPDATED)
        );

        if(!this._isPlaying) return;

        if(this._playListEntries.length === 1) this.playCurrentSongAndNotify(entry.id);
    };

    // AS3: .../SoundMachinePlayListController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._isPlaying) this.stopPlaying();

        this._soundManager = null;

        if(this._connection !== null)
        {
            for(const event of this._messageEvents)
            {
                this._connection.removeMessageEvent(event);
                event.dispose();
            }

            this._messageEvents = [];
            this._connection = null;
        }

        this._playListEntries = [];
        this._musicController = null;

        if(this._events !== null)
        {
            this._events.off('SCE_TRAX_SONG_COMPLETE', this.onSongFinishedPlayingEvent);
            this._events.off(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, this.onSongInfoReceivedEvent);
            this._events = null;
        }

        if(this._roomEvents !== null)
        {
            this._roomEvents.off('ROSM_SOUND_MACHINE_SWITCHED_ON', this.onSoundMachinePlayEvent);
            this._roomEvents.off('ROSM_SOUND_MACHINE_SWITCHED_OFF', this.onSoundMachineStopEvent);
            this._roomEvents = null;
        }

        this._disposed = true;
    }
}
