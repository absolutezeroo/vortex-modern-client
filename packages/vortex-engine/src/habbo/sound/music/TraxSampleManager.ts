import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import {SoundContext} from '../SoundContext';
import {TraxSample} from '../trax/TraxSample';
import {TraxSongLoadEvent} from '../events/TraxSongLoadEvent';
import type {HabboSoundManagerFlash10} from '../HabboSoundManagerFlash10';

const log = Logger.getLogger('habbo.sound.music.TraxSampleManager');

/**
 * Downloads and decodes the individual samples a Trax song is built from, and evicts the ones
 * nothing is playing when they add up to too much memory.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/music/TraxSampleManager.as
 */
export class TraxSampleManager
{
    // AS3: .../TraxSampleManager.as::SAMPLE_PROCESS_LIMIT_MS
    // AS3 decodes on the main thread and stops after 60 ms so a batch cannot stall a frame.
    private static readonly SAMPLE_PROCESS_LIMIT_MS: number = 60;

    // AS3: .../TraxSampleManager.as::SAMPLE_LENGTH_MEMORY_LIMIT
    private static readonly SAMPLE_LENGTH_MEMORY_LIMIT: number = 25165823;

    // AS3: .../TraxSampleManager.as::SAMPLE_LENGTH_PURGE_TO
    private static readonly SAMPLE_LENGTH_PURGE_TO: number = 16777215;

    // AS3: .../TraxSampleManager.as::_soundManager
    private _soundManager: HabboSoundManagerFlash10 | null;

    // AS3: .../TraxSampleManager.as::_loadingSamples
    // AS3 keys this by the `Sound` object it started; here the fetch is keyed by sample id
    // directly, which is the same set with one less indirection.
    private _loadingSamples: Set<number> = new Set();

    // AS3: .../TraxSampleManager.as::_loadedSamples
    // Decoded audio waiting to be turned into a `TraxSample`, drained under the time limit.
    private _loadedSamples: {id: number; data: Float32Array}[] = [];

    // AS3: .../TraxSampleManager.as::_traxSamples
    private _traxSamples: OrderedMap<number, TraxSample> | null = new OrderedMap<number, TraxSample>();

    // AS3: .../TraxSampleManager.as::_loadErrorCallback
    private _loadErrorCallback: (() => void) | null;

    // AS3: .../TraxSampleManager.as::_purgeEnabled
    // Name DERIVED (`_SafeStr_9361`): read once from `trax.player.sample.memory.purge.enabled`.
    private _purgeEnabled: boolean = false;

    // AS3: .../src/com/sulake/habbo/sound/music/TraxSampleManager.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../TraxSampleManager.as::TraxSampleManager()
    constructor(soundManager: HabboSoundManagerFlash10, loadErrorCallback: (() => void) | null)
    {
        this._soundManager = soundManager;
        this._loadErrorCallback = loadErrorCallback;
        this._purgeEnabled = soundManager.getBoolean('trax.player.sample.memory.purge.enabled');
    }

    // AS3: .../TraxSampleManager.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../TraxSampleManager.as::get traxSamples()
    get traxSamples(): OrderedMap<number, TraxSample>
    {
        return this._traxSamples ?? new OrderedMap<number, TraxSample>();
    }

    /**
     * AS3: .../TraxSampleManager.as::loadSample()
     *
     * The URL is two config values joined, with `%typeid%` replaced by the sample id. AS3 loads it
     * as a `Sound` and later pulls the raw floats out with `extract()`; here `decodeAudioData()`
     * does both at once, so the decoded frames arrive in the same shape `TraxSample` wants.
     */
    // AS3: .../src/com/sulake/habbo/sound/music/TraxSampleManager.as::loadSample()
    loadSample(sampleId: number): void
    {
        if(this._soundManager === null || this._loadingSamples.has(sampleId)) return;

        const base = this._soundManager.getProperty('flash.dynamic.download.url');
        const template = this._soundManager.getProperty('flash.dynamic.download.samples.template');
        const url = (base + template).replace('%typeid%', sampleId.toString());

        this._loadingSamples.add(sampleId);

        void this.fetchSample(sampleId, url);
    }

    // AS3: .../TraxSampleManager.as::update()
    update(_time: number): void
    {
        this.processLoadedSamples();
    }

    // AS3: .../TraxSampleManager.as::loadSample()/onSampleLoadComplete()/ioErrorHandler()
    // The three halves of one round trip, which Flash splits across a load call and two listeners.
    private async fetchSample(sampleId: number, url: string): Promise<void>
    {
        const context = SoundContext.context;

        if(context === null)
        {
            this._loadingSamples.delete(sampleId);

            return;
        }

        try
        {
            const response = await fetch(url);

            if(!response.ok) throw new Error(`HTTP ${response.status}`);

            const buffer = await context.decodeAudioData(await response.arrayBuffer());

            // AS3 extracts interleaved stereo floats; `TraxSample` reads the left channel and
            // steps over the right, so the same interleaving is rebuilt here.
            const left = buffer.getChannelData(0);
            const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
            const interleaved = new Float32Array(buffer.length * 2);

            for(let i = 0; i < buffer.length; i++)
            {
                interleaved[i * 2] = left[i];
                interleaved[i * 2 + 1] = right[i];
            }

            this._loadedSamples.push({id: sampleId, data: interleaved});
        }
        catch (error)
        {
            log.warn(`Trax sample ${sampleId} failed to load: ${String(error)}`);
            this._loadingSamples.delete(sampleId);
            this._soundManager?.events.emit(
                TraxSongLoadEvent.TRAX_LOAD_FAILED,
                new TraxSongLoadEvent(TraxSongLoadEvent.TRAX_LOAD_FAILED, this._soundManager.loadingSongId)
            );
            this._loadErrorCallback?.();
        }
    }

    // AS3: .../TraxSampleManager.as::processLoadedSample()
    private processLoadedSample(loaded: {id: number; data: Float32Array}): void
    {
        if(!this._loadingSamples.has(loaded.id)) return;

        this._loadingSamples.delete(loaded.id);

        if(this._traxSamples?.getValue(loaded.id) != null) return;

        this._traxSamples?.add(
            loaded.id,
            new TraxSample(loaded.data, loaded.id, TraxSample.SAMPLE_FREQUENCY_44KHZ, TraxSample.SAMPLE_SCALE_16BIT)
        );
    }

    /**
     * AS3: .../TraxSampleManager.as::processLoadedSamples()
     *
     * Decodes for at most 60 ms per call, then stops — the rest waits for the next tick. When the
     * last outstanding sample lands, the song that was waiting is announced as loaded, and only
     * then is memory considered.
     */
    // AS3: .../src/com/sulake/habbo/sound/music/TraxSampleManager.as::processLoadedSamples()
    private processLoadedSamples(): void
    {
        if(this._loadedSamples.length === 0) return;

        const start = performance.now();

        while(performance.now() - start < TraxSampleManager.SAMPLE_PROCESS_LIMIT_MS && this._loadedSamples.length > 0)
        {
            const loaded = this._loadedSamples.shift();

            if(loaded !== undefined) this.processLoadedSample(loaded);
        }

        if(this._loadingSamples.size === 0 && (this._soundManager?.loadingSongId ?? -1) !== -1)
        {
            this._soundManager?.events.emit(
                TraxSongLoadEvent.TRAX_LOAD_COMPLETE,
                new TraxSongLoadEvent(TraxSongLoadEvent.TRAX_LOAD_COMPLETE, this._soundManager.loadingSongId)
            );

            if(this._purgeEnabled) this.processSampleMemoryUsage();
        }
    }

    /**
     * AS3: .../TraxSampleManager.as::processSampleMemoryUsage()
     *
     * Over the memory limit, the least-used and oldest samples are dropped until the total is back
     * under the purge target. A sample in a song that is currently queued is never a candidate —
     * that is what `samplesIdsInUse` is for — and neither is one no song has claimed yet
     * (`usageCount === 0`), which is AS3's guard against purging something mid-load.
     */
    // AS3: .../src/com/sulake/habbo/sound/music/TraxSampleManager.as::processSampleMemoryUsage()
    private processSampleMemoryUsage(): void
    {
        if(this._traxSamples === null) return;

        const inUse = this._soundManager?.musicController?.samplesIdsInUse ?? [];
        const candidates: TraxSample[] = [];
        let totalLength = 0;

        for(let i = 0; i < this._traxSamples.length; i++)
        {
            const id = this._traxSamples.getKey(i) ?? -1;
            const sample = this._traxSamples.getWithIndex(i);

            if(sample === null) continue;

            if(sample.usageCount !== 0 && inUse.indexOf(id) === -1) candidates.push(sample);

            totalLength += sample.length;
        }

        if(totalLength <= TraxSampleManager.SAMPLE_LENGTH_MEMORY_LIMIT) return;

        log.debug('Sample memory limit reached, clearing the oldest and least frequently used samples');
        candidates.sort(TraxSampleManager.orderUsageAndTimeStamp);

        const purged: number[] = [];
        let freed = 0;
        let index = 0;

        while(freed < totalLength - TraxSampleManager.SAMPLE_LENGTH_PURGE_TO && index < candidates.length)
        {
            const sample = candidates[index++];

            freed += sample.length;
            purged.push(sample.id);
        }

        if(purged.length === 0) return;

        for(const id of purged)
        {
            log.debug(`Purging sample : ${id}`);
            this._traxSamples.getValue(id)?.dispose();
            this._traxSamples.remove(id);
        }

        this._soundManager?.musicController?.samplesUnloaded(purged);
    }

    // AS3: .../TraxSampleManager.as::orderUsageAndTimeStamp()
    // Least used first, and among equals the one untouched for longest.
    private static orderUsageAndTimeStamp(left: TraxSample, right: TraxSample): number
    {
        if(left.usageCount < right.usageCount) return -1;

        if(left.usageCount > right.usageCount) return 1;

        if(left.usageTimeStamp < right.usageTimeStamp) return -1;

        if(left.usageTimeStamp > right.usageTimeStamp) return 1;

        return 0;
    }

    // AS3: .../TraxSampleManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._loadedSamples = [];
        this._traxSamples?.dispose();
        this._traxSamples = null;
        this._loadingSamples.clear();
        this._soundManager = null;
        this._loadErrorCallback = null;
        this._disposed = true;
    }
}
