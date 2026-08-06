import type EventEmitter from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import type {IHabboMusicController} from '../IHabboMusicController';
import type {IPlayListController} from '../IPlayListController';
import type {ISongInfo} from '../ISongInfo';
import type {HabboSoundManagerFlash10} from '../HabboSoundManagerFlash10';
import {SongDataEntry} from './SongDataEntry';
import {SongStartRequestData} from './SongStartRequestData';
import {NowPlayingEvent} from '../events/NowPlayingEvent';
import {SongDiskInventoryReceivedEvent} from '../events/SongDiskInventoryReceivedEvent';
import {SongInfoReceivedEvent} from '../events/SongInfoReceivedEvent';
import {
    TraxSongInfoMessageEvent
} from '@habbo/communication/messages/incoming/sound/TraxSongInfoMessageEvent';
import {
    UserSongDisksInventoryMessageEvent
} from '@habbo/communication/messages/incoming/sound/UserSongDisksInventoryMessageEvent';
import type {
    TraxSongInfoMessageParser
} from '@habbo/communication/messages/parser/sound/TraxSongInfoMessageParser';
import type {
    UserSongDisksInventoryMessageParser
} from '@habbo/communication/messages/parser/sound/UserSongDisksInventoryMessageParser';
import {
    GetSongInfoMessageComposer
} from '@habbo/communication/messages/outgoing/sound/GetSongInfoMessageComposer';
import {
    GetUserSongDisksMessageComposer
} from '@habbo/communication/messages/outgoing/sound/GetUserSongDisksMessageComposer';
import {
    GetJukeboxPlayListMessageComposer
} from '@habbo/communication/messages/outgoing/sound/GetJukeboxPlayListMessageComposer';
import {JukeboxPlayListController} from './JukeboxPlayListController';
import {SoundMachinePlayListController} from './SoundMachinePlayListController';

const log = Logger.getLogger('habbo.sound.music.HabboMusicController');

/**
 * Everything about Trax songs that is not the playback itself: the metadata cache, the batched
 * request queue behind it, your song-disk inventory, and the four-slot priority stack that decides
 * which song a room should be hearing.
 *
 * The room's own play list — a jukebox or a sound machine — is built here when the furniture
 * appears and disposed when it goes.
 *
 * **Playback needs the Trax sequencer, which is unported.** `HabboSoundManagerFlash10.loadTraxSong()`
 * is a documented stub returning null, so every song entry's `soundObject` stays null and the play
 * paths below stop exactly where AS3 stops for a song whose samples have not loaded — at the
 * `soundObject == null || !ready` guards. Nothing here pretends otherwise; the structure is
 * complete and the one missing collaborator is the sequencer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/music/HabboMusicController.as
 */
export class HabboMusicController implements IHabboMusicController
{
    // AS3: .../HabboMusicController.as::SKIP_POSITION_SET
    static readonly SKIP_POSITION_SET: number = -1;

    // AS3: .../HabboMusicController.as::MAXIMUM_NOTIFY_PRIORITY
    private static readonly MAXIMUM_NOTIFY_PRIORITY: number = 0;

    // AS3: .../HabboMusicController.as::PRIORITY_SLOT_COUNT
    // Name DERIVED: AS3 writes the 4 inline at every one of its eight bounds checks.
    private static readonly PRIORITY_SLOT_COUNT: number = 4;

    // AS3: .../HabboMusicController.as::_soundManager
    private _soundManager: HabboSoundManagerFlash10 | null;

    // AS3: .../HabboMusicController.as::_connection
    private _connection: IConnection | null;

    // AS3: .../HabboMusicController.as::_events
    private _events: EventEmitter;

    // AS3: .../HabboMusicController.as::_roomEvents
    private _roomEvents: EventEmitter | null;

    // AS3: .../HabboMusicController.as::_songDataEntries
    // Name DERIVED (`_SafeStr_5061`): song id → its cached metadata.
    private _songDataEntries: OrderedMap<number, SongDataEntry> | null = new OrderedMap<number, SongDataEntry>();

    // AS3: .../HabboMusicController.as::_samplesRequestedBySongId
    // Name DERIVED (`_SafeStr_5660`): song id → whether the request asked for samples too.
    private _samplesRequestedBySongId: OrderedMap<number, boolean> | null = new OrderedMap<number, boolean>();

    // AS3: .../HabboMusicController.as::_pendingSongInfoRequests
    // Name DERIVED (`_SafeStr_5755`): drained once a second into one batched request.
    private _pendingSongInfoRequests: number[] | null = [];

    // AS3: .../HabboMusicController.as::_roomItemPlaylist
    private _roomItemPlaylist: IPlayListController | null = null;

    // AS3: .../src/com/sulake/habbo/sound/music/HabboMusicController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../HabboMusicController.as::_songStartRequests
    // Name DERIVED (`_SafeStr_5254`): one slot per priority, null when nothing is queued there.
    private _songStartRequests: (SongStartRequestData | null)[] = [];

    // AS3: .../HabboMusicController.as::_songRequestCounts
    // Name DERIVED (`_SafeStr_6395`): how many times each slot has been asked, which is how a
    // re-request of the *same* song is told apart from the one already playing.
    private _songRequestCounts: number[] = [];

    // AS3: .../HabboMusicController.as::_playingPriority
    // Name DERIVED (`_SafeStr_4938`).
    private _playingPriority: number = -1;

    // AS3: .../HabboMusicController.as::_playingSongId
    // Name DERIVED (`_SafeStr_7098`).
    private _playingSongId: number = -1;

    // AS3: .../HabboMusicController.as::_playingRequestCount
    // Name DERIVED (`_SafeStr_8293`).
    private _playingRequestCount: number = -1;

    // AS3: .../HabboMusicController.as::_songRequestTimer
    // Name DERIVED (`_SafeStr_6536`): AS3's `Timer(1000)`, running for the controller's whole life.
    private _songRequestTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../HabboMusicController.as::_songDisks
    // Name DERIVED (`_SafeStr_5290`): disk id → song id, in inventory order.
    private _songDisks: OrderedMap<number, number> | null = new OrderedMap<number, number>();

    // AS3: .../HabboMusicController.as::_songDiskInfoPending
    // Name DERIVED (`_SafeStr_6255`): song ids the disk inventory is still waiting on.
    private _songDiskInfoPending: number[] = [];

    // AS3: .../HabboMusicController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: .../HabboMusicController.as::_previouslyNotifiedSongId
    // Name DERIVED (`_SafeStr_9913`).
    private _previouslyNotifiedSongId: number = -1;

    // AS3: .../HabboMusicController.as::_previousNotificationTime
    private _previousNotificationTime: number = -1;

    // AS3: .../HabboMusicController.as::HabboMusicController()
    constructor(
        soundManager: HabboSoundManagerFlash10,
        events: EventEmitter,
        roomEvents: EventEmitter,
        connection: IConnection
    )
    {
        this._soundManager = soundManager;
        this._events = events;
        this._roomEvents = roomEvents;
        this._connection = connection;

        this._messageEvents.push(new TraxSongInfoMessageEvent(this.onSongInfoMessage));
        this._messageEvents.push(new UserSongDisksInventoryMessageEvent(this.onSongDiskInventoryMessage));

        for(const event of this._messageEvents)
        {
            this._connection.addMessageEvent(event);
        }

        this._roomEvents.on('ROSM_JUKEBOX_INIT', this.onJukeboxInit);
        this._roomEvents.on('ROSM_JUKEBOX_DISPOSE', this.onJukeboxDispose);
        this._roomEvents.on('ROSM_SOUND_MACHINE_INIT', this.onSoundMachineInit);
        this._roomEvents.on('ROSM_SOUND_MACHINE_DISPOSE', this.onSoundMachineDispose);

        this._songRequestTimer = setInterval(() => this.sendNextSongRequestMessage(), 1000);
        this._events.on('SCE_TRAX_SONG_COMPLETE', this.onSongFinishedPlayingEvent);

        for(let i = 0; i < HabboMusicController.PRIORITY_SLOT_COUNT; i++)
        {
            this._songStartRequests[i] = null;
            this._songRequestCounts[i] = 0;
        }
    }

    // AS3: .../HabboMusicController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../HabboMusicController.as::get events()
    get events(): EventEmitter
    {
        return this._events;
    }

    // AS3: .../HabboMusicController.as::getRoomItemPlaylist()
    // AS3 ignores the item id and hands back the one playlist it holds.
    getRoomItemPlaylist(_itemId: number = -1): IPlayListController | null
    {
        return this._roomItemPlaylist;
    }

    // AS3: .../HabboMusicController.as::playSong()
    playSong(
        songId: number,
        priority: number,
        startPosition: number = 0,
        playLength: number = 0,
        fadeInSeconds: number = 0.5,
        fadeOutSeconds: number = 0.5
    ): boolean
    {
        log.debug(`Requesting ${songId} for playing`);

        if(!this.addSongStartRequest(priority, songId, startPosition, playLength, fadeInSeconds, fadeOutSeconds))
        {
            return false;
        }

        if(!this.processSongEntryForPlaying(songId)) return false;

        if(priority >= this._playingPriority)
        {
            this.playSongObject(priority, songId);
        }
        else
        {
            log.debug(`Higher priority song blocked playing. Stored song ${songId} for priority ${priority}`);
        }

        return true;
    }

    // AS3: .../HabboMusicController.as::stop()
    // Stopping a priority that is not the one playing does not silence anything: it clears that
    // slot, and re-requests the playing one so it is picked up again.
    stop(priority: number): void
    {
        const isPlayingPriority = priority === this._playingPriority;
        const isTopRequest = this.getTopRequestPriority() === priority;

        this.resetSongStartRequest(priority);

        if(isPlayingPriority)
        {
            this.stopSongAtPriority(priority);

            return;
        }

        if(isTopRequest) this.reRequestSongAtPriority(this._playingPriority);
    }

    // AS3: .../HabboMusicController.as::addSongInfoRequest()
    addSongInfoRequest(songId: number): void
    {
        this.requestSong(songId, true);
    }

    // AS3: .../HabboMusicController.as::requestSongInfoWithoutSamples()
    requestSongInfoWithoutSamples(songId: number): void
    {
        this.requestSong(songId, false);
    }

    /**
     * AS3: .../HabboMusicController.as::getSongInfo()
     *
     * Returns null the first time and asks for the song in the background, so a caller that shows
     * a name is expected to come back on `SIR_TRAX_SONG_INFO_RECEIVED`. Note the request is only
     * made when the song is *unknown* — a second call before the answer lands is deduplicated by
     * `requestSong()`.
     */
    // AS3: .../src/com/sulake/habbo/sound/music/HabboMusicController.as::getSongInfo()
    getSongInfo(songId: number): ISongInfo | null
    {
        const entry = this.getSongDataEntry(songId);

        if(entry === null) this.requestSongInfoWithoutSamples(songId);

        return entry;
    }

    // AS3: .../HabboMusicController.as::requestUserSongDisks()
    requestUserSongDisks(): void
    {
        if(this._connection === null) return;

        this._connection.send(new GetUserSongDisksMessageComposer());
    }

    // AS3: .../HabboMusicController.as::getSongDiskInventorySize()
    getSongDiskInventorySize(): number
    {
        return this._songDisks?.length ?? 0;
    }

    // AS3: .../HabboMusicController.as::getSongDiskInventoryDiskId()
    getSongDiskInventoryDiskId(index: number): number
    {
        if(this._songDisks !== null && index >= 0 && index < this._songDisks.length)
        {
            return this._songDisks.getKey(index) ?? -1;
        }

        return -1;
    }

    // AS3: .../HabboMusicController.as::getSongDiskInventorySongId()
    getSongDiskInventorySongId(index: number): number
    {
        if(this._songDisks !== null && index >= 0 && index < this._songDisks.length)
        {
            return this._songDisks.getWithIndex(index) ?? -1;
        }

        return -1;
    }

    // AS3: .../HabboMusicController.as::getSongIdPlayingAtPriority()
    // Only the priority that is actually playing has a song; every other answer is -1.
    getSongIdPlayingAtPriority(priority: number): number
    {
        if(priority !== this._playingPriority) return -1;

        return this._playingSongId;
    }

    // AS3: .../HabboMusicController.as::onSongLoaded()
    onSongLoaded(songId: number): void
    {
        log.debug(`Song loaded : ${songId}`);

        const topPriority = this.getTopRequestPriority();

        if(topPriority < 0) return;

        if(songId === this.getSongIdRequestedAtPriority(topPriority))
        {
            this.playSongObject(topPriority, songId);
        }
    }

    // AS3: .../HabboMusicController.as::updateVolume()
    updateVolume(volume: number): void
    {
        for(let priority = 0; priority < HabboMusicController.PRIORITY_SLOT_COUNT; priority++)
        {
            const songId = this.getSongIdPlayingAtPriority(priority);

            if(songId < 0) continue;

            const entry = this.getSongDataEntry(songId);

            if(entry?.soundObject) entry.soundObject.volume = volume;
        }
    }

    // AS3: .../HabboMusicController.as::samplesUnloaded()
    // TODO(AS3): AS3 drops the sequencer of every cached song that used one of the unloaded
    // samples, comparing against `TraxSequencer.traxData.getSampleIds()`. `habbo/sound/trax` is
    // unported, so no song ever holds a sequencer and there is nothing to drop.
    samplesUnloaded(_sampleIds: number[]): void
    {
    }

    // AS3: .../HabboMusicController.as::get samplesIdsInUse()
    // TODO(AS3): same dependency — AS3 collects the sample ids of every queued song's sequencer.
    get samplesIdsInUse(): number[]
    {
        return [];
    }

    // AS3: .../HabboMusicController.as::addSongStartRequest()
    private addSongStartRequest(
        priority: number,
        songId: number,
        startPosition: number,
        playLength: number,
        fadeInSeconds: number,
        fadeOutSeconds: number
    ): boolean
    {
        if(priority < 0 || priority >= HabboMusicController.PRIORITY_SLOT_COUNT) return false;

        this._songStartRequests[priority] = new SongStartRequestData(
            songId, startPosition, playLength, fadeInSeconds, fadeOutSeconds
        );
        this._songRequestCounts[priority] += 1;

        return true;
    }

    // AS3: .../HabboMusicController.as::getSongStartRequest()
    private getSongStartRequest(priority: number): SongStartRequestData | null
    {
        return this._songStartRequests[priority] ?? null;
    }

    // AS3: .../HabboMusicController.as::getSongIdRequestedAtPriority()
    private getSongIdRequestedAtPriority(priority: number): number
    {
        if(priority < 0 || priority >= HabboMusicController.PRIORITY_SLOT_COUNT) return -1;

        return this._songStartRequests[priority]?.songId ?? -1;
    }

    // AS3: .../HabboMusicController.as::getSongRequestCountAtPriority()
    private getSongRequestCountAtPriority(priority: number): number
    {
        if(priority < 0 || priority >= HabboMusicController.PRIORITY_SLOT_COUNT) return -1;

        return this._songRequestCounts[priority];
    }

    // AS3: .../HabboMusicController.as::getTopRequestPriority()
    // Highest slot with something queued — the stack is searched from the top down.
    private getTopRequestPriority(): number
    {
        for(let priority = this._songStartRequests.length - 1; priority >= 0; priority--)
        {
            if(this._songStartRequests[priority] !== null) return priority;
        }

        return -1;
    }

    // AS3: .../HabboMusicController.as::resetSongStartRequest()
    private resetSongStartRequest(priority: number): void
    {
        if(priority >= 0 && priority < HabboMusicController.PRIORITY_SLOT_COUNT)
        {
            this._songStartRequests[priority] = null;
        }
    }

    // AS3: .../HabboMusicController.as::reRequestSongAtPriority()
    private reRequestSongAtPriority(priority: number): void
    {
        this._songRequestCounts[priority] = this._songRequestCounts[priority] + 1;
    }

    // AS3: .../HabboMusicController.as::processSongEntryForPlaying()
    // An unknown song is requested *with* its samples and the play attempt is abandoned; it will
    // be picked up again by onSongInfoMessage() once the answer lands.
    private processSongEntryForPlaying(songId: number): boolean
    {
        const entry = this.getSongDataEntry(songId);

        if(entry === null)
        {
            this.addSongInfoRequest(songId);

            return false;
        }

        if(entry.soundObject === null)
        {
            entry.soundObject = this._soundManager?.loadTraxSong(entry.id, entry.songData) ?? null;
        }

        return entry.soundObject?.ready ?? false;
    }

    // AS3: .../HabboMusicController.as::playSongWithHighestPriority()
    private playSongWithHighestPriority(): void
    {
        this._playingPriority = -1;
        this._playingSongId = -1;
        this._playingRequestCount = -1;

        for(let priority = this.getTopRequestPriority(); priority >= 0; priority--)
        {
            const songId = this.getSongIdRequestedAtPriority(priority);

            if(songId >= 0 && this.playSongObject(priority, songId)) return;
        }
    }

    // AS3: .../HabboMusicController.as::stopSongAtPriority()
    private stopSongAtPriority(priority: number): boolean
    {
        if(priority !== this._playingPriority || this._playingPriority < 0) return false;

        const songId = this.getSongIdPlayingAtPriority(priority);

        if(songId < 0) return false;

        this.stopSongDataEntry(this.getSongDataEntry(songId));

        return true;
    }

    // AS3: .../HabboMusicController.as::stopSongDataEntry()
    private stopSongDataEntry(entry: SongDataEntry | null): void
    {
        if(entry === null) return;

        log.debug(`Stopping current song ${entry.id}`);
        entry.soundObject?.stop();
    }

    // AS3: .../HabboMusicController.as::getSongDataEntry()
    private getSongDataEntry(songId: number): SongDataEntry | null
    {
        return this._songDataEntries?.getValue(songId) ?? null;
    }

    // AS3: .../HabboMusicController.as::requestSong()
    // Deduplicated by song id: a song already queued is not queued twice, and the *first* request
    // decides whether samples come with it.
    private requestSong(songId: number, withSamples: boolean): void
    {
        if(this._samplesRequestedBySongId === null || this._pendingSongInfoRequests === null) return;

        if(this._samplesRequestedBySongId.getValue(songId) !== null) return;

        this._samplesRequestedBySongId.add(songId, withSamples);
        this._pendingSongInfoRequests.push(songId);
    }

    // AS3: .../HabboMusicController.as::areSamplesRequested()
    private areSamplesRequested(songId: number): boolean
    {
        return this._samplesRequestedBySongId?.getValue(songId) ?? false;
    }

    // AS3: .../HabboMusicController.as::sendNextSongRequestMessage()
    // The whole queue goes out as one message, once a second, and the queue is emptied whether or
    // not the answer ever comes.
    private sendNextSongRequestMessage(): void
    {
        if(this._pendingSongInfoRequests === null || this._pendingSongInfoRequests.length < 1) return;

        if(this._connection === null) return;

        this._connection.send(new GetSongInfoMessageComposer(this._pendingSongInfoRequests));
        log.debug(`Requested song info's : ${this._pendingSongInfoRequests}`);
        this._pendingSongInfoRequests = [];
    }

    /**
     * AS3: .../HabboMusicController.as::onSongInfoMessage()
     *
     * A song already in the cache is skipped entirely — including its event — so a duplicate
     * answer cannot restart anything.
     */
    private onSongInfoMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as TraxSongInfoMessageParser | null;

        if(parser === null || this._songDataEntries === null) return;

        for(const song of parser.songs)
        {
            if(this.getSongDataEntry(song.id) !== null) continue;

            const soundObject = this.areSamplesRequested(song.id)
                ? this._soundManager?.loadTraxSong(song.id, song.data) ?? null
                : null;

            const entry = new SongDataEntry(song.id, song.length, song.name, song.creator, soundObject);

            entry.songData = song.data;
            this._songDataEntries.add(song.id, entry);

            const topPriority = this.getTopRequestPriority();
            const requestedSongId = this.getSongIdRequestedAtPriority(topPriority);

            if(soundObject?.ready && song.id === requestedSongId)
            {
                this.playSongObject(topPriority, requestedSongId);
            }

            this._events.emit(
                SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED,
                new SongInfoReceivedEvent(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, song.id)
            );

            // The disk inventory holds its own event back until the last song it is waiting on
            // has arrived. AS3 loops here because the same id can appear more than once.
            while(this._songDiskInfoPending.indexOf(song.id) !== -1)
            {
                this._songDiskInfoPending.splice(this._songDiskInfoPending.indexOf(song.id), 1);

                if(this._songDiskInfoPending.length === 0) this.dispatchSongDiskInventoryReceived();
            }

            log.debug(`Received song info : ${song.id}`);
        }
    };

    // AS3: .../HabboMusicController.as::onSongDiskInventoryMessage()
    private onSongDiskInventoryMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserSongDisksInventoryMessageParser | null;

        if(parser === null || this._songDisks === null) return;

        this._songDisks.reset();

        for(let i = 0; i < parser.songDiskCount; i++)
        {
            const diskId = parser.getDiskId(i);
            const songId = parser.getSongId(i);

            this._songDisks.add(diskId, songId);

            if(this._songDataEntries?.getValue(songId) == null)
            {
                this._songDiskInfoPending.push(songId);
                this.requestSongInfoWithoutSamples(songId);
            }
        }

        if(this._songDiskInfoPending.length === 0) this.dispatchSongDiskInventoryReceived();
    };

    // AS3: .../HabboMusicController.as::onSongDiskInventoryMessage()/onSongInfoMessage()
    // The same dispatch, written twice there.
    private dispatchSongDiskInventoryReceived(): void
    {
        this._events.emit(
            SongDiskInventoryReceivedEvent.SONG_DISK_INVENTORY_RECEIVED,
            new SongDiskInventoryReceivedEvent(SongDiskInventoryReceivedEvent.SONG_DISK_INVENTORY_RECEIVED)
        );
    }

    /**
     * AS3: .../HabboMusicController.as::playSongObject()
     *
     * Returning true does not mean the song started: when a previous song had to be stopped first,
     * AS3 returns true and waits for that song's complete event to come back round.
     */
    // AS3: .../src/com/sulake/habbo/sound/music/HabboMusicController.as::playSongObject()
    private playSongObject(priority: number, songId: number): boolean
    {
        if(songId === -1 || priority < 0 || priority >= HabboMusicController.PRIORITY_SLOT_COUNT) return false;

        const stoppedPrevious = this.stopSongAtPriority(this._playingPriority);
        const entry = this.getSongDataEntry(songId);

        if(entry === null)
        {
            log.warn(`WARNING: Unable to find song entry id ${songId} that was supposed to be loaded.`);

            return false;
        }

        const sound = entry.soundObject;

        if(sound === null || !sound.ready) return false;

        if(stoppedPrevious)
        {
            log.debug(`Waiting previous song to stop before playing song ${songId}`);

            return true;
        }

        sound.volume = this._soundManager?.traxVolume ?? 1;

        let startPosition = -1;
        let playLength = 0;
        let fadeInSeconds = 2;
        let fadeOutSeconds = 1;
        const request = this.getSongStartRequest(priority);

        if(request !== null)
        {
            startPosition = request.startPos;
            playLength = request.playLength;
            fadeInSeconds = request.fadeInSeconds;
            fadeOutSeconds = request.fadeOutSeconds;
        }

        // Past the end of the song there is nothing to play — the length is in milliseconds.
        if(startPosition >= entry.length / 1000) return false;

        if(startPosition === HabboMusicController.SKIP_POSITION_SET) startPosition = 0;

        sound.fadeInSeconds = fadeInSeconds;
        sound.fadeOutSeconds = fadeOutSeconds;
        sound.position = startPosition;
        sound.play(playLength);

        this._playingPriority = priority;
        this._playingRequestCount = this.getSongRequestCountAtPriority(priority);
        this._playingSongId = songId;

        if(this._playingPriority <= HabboMusicController.MAXIMUM_NOTIFY_PRIORITY) this.notifySongPlaying(entry);

        if(priority > 0)
        {
            this._events.emit(
                NowPlayingEvent.USER_PLAY_SONG,
                new NowPlayingEvent(NowPlayingEvent.USER_PLAY_SONG, priority, entry.id, -1)
            );
        }

        log.debug(
            `Started playing song ${songId} at position ${startPosition} for ${playLength} seconds `
            + `(length ${entry.length / 1000}) with priority ${priority}`
        );

        return true;
    }

    // AS3: .../HabboMusicController.as::notifySongPlaying()
    // Only songs of at least 8 seconds are announced, and the same song is not announced twice
    // inside 8 seconds.
    private notifySongPlaying(entry: SongDataEntry): void
    {
        const now = performance.now();

        if(entry.length < 8000) return;

        if(this._previouslyNotifiedSongId === entry.id && now <= this._previousNotificationTime + 8000) return;

        this._soundManager?.notifyPlayedSong(entry.name, entry.creator);
        this._previouslyNotifiedSongId = entry.id;
        this._previousNotificationTime = now;
    }

    // AS3: .../HabboMusicController.as::onSongFinishedPlayingEvent()
    // The slot is only cleared when nothing has re-requested it since it started, which is what
    // the request count is for.
    private onSongFinishedPlayingEvent = (event: {id: number}): void =>
    {
        log.debug(`Song ${event.id} finished playing`);

        if(this.getSongIdPlayingAtPriority(this._playingPriority) !== event.id) return;

        if(this.getTopRequestPriority() === this._playingPriority
            && this.getSongRequestCountAtPriority(this._playingPriority) === this._playingRequestCount)
        {
            this.resetSongStartRequest(this._playingPriority);
        }

        const finishedPriority = this._playingPriority;

        this.playSongWithHighestPriority();

        if(finishedPriority >= 2)
        {
            this._events.emit(
                NowPlayingEvent.USER_STOP_SONG,
                new NowPlayingEvent(NowPlayingEvent.USER_STOP_SONG, finishedPriority, event.id, -1)
            );
        }
    };

    // AS3: .../HabboMusicController.as::onSoundMachineInit()
    // The previous playlist goes first: a room can only have one, and swapping furniture swaps it.
    private onSoundMachineInit = (): void =>
    {
        this.disposeRoomPlaylist();

        if(this._soundManager === null || this._roomEvents === null || this._connection === null) return;

        this._roomItemPlaylist = new SoundMachinePlayListController(
            this._soundManager,
            this,
            this._events,
            this._roomEvents,
            this._connection
        );
    };

    // AS3: .../HabboMusicController.as::onSoundMachineDispose()
    private onSoundMachineDispose = (): void =>
    {
        this.disposeRoomPlaylist();
    };

    // AS3: .../HabboMusicController.as::onJukeboxInit()
    // AS3 asks for the play list here rather than leaving it to the controller it just built.
    private onJukeboxInit = (): void =>
    {
        this.disposeRoomPlaylist();

        if(this._soundManager === null || this._connection === null) return;

        this._roomItemPlaylist = new JukeboxPlayListController(
            this._soundManager,
            this,
            this._events,
            this._connection
        );
        this._connection.send(new GetJukeboxPlayListMessageComposer());
    };

    // AS3: .../HabboMusicController.as::onJukeboxDispose()
    private onJukeboxDispose = (): void =>
    {
        this.disposeRoomPlaylist();
    };

    // AS3: .../HabboMusicController.as::disposeRoomPlaylist()
    private disposeRoomPlaylist(): void
    {
        if(this._roomItemPlaylist !== null)
        {
            this._roomItemPlaylist.dispose();
            this._roomItemPlaylist = null;
        }
    }

    // AS3: .../HabboMusicController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._soundManager = null;
        this._pendingSongInfoRequests = null;

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

        this.disposeRoomPlaylist();

        if(this._songDataEntries !== null)
        {
            for(let i = 0; i < this._songDataEntries.length; i++)
            {
                const entry = this._songDataEntries.getWithIndex(i);

                entry?.soundObject?.stop();

                if(entry !== null) entry.soundObject = null;
            }

            this._songDataEntries.dispose();
            this._songDataEntries = null;
        }

        this._samplesRequestedBySongId?.dispose();
        this._samplesRequestedBySongId = null;

        if(this._songRequestTimer !== null)
        {
            clearInterval(this._songRequestTimer);
            this._songRequestTimer = null;
        }

        if(this._roomEvents !== null)
        {
            this._roomEvents.off('ROSM_JUKEBOX_INIT', this.onJukeboxInit);
            this._roomEvents.off('ROSM_JUKEBOX_DISPOSE', this.onJukeboxDispose);
            this._roomEvents.off('ROSM_SOUND_MACHINE_INIT', this.onSoundMachineInit);
            this._roomEvents.off('ROSM_SOUND_MACHINE_DISPOSE', this.onSoundMachineDispose);
        }

        this._songDisks?.dispose();
        this._songDisks = null;

        this._disposed = true;
    }
}
