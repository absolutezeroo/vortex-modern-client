import type EventEmitter from 'eventemitter3';
import {Component, type IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import {RoomEngineObjectPlaySoundEvent} from '@habbo/room/events/RoomEngineObjectPlaySoundEvent';
import {AccountPreferencesEvent} from '@habbo/communication/messages/incoming/preferences/AccountPreferencesEvent';
import type {AccountPreferencesParser} from '@habbo/communication/messages/parser/preferences/AccountPreferencesParser';
import {GetSoundSettingsComposer} from '@habbo/communication/messages/outgoing/sound/GetSoundSettingsComposer';
import {SetSoundSettingsComposer} from '@habbo/communication/messages/outgoing/sound/SetSoundSettingsComposer';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';

import type {IHabboSoundManager} from './IHabboSoundManager';
import type {IHabboMusicController} from './IHabboMusicController';
import {TraxSampleManager} from './music/TraxSampleManager';
import {FurniSamplePlaybackManager} from './furni/FurniSamplePlaybackManager';
import {TraxSequencer} from './trax/TraxSequencer';
import {TraxSongLoadEvent} from './events/TraxSongLoadEvent';
import {TraxData} from './trax/TraxData';
import {OrderedMap} from '@core/utils/OrderedMap';
import {HabboMusicController} from './music/HabboMusicController';
import type {IHabboSound} from './IHabboSound';
import {HabboSoundBase} from './HabboSoundBase';
import {HabboSoundWithPitch} from './HabboSoundWithPitch';

const log = Logger.getLogger('habbo.sound.HabboSoundManagerFlash10');

/**
 * HabboSoundManagerFlash10
 *
 * The sound manager. Three volume channels, a cache of generic effects keyed by sound id,
 * and — once ported — ownership of the music controller, the Trax sample manager and the
 * furniture sample player.
 *
 * Two things about it are easy to misread:
 *
 * - **`genericVolume` starts at 0**, not 1, unlike trax and furni. Nothing is audible until
 *   `AccountPreferences` arrives and `onSoundSettingsEvent()` sets the real value. That is
 *   AS3's own initialiser, and it is why the manager asks for the settings in `init()`.
 * - **the dependencies are queued, not required.** AS3 uses `queueInterface()` here rather
 *   than the blocking dependency list, so the manager exists and answers immediately and
 *   simply plays nothing while the room engine is still coming up.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/HabboSoundManagerFlash10.as
 */
export class HabboSoundManagerFlash10 extends Component implements IHabboSoundManager, IUpdateReceiver
{
    // AS3: .../sound/HabboSoundManagerFlash10.as::HabboSoundManagerFlash10()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null, queueDependencies: boolean = true)
    {
        super(context, flags, assetLibrary);

        if(queueDependencies)
        {
            this.queueInterface(IID_HabboCommunicationManager, (_iid, communication: IHabboCommunicationManager) =>
            {
                this.onCommunicationManagerReady(communication);
            });
            this.queueInterface(IID_RoomEngine, (_iid, roomEngine: IRoomEngine) =>
            {
                this.onRoomEngineReady(roomEngine);
            });
            this.queueInterface(IID_HabboNotifications, (_iid, notifications: IHabboNotifications) =>
            {
                this.onNotificationsReady(notifications);
            });
        }

        this.events.on(TraxSongLoadEvent.TRAX_LOAD_COMPLETE, this._onTraxLoadComplete);
        this.registerUpdateReceiver(this, 1);

        log.debug('Sound manager 10 init');
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_SafeStr_4568
    private _connection: IConnection | null = null;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_notifications
    private _notifications: IHabboNotifications | null = null;

    /** Zero until the server's stored settings arrive — see the class comment. */
    // AS3: .../sound/HabboSoundManagerFlash10.as::_genericVolume
    private _genericVolume: number = 0;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_traxVolume
    private _traxVolume: number = 1;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_furniVolume
    private _furniVolume: number = 1;

    /** Effect instances, cached by sound id so a repeat play reuses one buffer. */
    // AS3: .../sound/HabboSoundManagerFlash10.as::_genericSamples
    private _genericSamples: Map<string, IHabboSound> = new Map();

    /** Last play time per sound id, in ms — the 200 ms retrigger guard in `playSound()`. */
    // AS3: .../sound/HabboSoundManagerFlash10.as::_SafeStr_5953
    private _lastPlayedAt: Map<string, number> = new Map();

    // AS3: .../sound/HabboSoundManagerFlash10.as::_SafeStr_5008
    private _musicController: IHabboMusicController | null = null;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_SafeStr_6112
    private _loadingSongId: number = -1;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_traxSampleManager
    private _traxSampleManager: TraxSampleManager | null = null;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_furniSamplePlaybackManager
    private _furniSamplePlaybackManager: FurniSamplePlaybackManager | null = null;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_downloadingSong
    // Name DERIVED (`_SafeStr_5349`): the one song whose samples are being fetched right now.
    private _downloadingSong: TraxSequencer | null = null;

    // AS3: .../sound/HabboSoundManagerFlash10.as::_queuedSongs
    // Name DERIVED (`_SafeStr_6944`): songs built while that download is in flight.
    private _queuedSongs: OrderedMap<number, TraxSequencer> = new OrderedMap<number, TraxSequencer>();

    /**
     * A sample of the song currently downloading failed.
     *
     * AS3 only drops the download slot — the half-loaded sequencer is left unready and is never
     * retried. Freeing the slot is what matters: `update()` calls `loadNextSong()` every frame,
     * so the next queued song starts on the following tick instead of waiting forever behind a
     * download that will never complete.
     */
    // AS3: .../sound/HabboSoundManagerFlash10.as::onSampleLoadError()
    private onSampleLoadError = (): void =>
    {
        log.warn(`A Trax sample failed to download; song ${this._loadingSongId} stays unready`);

        this._loadingSongId = -1;
        this._downloadingSong = null;
    };

    // TS-only: bound listener, kept so `dispose()` unregisters the same reference.
    private readonly _onTraxLoadComplete = (event: TraxSongLoadEvent): void =>
    {
        this.onTraxLoadComplete(event);
    };

    // AS3: .../sound/HabboSoundManagerFlash10.as::_SafeStr_9792
    private _muted: boolean = false;

    // TS-only: the sound-settings listener, kept so dispose() can unregister it.
    private _accountPreferencesEvent: IMessageEvent | null = null;

    // TS-only: bound room-engine listener, kept so dispose() removes the same reference.
    private readonly _onRoomEngineObjectPlaySound = (event: RoomEngineObjectPlaySoundEvent): void =>
    {
        this.onRoomEngineObjectPlaySound(event);
    };

    // AS3: .../sound/HabboSoundManagerFlash10.as::get musicController()
    get musicController(): IHabboMusicController | null
    {
        return this._musicController;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::get genericVolume()
    get genericVolume(): number
    {
        return this._genericVolume;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::set genericVolume()
    set genericVolume(value: number)
    {
        this.updateVolumeSetting(value, this._furniVolume, this._traxVolume);
        this.storeVolumeSetting();
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::get traxVolume()
    get traxVolume(): number
    {
        return this._traxVolume;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::set traxVolume()
    set traxVolume(value: number)
    {
        this.updateVolumeSetting(this._genericVolume, this._furniVolume, value);
        this.storeVolumeSetting();
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::get furniVolume()
    get furniVolume(): number
    {
        return this._furniVolume;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::set furniVolume()
    set furniVolume(value: number)
    {
        this.updateVolumeSetting(this._genericVolume, value, this._traxVolume);
        this.storeVolumeSetting();
    }

    /** Applies volumes without persisting them — what the settings sliders drag against. */
    // AS3: .../sound/HabboSoundManagerFlash10.as::previewVolume()
    previewVolume(generic: number, furni: number, trax: number): void
    {
        this.updateVolumeSetting(generic, furni, trax);
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::get loadingSongId()
    get loadingSongId(): number
    {
        return this._loadingSongId;
    }

    /**
     * Plays a generic effect, at most once every 200 ms per sound id — the guard exists
     * because several of these fire off packet arrival and would otherwise stack.
     */
    // AS3: .../sound/HabboSoundManagerFlash10.as::playSound()
    playSound(soundId: string, loops: number = 0): void
    {
        const now = Date.now();
        const lastPlayed = this._lastPlayedAt.get(soundId);

        if(lastPlayed !== undefined && (now - lastPlayed) <= 200)
        {
            return;
        }

        let sound = this._genericSamples.get(soundId) ?? null;

        if(sound === null)
        {
            const buffer = this.getSoundBySoundId(soundId);

            if(buffer !== null)
            {
                sound = new HabboSoundBase(buffer, loops);

                this._genericSamples.set(soundId, sound);
            }
        }

        if(sound === null)
        {
            // AS3 dereferences `_loc4_` unguarded on the next line and throws when the sound
            // is unknown; getSoundBySoundId() has already logged what was asked for.
            return;
        }

        sound.volume = this._genericVolume;

        this._lastPlayedAt.delete(soundId);
        this._lastPlayedAt.set(soundId, now);

        sound.play();
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::playSoundAtPitch()
    playSoundAtPitch(soundId: string, pitch: number): IHabboSound | null
    {
        const buffer = this.getSoundBySoundId(soundId);

        if(buffer === null)
        {
            return null;
        }

        const sound = new HabboSoundWithPitch(buffer, pitch);

        sound.volume = this._genericVolume;
        sound.play();

        return sound;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::stopSound()
    stopSound(soundId: string): void
    {
        this._genericSamples.get(soundId)?.stop();
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::mute()
    mute(muted: boolean): void
    {
        this._muted = muted;

        this.updateVolumeSetting(this._genericVolume, this._furniVolume, this._traxVolume);
    }

    /**
     * AS3: .../sound/HabboSoundManagerFlash10.as::loadTraxSong()
     *
     * One song downloads at a time: while `_downloadingSong` is set, every other song is built
     * without starting its downloads and parked in `_queuedSongs` instead. A song whose samples
     * are all cached comes back ready and plays immediately.
     */
    // AS3: .../src/com/sulake/habbo/sound/HabboSoundManagerFlash10.as::loadTraxSong()
    loadTraxSong(songId: number, songData: string): IHabboSound | null
    {
        if(this._downloadingSong !== null) return this.addTraxSongForDownload(songId, songData);

        const sequencer = this.createTraxInstance(songId, songData);

        if(!sequencer.ready)
        {
            this._downloadingSong = sequencer;
            this._loadingSongId = songId;
        }

        return sequencer;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::addTraxSongForDownload()
    // `false` is the flag that says "do not start the downloads" — that is the whole difference.
    private addTraxSongForDownload(songId: number, songData: string): IHabboSound
    {
        const sequencer = this.createTraxInstance(songId, songData, false);

        if(!sequencer.ready) this._queuedSongs.add(songId, sequencer);

        return sequencer;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::createTraxInstance()
    private createTraxInstance(songId: number, songData: string, startDownloads: boolean = true): TraxSequencer
    {
        const sequencer = new TraxSequencer(
            songId,
            new TraxData(songData),
            this._traxSampleManager?.traxSamples ?? new OrderedMap(),
            this.events
        );

        sequencer.volume = this._genericVolume;
        this.validateSampleAvailability(sequencer, startDownloads);

        return sequencer;
    }

    /**
     * AS3: .../sound/HabboSoundManagerFlash10.as::validateSampleAvailability()
     *
     * A song is ready only when *every* sample it names is already decoded; one missing sample
     * makes the whole song wait, which is why the sequencer refuses to start rather than playing
     * a song with holes in it.
     */
    // AS3: .../src/com/sulake/habbo/sound/HabboSoundManagerFlash10.as::validateSampleAvailability()
    private validateSampleAvailability(sequencer: TraxSequencer, startDownloads: boolean): void
    {
        const sampleIds = sequencer.traxData?.getSampleIds() ?? [];
        let missing = false;

        for(const sampleId of sampleIds)
        {
            if(this._traxSampleManager?.traxSamples.getValue(sampleId) != null) continue;

            if(startDownloads) this._traxSampleManager?.loadSample(sampleId);

            missing = true;
        }

        sequencer.ready = !missing;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::notifyPlayedSong()
    // Called from HabboMusicController when a track starts, exactly as in AS3.
    notifyPlayedSong(songName: string, songAuthor: string): void
    {
        this._notifications?.addSongPlayingNotification(songName, songAuthor);
    }

    /**
     * The song whose samples were downloading is complete.
     *
     * AS3 marks the sequencer ready and tells the music controller, then frees the download slot
     * so `loadNextSong()` can take the next queued song on the following tick. Note it returns
     * *before* freeing the slot when there is no music controller — that early return is AS3's,
     * and it is what makes the queue stall while the controller is still coming up.
     */
    // AS3: .../sound/HabboSoundManagerFlash10.as::onTraxLoadComplete()
    private onTraxLoadComplete(event: TraxSongLoadEvent): void
    {
        if(event == null) return;
        if(this._downloadingSong === null) return;

        this._downloadingSong.ready = true;

        if(this._musicController === null) return;

        this._musicController.onSongLoaded(event.id);

        this._downloadingSong = null;
        this._loadingSongId = -1;
    }

    /**
     * Starts the next queued song, if the single download slot is free.
     *
     * A song whose samples all turned out to be cached comes back ready from
     * `validateSampleAvailability()` and is announced immediately — it never occupies the slot.
     */
    // AS3: .../sound/HabboSoundManagerFlash10.as::loadNextSong()
    private loadNextSong(): void
    {
        if(this._downloadingSong !== null || this._queuedSongs.length === 0) return;

        const songId = this._queuedSongs.getKey(0);

        if(songId === null) return;

        const sequencer = this._queuedSongs.remove(songId);

        if(sequencer === null || sequencer.disposed) return;

        this.validateSampleAvailability(sequencer, true);

        if(sequencer.ready)
        {
            this.events.emit(
                TraxSongLoadEvent.TRAX_LOAD_COMPLETE,
                new TraxSongLoadEvent(TraxSongLoadEvent.TRAX_LOAD_COMPLETE, songId)
            );

            return;
        }

        this._downloadingSong = sequencer;
        this._loadingSongId = songId;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::update()
    // The sample manager decodes on this tick, under its own time budget.
    update(delta: number): void
    {
        this._traxSampleManager?.update(delta);
        this.loadNextSong();
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::get events()
    override get events(): EventEmitter
    {
        return super.events;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::onCommunicationManagerReady()
    private onCommunicationManagerReady(communication: IHabboCommunicationManager | null): void
    {
        if(communication === null)
        {
            return;
        }

        this._communication = communication;

        const connection = communication.connection;

        if(connection !== null)
        {
            this.onConnectionReady(connection);
            this.init();
        }
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::onRoomEngineReady()
    private onRoomEngineReady(roomEngine: IRoomEngine | null): void
    {
        if(roomEngine === null)
        {
            return;
        }

        this._roomEngine = roomEngine;

        this.init();
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::onNotificationsReady()
    private onNotificationsReady(notifications: IHabboNotifications | null): void
    {
        if(notifications === null)
        {
            return;
        }

        this._notifications = notifications;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::onConnectionReady()
    private onConnectionReady(connection: IConnection | null): void
    {
        if(this.disposed)
        {
            return;
        }

        if(connection !== null)
        {
            this._connection = connection;
        }

        this.init();
    }

    /**
     * Runs once, when both the connection and the room engine are up — the guard is AS3's
     * and is what makes the three `queueInterface` callbacks safe to fire in any order.
     */
    // AS3: .../sound/HabboSoundManagerFlash10.as::init()
    private init(): void
    {
        if(this._connection === null || this._roomEngine === null || this._musicController !== null)
        {
            return;
        }

        // AS3: HabboSoundManagerFlash10.as:423 — the controller takes the manager, the manager's
        // own event bus, the *room engine's* bus (it listens for the jukebox and sound-machine
        // room events on that one) and the connection.
        this._musicController = new HabboMusicController(
            this,
            this.events,
            this._roomEngine.events,
            this._connection
        );

        // AS3: HabboSoundManagerFlash10.as:424 — the sample manager, with the callback it calls
        // when a download fails.
        this._traxSampleManager = new TraxSampleManager(this, this.onSampleLoadError);

        // AS3: HabboSoundManagerFlash10.as:425 — the furniture sample player, on the room
        // engine's own event bus.
        this._furniSamplePlaybackManager = new FurniSamplePlaybackManager(this, this._roomEngine.events);
        this._roomEngine.events.on(RoomEngineObjectPlaySoundEvent.PLAY_SOUND, this._onRoomEngineObjectPlaySound);
        this._roomEngine.events.on(RoomEngineObjectPlaySoundEvent.PLAY_SOUND_AT_PITCH, this._onRoomEngineObjectPlaySound);

        this._accountPreferencesEvent = new AccountPreferencesEvent(this.onSoundSettingsEvent.bind(this));

        this._connection.addMessageEvent(this._accountPreferencesEvent);
        this._connection.send(new GetSoundSettingsComposer());
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::setMusicController()
    protected setMusicController(musicController: IHabboMusicController | null): void
    {
        this._musicController = musicController;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::storeVolumeSetting()
    private storeVolumeSetting(): void
    {
        this._connection?.send(new SetSoundSettingsComposer(
            Math.trunc(this._traxVolume * 100),
            Math.trunc(this._furniVolume * 100),
            Math.trunc(this._genericVolume * 100)
        ));
    }

    /**
     * The single point where the three volumes change. Muting zeroes all three without
     * touching what was stored, so unmuting restores them.
     */
    // AS3: .../sound/HabboSoundManagerFlash10.as::updateVolumeSetting()
    private updateVolumeSetting(generic: number, furni: number, trax: number): void
    {
        if(this._muted)
        {
            this._genericVolume = 0;
            this._furniVolume = 0;
            this._traxVolume = 0;

            this._musicController?.updateVolume(0);
            this._furniSamplePlaybackManager?.updateVolume(0);

            return;
        }

        this._genericVolume = generic;
        this._furniVolume = furni;
        this._traxVolume = trax;

        this._musicController?.updateVolume(trax);
        this._furniSamplePlaybackManager?.updateVolume(furni);
    }

    /**
     * The server stores each channel as 0-100. The `uiVolume == 1` branch is AS3's own
     * workaround for accounts whose stored value is the old boolean-ish 1 rather than a
     * percentage — it is read as "full", not as 1%.
     */
    // AS3: .../sound/HabboSoundManagerFlash10.as::onSoundSettingsEvent()
    private onSoundSettingsEvent(event: IMessageEvent): void
    {
        const parser = event.parser as AccountPreferencesParser;

        let uiVolume = parser.uiVolume;

        if(uiVolume === 1)
        {
            uiVolume = 100;
        }

        this.updateVolumeSetting(uiVolume / 100, parser.furniVolume / 100, parser.traxVolume / 100);
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::onRoomEngineObjectPlaySound()
    private onRoomEngineObjectPlaySound(event: RoomEngineObjectPlaySoundEvent): void
    {
        if(event.type === RoomEngineObjectPlaySoundEvent.PLAY_SOUND)
        {
            this.playSound(event.soundId);
        }

        if(event.type === RoomEngineObjectPlaySoundEvent.PLAY_SOUND_AT_PITCH)
        {
            this.playSoundAtPitch(event.soundId, event.pitch);
        }
    }

    /**
     * Maps a sound id onto the asset the mp3 is registered under. Every id the client can
     * ask for is listed; an unknown one is logged and plays nothing, as in AS3.
     */
    // AS3: .../sound/HabboSoundManagerFlash10.as::getSoundBySoundId()
    private getSoundBySoundId(soundId: string): AudioBuffer | null
    {
        // AS3 initialises this to "" and the `default:` returns before it is read; the
        // empty initialiser is dropped here because every other branch assigns.
        let assetName: string;

        switch(soundId)
        {
            case 'HBST_call_for_help':
                assetName = 'sound_call_for_help';
                break;
            case 'HBST_guide_invitation':
                assetName = 'sound_guide_received_invitation';
                break;
            case 'HBST_guide_request':
                assetName = 'sound_guide_help_requested';
                break;
            case 'HBST_message_received':
                assetName = 'sound_console_new_message';
                break;
            case 'HBST_message_sent':
                assetName = 'sound_console_message_sent';
                break;
            case 'HBST_pixels':
                assetName = 'sound_catalogue_duckets';
                break;
            case 'HBST_purchase':
                assetName = 'sound_catalogue_cash';
                break;
            case 'HBST_respect':
                assetName = 'sound_respect_received';
                break;
            case 'CAMERA_shutter':
                assetName = 'sound_camera_shutter';
                break;
            case 'HBSTG_snowwar_get_snowball':
            case 'HBSTG_snowwar_hit1':
            case 'HBSTG_snowwar_hit2':
            case 'HBSTG_snowwar_hit3':
            case 'HBSTG_snowwar_make_snowball':
            case 'HBSTG_snowwar_miss':
            case 'HBSTG_snowwar_throw':
            case 'HBSTG_snowwar_walk':
            case 'HBSTG_ig_countdown':
            case 'HBSTG_ig_winning':
            case 'HBSTG_ig_losing':
                assetName = soundId;
                break;
            case 'FURNITURE_cuckoo_clock':
                assetName = soundId;
                break;
            default:
                log.warn(`Unknown sound request: ${soundId}`);

                return null;
        }

        return this.getSoundByAssetName(assetName);
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::getSoundByAssetName()
    private getSoundByAssetName(assetName: string): AudioBuffer | null
    {
        const asset = this.assets?.getAssetByName(assetName) ?? null;
        const content = asset?.content ?? null;

        if(!(content instanceof AudioBuffer))
        {
            log.warn(`Sound asset "${assetName}" is missing - run \`pnpm import:crypted-sounds\` in vortex-client`);

            return null;
        }

        return content;
    }

    // AS3: .../sound/HabboSoundManagerFlash10.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this._connection !== null && this._accountPreferencesEvent !== null)
        {
            this._connection.removeMessageEvent(this._accountPreferencesEvent);
        }

        this._accountPreferencesEvent = null;
        this._connection = null;

        this.events.off(TraxSongLoadEvent.TRAX_LOAD_COMPLETE, this._onTraxLoadComplete);

        if(this._musicController !== null)
        {
            this._musicController.dispose();
            this._musicController = null;
        }

        // AS3: HabboSoundManagerFlash10.as:134/149 — the sample manager and the furni player are
        // disposed here too, in that order.
        if(this._traxSampleManager !== null)
        {
            this._traxSampleManager.dispose();
            this._traxSampleManager = null;
        }

        if(this._furniSamplePlaybackManager !== null)
        {
            this._furniSamplePlaybackManager.dispose();
            this._furniSamplePlaybackManager = null;
        }

        for(const sound of this._genericSamples.values())
        {
            sound.stop();
        }

        this._genericSamples.clear();
        this._lastPlayedAt.clear();

        // AS3 releases through the instance (`_communication.release(new IID...())`), which
        // is `IUnknown.release()`. This port keeps the reference count on the *holder*, so
        // the release goes through `this` — the same shape `HabboFriendBar.dispose()` uses.
        if(this._communication !== null)
        {
            this.release(IID_HabboCommunicationManager);
            this._communication = null;
        }

        if(this._roomEngine !== null)
        {
            this._roomEngine.events.off(RoomEngineObjectPlaySoundEvent.PLAY_SOUND, this._onRoomEngineObjectPlaySound);
            this._roomEngine.events.off(RoomEngineObjectPlaySoundEvent.PLAY_SOUND_AT_PITCH, this._onRoomEngineObjectPlaySound);
            this.release(IID_RoomEngine);
            this._roomEngine = null;
        }

        if(this._notifications !== null)
        {
            this.release(IID_HabboNotifications);
            this._notifications = null;
        }

        super.dispose();
    }
}
