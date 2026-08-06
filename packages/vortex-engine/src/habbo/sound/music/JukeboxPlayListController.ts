import type EventEmitter from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';
import type {IPlayListController} from '../IPlayListController';
import type {ISongInfo} from '../ISongInfo';
import type {HabboSoundManagerFlash10} from '../HabboSoundManagerFlash10';
import type {HabboMusicController} from './HabboMusicController';
import {SongDataEntry} from './SongDataEntry';
import {NowPlayingEvent} from '../events/NowPlayingEvent';
import {PlayListStatusEvent} from '../events/PlayListStatusEvent';
import {SongInfoReceivedEvent} from '../events/SongInfoReceivedEvent';
import {NowPlayingMessageEvent} from '@habbo/communication/messages/incoming/sound/NowPlayingMessageEvent';
import {
    JukeboxSongDisksMessageEvent
} from '@habbo/communication/messages/incoming/sound/JukeboxSongDisksMessageEvent';
import {
    JukeboxPlayListFullMessageEvent
} from '@habbo/communication/messages/incoming/sound/JukeboxPlayListFullMessageEvent';
import type {NowPlayingMessageParser} from '@habbo/communication/messages/parser/sound/NowPlayingMessageParser';
import type {
    JukeboxSongDisksMessageParser
} from '@habbo/communication/messages/parser/sound/JukeboxSongDisksMessageParser';
import {
    GetNowPlayingMessageComposer
} from '@habbo/communication/messages/outgoing/sound/GetNowPlayingMessageComposer';

const log = Logger.getLogger('habbo.sound.music.JukeboxPlayListController');

/**
 * The room jukebox's play list. The server drives it: it says what is playing and how far in, and
 * this asks the music controller to start that song at that offset — which is how everyone in the
 * room hears the same bar at the same time.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/music/JukeboxPlayListController.as
 */
export class JukeboxPlayListController implements IPlayListController
{
    // AS3: .../src/com/sulake/habbo/sound/music/JukeboxPlayListController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../JukeboxPlayListController.as::_isPlaying
    private _isPlaying: boolean = false;

    // AS3: .../JukeboxPlayListController.as::_entries
    private _entries: SongDataEntry[] = [];

    // AS3: .../JukeboxPlayListController.as::_musicController
    private _musicController: HabboMusicController | null;

    // AS3: .../JukeboxPlayListController.as::_events
    private _events: EventEmitter | null;

    // AS3: .../JukeboxPlayListController.as::_connection
    private _connection: IConnection | null;

    // AS3: .../JukeboxPlayListController.as::_soundManager
    private _soundManager: HabboSoundManagerFlash10 | null;

    // AS3: .../JukeboxPlayListController.as::_nowPlayingSongId
    private _nowPlayingSongId: number = -1;

    // AS3: .../JukeboxPlayListController.as::_missingSongInfo
    private _missingSongInfo: number[] = [];

    // AS3: .../JukeboxPlayListController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: .../JukeboxPlayListController.as::_playPosition
    private _playPosition: number = -1;

    // AS3: .../JukeboxPlayListController.as::JukeboxPlayListController()
    constructor(
        soundManager: HabboSoundManagerFlash10,
        musicController: HabboMusicController,
        events: EventEmitter,
        connection: IConnection
    )
    {
        this._soundManager = soundManager;
        this._musicController = musicController;
        this._events = events;
        this._connection = connection;

        this._messageEvents.push(new NowPlayingMessageEvent(this.onNowPlayingMessage));
        this._messageEvents.push(new JukeboxSongDisksMessageEvent(this.onJukeboxSongDisksMessage));
        this._messageEvents.push(new JukeboxPlayListFullMessageEvent(this.onJukeboxPlayListFullMessage));

        for(const event of this._messageEvents)
        {
            this._connection.addMessageEvent(event);
        }

        this._events.on('SCE_TRAX_SONG_COMPLETE', this.onSongFinishedPlayingEvent);
        this._musicController.events.on(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, this.onSongInfoReceivedEvent);
    }

    // AS3: .../JukeboxPlayListController.as::get priority()
    // The jukebox always plays at the lowest priority — anything else in the room outranks it.
    get priority(): number
    {
        return 0;
    }

    // AS3: .../JukeboxPlayListController.as::get nowPlayingSongId()
    get nowPlayingSongId(): number
    {
        return this._nowPlayingSongId;
    }

    // AS3: .../JukeboxPlayListController.as::get playPosition()
    get playPosition(): number
    {
        return this._playPosition;
    }

    // AS3: .../JukeboxPlayListController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../JukeboxPlayListController.as::get isPlaying()
    get isPlaying(): boolean
    {
        return this._isPlaying;
    }

    // AS3: .../JukeboxPlayListController.as::get length()
    get length(): number
    {
        return this._entries.length;
    }

    // AS3: .../JukeboxPlayListController.as::getEntry()
    getEntry(index: number): ISongInfo | null
    {
        if(index < 0 || index >= this._entries.length) return null;

        return this._entries[index];
    }

    // AS3: .../JukeboxPlayListController.as::requestPlayList()
    // The "now playing" request is what fetches the list — the answer carries both.
    requestPlayList(): void
    {
        if(this._connection === null) return;

        this._connection.send(new GetNowPlayingMessageComposer());
    }

    // AS3: .../JukeboxPlayListController.as::stopPlaying()
    stopPlaying(): void
    {
        this._musicController?.stop(this.priority);
        this._nowPlayingSongId = -1;
        this._playPosition = -1;
        this._isPlaying = false;
    }

    // AS3: .../JukeboxPlayListController.as::onSongFinishedPlayingEvent()
    // Empty in AS3: the jukebox is server-driven, so the next song arrives as a message rather
    // than being chosen here.
    private onSongFinishedPlayingEvent = (): void =>
    {
    };

    /**
     * AS3: .../JukeboxPlayListController.as::onNowPlayingMessage()
     *
     * `syncCount` is milliseconds into the current song, handed to `playSong()` as seconds. The
     * *next* song is only requested, not played — so its samples are ready when its turn comes.
     */
    private onNowPlayingMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as NowPlayingMessageParser | null;

        if(parser === null || this._musicController === null) return;

        log.debug(
            `Received Now Playing message with: ${parser.currentSongId}, ${parser.nextSongId}, ${parser.syncCount}`
        );

        this._isPlaying = parser.currentSongId !== -1;

        if(parser.currentSongId >= 0)
        {
            this._musicController.playSong(parser.currentSongId, 0, parser.syncCount / 1000, 0, 1, 1);
            this._nowPlayingSongId = parser.currentSongId;
        }
        else
        {
            this.stopPlaying();
        }

        if(parser.nextSongId >= 0) this._musicController.addSongInfoRequest(parser.nextSongId);

        this._playPosition = parser.currentPosition;

        // AS3 dispatches this one on the *sound manager's* bus, not on the one it was handed.
        this._soundManager?.events.emit(
            NowPlayingEvent.NOW_PLAYING_SONG_CHANGED,
            new NowPlayingEvent(
                NowPlayingEvent.NOW_PLAYING_SONG_CHANGED, 0, parser.currentSongId, parser.currentPosition
            )
        );
    };

    /**
     * AS3: .../JukeboxPlayListController.as::onJukeboxSongDisksMessage()
     *
     * A song the controller does not know yet gets a placeholder entry — id only, no name — so the
     * list keeps its length and order while the real metadata is requested.
     */
    private onJukeboxSongDisksMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as JukeboxSongDisksMessageParser | null;

        if(parser === null || this._musicController === null) return;

        log.debug(`Received Jukebox song disks (=playlist) message, length of playlist: ${parser.songDisks.length}`);

        this._entries = [];

        for(let i = 0; i < parser.songDisks.length; i++)
        {
            const songId = parser.songDisks.getWithIndex(i) ?? -1;
            const diskId = parser.songDisks.getKey(i) ?? -1;
            let entry = this._musicController.getSongInfo(songId) as SongDataEntry | null;

            if(entry === null)
            {
                entry = new SongDataEntry(songId, -1, '', '', null);

                if(this._missingSongInfo.indexOf(songId) < 0)
                {
                    this._missingSongInfo.push(songId);
                    this._musicController.requestSongInfoWithoutSamples(songId);
                }
            }

            entry.diskId = diskId;
            this._entries.push(entry);
        }

        if(this._missingSongInfo.length === 0) this.dispatchPlayListUpdated();
    };

    // AS3: .../JukeboxPlayListController.as::onJukeboxPlayListFullMessage()
    private onJukeboxPlayListFullMessage = (): void =>
    {
        log.debug('Received jukebox playlist full message.');
        this._events?.emit(PlayListStatusEvent.PLAY_LIST_FULL, new PlayListStatusEvent(PlayListStatusEvent.PLAY_LIST_FULL));
    };

    /**
     * AS3: .../JukeboxPlayListController.as::onSongInfoReceivedEvent()
     *
     * Swaps the placeholder for the real entry, carrying the disk id across — the metadata the
     * controller hands back knows nothing about which disc it came on.
     */
    private onSongInfoReceivedEvent = (event: {id: number}): void =>
    {
        for(let i = 0; i < this.length; i++)
        {
            const entry = this._entries[i];

            if(entry.id !== event.id) continue;

            const diskId = entry.diskId;
            const resolved = this._musicController?.getSongInfo(event.id) as SongDataEntry | null;

            if(resolved !== null && resolved !== undefined)
            {
                resolved.diskId = diskId;
                this._entries[i] = resolved;
            }

            break;
        }

        const pending = this._missingSongInfo.indexOf(event.id);

        if(pending >= 0) this._missingSongInfo.splice(pending, 1);

        if(this._missingSongInfo.length === 0) this.dispatchPlayListUpdated();
    };

    // AS3: .../JukeboxPlayListController.as::onJukeboxSongDisksMessage()/onSongInfoReceivedEvent()
    // The same dispatch, written twice there.
    private dispatchPlayListUpdated(): void
    {
        this._events?.emit(
            PlayListStatusEvent.PLAY_LIST_UPDATED,
            new PlayListStatusEvent(PlayListStatusEvent.PLAY_LIST_UPDATED)
        );
    }

    // AS3: .../JukeboxPlayListController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.stopPlaying();

        this._musicController?.events.off(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, this.onSongInfoReceivedEvent);
        this._musicController = null;
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

        if(this._events !== null)
        {
            this._events.off('SCE_TRAX_SONG_COMPLETE', this.onSongFinishedPlayingEvent);
            this._events = null;
        }

        this._disposed = true;
    }
}
