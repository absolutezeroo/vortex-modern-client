import type EventEmitter from 'eventemitter3';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import type {IHabboSound} from '../IHabboSound';
import {SoundCompleteEvent} from '../events/SoundCompleteEvent';
import type {TraxData} from './TraxData';
import type {TraxSample} from './TraxSample';
import {TraxChannelSample} from './TraxChannelSample';
import {TraxStreamNode} from './TraxStreamNode';

const log = Logger.getLogger('habbo.sound.trax.TraxSequencer');

/**
 * One Trax song, played by mixing its channels together a block at a time.
 *
 * The sequence is laid out once (`prepare()`): for each channel, a map of *sample position* → the
 * sample that starts there, in output samples. Playing is then a walk: at any position, each
 * channel's current sample is found, and 8192 frames are written — the last channel overwrites the
 * mixing buffer, every channel before it adds into it.
 *
 * **Flash mapping.** AS3 streams through `Sound` + `SampleDataEvent`, which pulls 8192 frames
 * whenever it wants more. Web Audio has no such event, so `TraxStreamNode` inverts it into a
 * request from an `AudioWorklet` — see that file. Everything above the block boundary is AS3's,
 * including the fades, the bar quantisation and the two-stage finish.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/trax/TraxSequencer.as
 */
export class TraxSequencer implements IHabboSound
{
    // AS3: .../TraxSequencer.as::SAMPLES_PER_SECOND
    private static readonly SAMPLES_PER_SECOND: number = 44100;

    // AS3: .../TraxSequencer.as::BUFFER_LENGTH
    private static readonly BUFFER_LENGTH: number = 8192;

    // AS3: .../TraxSequencer.as::BAR_LENGTH
    // 88000, *not* SAMPLES_PER_BAR — a bar is laid out 200 samples shorter than it is measured.
    // AS3 declares both and uses each in its own place; the difference is deliberate there.
    private static readonly BAR_LENGTH: number = 88000;

    // AS3: .../TraxSequencer.as::SAMPLES_PER_BAR
    private static readonly SAMPLES_PER_BAR: number = 88200;

    // AS3: .../TraxSequencer.as::ROUND_UP_THRESHOLD_BIAS
    // Outside cut mode a sample counts as filling a bar once it is 12.5% into it.
    private static readonly ROUND_UP_THRESHOLD_BIAS: number = 0.875;

    // AS3: .../TraxSequencer.as::MIXING_BUFFER
    // Static in AS3 too: one buffer shared by every sequencer, which is safe because only one
    // song mixes at a time and each block is written before it is read.
    private static readonly MIXING_BUFFER: Int32Array = new Int32Array(TraxSequencer.BUFFER_LENGTH);

    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../TraxSequencer.as::_events
    private _events: EventEmitter | null;

    // AS3: .../TraxSequencer.as::_volume
    private _volume: number = 1;

    // AS3: .../TraxSequencer.as::_stream
    // Flash's `Sound` + `SoundChannel` pair, as one node here.
    private _stream: TraxStreamNode | null = null;

    // AS3: .../TraxSequencer.as::_traxData
    private _traxData: TraxData | null;

    // AS3: .../TraxSequencer.as::_samples
    private _samples: OrderedMap<number, TraxSample> | null;

    // AS3: .../TraxSequencer.as::_ready
    private _ready: boolean = true;

    // AS3: .../TraxSequencer.as::_songId
    private _songId: number;

    // AS3: .../TraxSequencer.as::_playLengthSamples
    private _playLengthSamples: number = 0;

    // AS3: .../TraxSequencer.as::_position
    // Name DERIVED (`_SafeStr_4892`): the play head, in output samples.
    private _position: number = 0;

    // AS3: .../TraxSequencer.as::_channelSequences
    // Name DERIVED (`_SafeStr_5125`): per channel, sample start position → sample.
    private _channelSequences: OrderedMap<number, TraxSample>[] | null = [];

    // AS3: .../TraxSequencer.as::_prepared
    // Name DERIVED (`_SafeStr_6641`).
    private _prepared: boolean = false;

    // AS3: .../TraxSequencer.as::_finished
    private _finished: boolean = false;

    // AS3: .../TraxSequencer.as::_lengthSamples
    private _lengthSamples: number = 0;

    // AS3: .../TraxSequencer.as::_latencyMs
    // Name DERIVED (`_SafeStr_8591`): how far the audio thread is behind what has been mixed.
    // AS3 measures it against `SoundChannel.position`; here it is the queue depth in ms.
    private _latencyMs: number = 30;

    // AS3: .../TraxSequencer.as::_fadingIn
    // Name DERIVED (`_SafeStr_5689`).
    private _fadingIn: boolean = false;

    // AS3: .../TraxSequencer.as::_fadingOut
    // Name DERIVED (`_SafeStr_5503`).
    private _fadingOut: boolean = false;

    // AS3: .../TraxSequencer.as::_fadeInLengthSamples
    private _fadeInLengthSamples: number = 0;

    // AS3: .../TraxSequencer.as::_fadeOutLengthSamples
    private _fadeOutLengthSamples: number = 0;

    // AS3: .../TraxSequencer.as::_fadeInPosition
    // Name DERIVED (`_SafeStr_5884`).
    private _fadeInPosition: number = 0;

    // AS3: .../TraxSequencer.as::_fadeOutPosition
    // Name DERIVED (`_SafeStr_5064`).
    private _fadeOutPosition: number = 0;

    // AS3: .../TraxSequencer.as::_fadeOutStopTimer
    private _fadeOutStopTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../TraxSequencer.as::_completeTimer
    private _completeTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../TraxSequencer.as::_useCutMode
    private _useCutMode: boolean = false;

    // AS3: .../TraxSequencer.as::_underRunCount
    // Name DERIVED (`_SafeStr_8233`): AS3 counts them and logs each one.
    private _underRunCount: number = 0;

    // AS3: .../TraxSequencer.as::TraxSequencer()
    constructor(songId: number, traxData: TraxData, samples: OrderedMap<number, TraxSample>, events: EventEmitter)
    {
        this._songId = songId;
        this._traxData = traxData;
        this._samples = samples;
        this._events = events;
    }

    // AS3: .../TraxSequencer.as::get ready()
    get ready(): boolean
    {
        return this._ready;
    }

    // AS3: .../TraxSequencer.as::set ready()
    set ready(value: boolean)
    {
        this._ready = value;
    }

    // AS3: .../TraxSequencer.as::get finished()
    get finished(): boolean
    {
        return this._finished;
    }

    // AS3: .../TraxSequencer.as::get position()
    get position(): number
    {
        return this._position / TraxSequencer.SAMPLES_PER_SECOND;
    }

    // AS3: .../TraxSequencer.as::set position()
    set position(value: number)
    {
        this._position = value * TraxSequencer.SAMPLES_PER_SECOND;
    }

    // AS3: .../TraxSequencer.as::get length()
    get length(): number
    {
        return this._lengthSamples / TraxSequencer.SAMPLES_PER_SECOND;
    }

    // AS3: .../TraxSequencer.as::get volume()
    get volume(): number
    {
        return this._volume;
    }

    // AS3: .../TraxSequencer.as::set volume()
    set volume(value: number)
    {
        this._volume = value;

        if(this._stream !== null) this._stream.volume = value;
    }

    // AS3: .../TraxSequencer.as::get fadeOutSeconds()
    get fadeOutSeconds(): number
    {
        return this._fadeOutLengthSamples / TraxSequencer.SAMPLES_PER_SECOND;
    }

    // AS3: .../TraxSequencer.as::set fadeOutSeconds()
    set fadeOutSeconds(value: number)
    {
        this._fadeOutLengthSamples = value * TraxSequencer.SAMPLES_PER_SECOND;
    }

    // AS3: .../TraxSequencer.as::get fadeInSeconds()
    get fadeInSeconds(): number
    {
        return this._fadeInLengthSamples / TraxSequencer.SAMPLES_PER_SECOND;
    }

    // AS3: .../TraxSequencer.as::set fadeInSeconds()
    set fadeInSeconds(value: number)
    {
        this._fadeInLengthSamples = value * TraxSequencer.SAMPLES_PER_SECOND;
    }

    // AS3: .../TraxSequencer.as::get traxData()
    get traxData(): TraxData | null
    {
        return this._traxData;
    }

    // AS3: .../TraxSequencer.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * AS3: .../TraxSequencer.as::prepare()
     *
     * Lays the sequence out once and remembers it. Which layout depends on the song's own `c` meta
     * flag: cut mode rounds a sample's bar count to nearest, the legacy mode rounds it up past a
     * 12.5% threshold — the same song laid out either way is a different length.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::prepare()
    prepare(): boolean
    {
        if(!this._ready)
        {
            log.warn('Cannot start trax playback until samples ready!');

            return false;
        }

        if(this._prepared || this._traxData === null) return true;

        this._useCutMode = this._traxData.hasMetaData ? this._traxData.metaCutMode : false;

        if(this._useCutMode)
        {
            if(!this.prepareSequence())
            {
                log.warn('Cannot start playback, prepare sequence failed!');

                return false;
            }

            return true;
        }

        if(!this.prepareLegacySequence())
        {
            log.warn('Cannot start playback, prepare legacy sequence failed!');

            return false;
        }

        return true;
    }

    /**
     * AS3: .../TraxSequencer.as::play()
     *
     * `playLength` is a cap in seconds, 0 for "the whole song". The stream node is started
     * asynchronously (see `TraxStreamNode`), and the first blocks are mixed straight away so the
     * queue is never empty at the point playback actually begins.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::play()
    play(playLength: number = 0): boolean
    {
        if(!this.prepare()) return false;

        this.removeFadeoutStopTimer();

        if(this._stream !== null) this.stopImmediately();

        if(this._fadeInLengthSamples > 0)
        {
            this._fadingIn = true;
            this._fadeInPosition = 0;
        }

        this._fadingOut = false;
        this._fadeOutPosition = 0;
        this._finished = false;
        this._playLengthSamples = playLength * TraxSequencer.SAMPLES_PER_SECOND;
        this._underRunCount = 0;

        const stream = new TraxStreamNode();

        this._stream = stream;
        stream.volume = this._volume;
        stream.onNeedMore = (): void => this.pumpBlock();
        stream.onStarved = (): void =>
        {
            this._underRunCount++;
            log.debug('Audio buffer under run...');
        };

        // Two blocks ahead before the node is even up, which is the queue depth the processor
        // asks to keep.
        this.pumpBlock();
        this.pumpBlock();

        void stream.start();

        return true;
    }

    // AS3: .../TraxSequencer.as::stop()
    // A song with a fade-out set is not cut off: it rides the fade down and completes on a timer.
    stop(): boolean
    {
        if(this._fadeOutLengthSamples > 0 && !this._finished)
        {
            this.stopWithFadeout();
        }
        else
        {
            this.playingComplete();
        }

        return true;
    }

    /**
     * AS3: .../TraxSequencer.as::render()
     *
     * Mixes the whole song as fast as it can rather than in real time. AS3 hands it a
     * `SampleDataEvent` to write into; here the blocks are returned, which is the only shape a
     * caller could use them in.
     *
     * Nothing in the client calls it — kept because it is a public member of the source.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::render()
    render(): Float32Array[]
    {
        const blocks: Float32Array[] = [];

        if(!this.prepare()) return blocks;

        while(!this._finished)
        {
            blocks.push(this.mixNextBlock());
        }

        return blocks;
    }

    // AS3: .../TraxSequencer.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.stopImmediately();
        this._traxData = null;
        this._samples = null;
        this._channelSequences = null;
        this._events = null;
        this._disposed = true;
    }

    /**
     * AS3: .../TraxSequencer.as::prepareLegacySequence()
     *
     * Walks each channel item bar by bar, placing the sample at every bar boundary it covers. A
     * sample id of 0 is silence: the position still advances, nothing is placed.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::prepareLegacySequence()
    private prepareLegacySequence(): boolean
    {
        if(this._channelSequences === null || this._traxData === null || this._samples === null) return false;

        const stamp = performance.now();

        for(const channel of this._traxData.channels)
        {
            const sequence = new OrderedMap<number, TraxSample>();
            let position = 0;
            let bars = 0;

            for(let i = 0; i < channel.itemCount; i++)
            {
                const item = channel.getItem(i);
                const sample = this._samples.getValue(item.id);

                if(sample === null)
                {
                    log.warn('Error in prepareLegacySequence(), sample was null!');

                    return false;
                }

                sample.setUsageFromSong(this._songId, stamp);

                const sampleBars = this.getSampleBars(sample.length);
                const repeats = Math.trunc(item.length / sampleBars);

                for(let repeat = 0; repeat < repeats; repeat++)
                {
                    if(item.id !== 0) sequence.add(position, sample);

                    bars += sampleBars;
                    position = bars * TraxSequencer.BAR_LENGTH;
                }

                if(this._lengthSamples < position) this._lengthSamples = position;
            }

            this._channelSequences.push(sequence);
        }

        this._prepared = true;

        return true;
    }

    /**
     * AS3: .../TraxSequencer.as::prepareSequence()
     *
     * Cut mode. The difference from the legacy walk is the `carry` flag: a sample that overruns
     * its item's bars sets it, and the *next* item then places its sample even if it is the
     * silence id — which is how a cut song keeps its grid when a sample does not divide evenly.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::prepareSequence()
    private prepareSequence(): boolean
    {
        if(this._channelSequences === null || this._traxData === null || this._samples === null) return false;

        const stamp = performance.now();

        for(const channel of this._traxData.channels)
        {
            const sequence = new OrderedMap<number, TraxSample>();
            let position = 0;
            let bars = 0;
            let carry = false;

            for(let i = 0; i < channel.itemCount; i++)
            {
                const item = channel.getItem(i);
                const sample = this._samples.getValue(item.id);

                if(sample === null)
                {
                    log.warn('Error in prepareSequence(), sample was null!');

                    return false;
                }

                sample.setUsageFromSong(this._songId, stamp);

                let barCursor = bars;
                let positionCursor = position;
                const sampleBars = this.getSampleBars(sample.length);

                while(barCursor < bars + item.length)
                {
                    if(item.id !== 0 || carry)
                    {
                        sequence.add(positionCursor, sample);
                        carry = false;
                    }

                    barCursor += sampleBars;
                    positionCursor = barCursor * TraxSequencer.BAR_LENGTH;

                    if(barCursor > bars + item.length) carry = true;
                }

                bars += item.length;
                position = bars * TraxSequencer.BAR_LENGTH;

                if(this._lengthSamples < position) this._lengthSamples = position;
            }

            this._channelSequences.push(sequence);
        }

        this._prepared = true;

        return true;
    }

    /**
     * AS3: .../TraxSequencer.as::getSampleBars()
     *
     * How many bars a sample occupies. Cut mode rounds to nearest; otherwise a sample counts as
     * filling a bar once it is 12.5% into it, which is what lets a slightly-short loop still be
     * treated as a whole bar.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::getSampleBars()
    private getSampleBars(sampleLength: number): number
    {
        const bars = sampleLength / TraxSequencer.SAMPLES_PER_BAR;

        if(this._useCutMode) return Math.round(bars);

        return Math.floor(bars + TraxSequencer.ROUND_UP_THRESHOLD_BIAS);
    }

    /**
     * AS3: .../TraxSequencer.as::getChannelSequenceOffsets()
     *
     * For each channel, the index of the last entry that starts at or before the play head. The
     * `- 1` is AS3's: the loop stops on the first entry *past* the head, so one back is the
     * current one. It can legitimately be -1, meaning the channel has not started yet.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::getChannelSequenceOffsets()
    private getChannelSequenceOffsets(): number[]
    {
        const offsets: number[] = [];

        if(this._channelSequences === null) return offsets;

        for(const sequence of this._channelSequences)
        {
            let index = 0;

            while(index < sequence.length && (sequence.getKey(index) ?? 0) < this._position) index++;

            offsets.push(index - 1);
        }

        return offsets;
    }

    /**
     * AS3: .../TraxSequencer.as::mixChannelsIntoBuffer()
     *
     * Channels are mixed **from last to first**, and the first one processed — the highest-indexed
     * channel — *overwrites* the buffer while every later one adds into it. That is what clears
     * the previous block without a separate pass.
     *
     * Within a channel the block is cut at the next sample's start position, so a sample that
     * begins mid-block is placed exactly rather than on the next boundary.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::mixChannelsIntoBuffer()
    private mixChannelsIntoBuffer(): void
    {
        if(this._channelSequences === null) return;

        const offsets = this.getChannelSequenceOffsets();
        const channelCount = this._channelSequences.length;

        for(let channelIndex = channelCount - 1; channelIndex >= 0; channelIndex--)
        {
            const sequence = this._channelSequences[channelIndex];
            let entryIndex = offsets[channelIndex];
            let sample = sequence.getWithIndex(entryIndex);
            let channelSample: TraxChannelSample | null = null;

            if(sample !== null)
            {
                const entryPosition = sequence.getKey(entryIndex) ?? 0;
                const intoSample = this._position - entryPosition;

                if(sample.id !== 0 && intoSample >= 0) channelSample = new TraxChannelSample(sample, intoSample);
            }

            let blockLength = TraxSequencer.BUFFER_LENGTH;

            if(this._lengthSamples - this._position < blockLength)
            {
                blockLength = this._lengthSamples - this._position;
            }

            let written = 0;

            while(written < blockLength)
            {
                let chunk = blockLength;

                if(entryIndex < sequence.length - 1)
                {
                    const nextPosition = sequence.getKey(entryIndex + 1) ?? 0;

                    if(chunk + this._position >= nextPosition) chunk = nextPosition - this._position;
                }

                if(chunk > blockLength - written) chunk = blockLength - written;

                if(channelIndex === channelCount - 1)
                {
                    if(channelSample !== null)
                    {
                        channelSample.setSample(TraxSequencer.MIXING_BUFFER, written, chunk);
                        written += chunk;
                    }
                    else
                    {
                        for(let i = 0; i < chunk; i++) TraxSequencer.MIXING_BUFFER[written++] = 0;
                    }
                }
                else
                {
                    if(channelSample !== null) channelSample.addSample(TraxSequencer.MIXING_BUFFER, written, chunk);

                    written += chunk;
                }

                if(written < blockLength)
                {
                    sample = sequence.getWithIndex(++entryIndex);
                    channelSample = sample === null || sample.id === 0 ? null : new TraxChannelSample(sample, 0);
                }
            }
        }
    }

    /**
     * AS3: .../TraxSequencer.as::onSampleData()
     *
     * One block: mix, write, advance. A muted song skips the mixing entirely and writes silence —
     * AS3 does the same, which is why muting is free rather than merely inaudible.
     */
    private mixNextBlock(): Float32Array
    {
        if(this._volume > 0) this.mixChannelsIntoBuffer();

        let frames = TraxSequencer.BUFFER_LENGTH;

        if(this._lengthSamples - this._position < frames)
        {
            frames = this._lengthSamples - this._position;

            if(frames < 0) frames = 0;
        }

        if(this._volume <= 0) frames = 0;

        const block = this.writeAudioToOutputStream(frames);

        this._position += TraxSequencer.BUFFER_LENGTH;
        this.checkSongFinishing();

        return block;
    }

    // TS-only: the pull side of Flash's `sampleData` event — see `TraxStreamNode`.
    private pumpBlock(): void
    {
        if(this._finished || this._stream === null) return;

        this._stream.push(this.mixNextBlock());
        this._latencyMs = TraxSequencer.BUFFER_LENGTH / (TraxSequencer.SAMPLES_PER_SECOND / 1000);
    }

    /**
     * AS3: .../TraxSequencer.as::writeAudioToOutputStream()
     *
     * Writes `frames` frames of the mixing buffer as interleaved stereo — the same value to both
     * channels, as AS3 does — and pads the rest of the block with silence.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::writeAudioToOutputStream()
    private writeAudioToOutputStream(frames: number): Float32Array
    {
        const block = new Float32Array(TraxSequencer.BUFFER_LENGTH * 2);

        if(frames <= 0) return block;

        if(!this._fadingIn && !this._fadingOut)
        {
            this.writeMixingBufferToOutputStream(block, frames);

            return block;
        }

        let level = 0;
        let step = 0;

        if(this._fadingIn)
        {
            step = 1 / this._fadeInLengthSamples;
            level = this._fadeInPosition / this._fadeInLengthSamples;
            this._fadeInPosition += TraxSequencer.BUFFER_LENGTH;

            if(this._fadeInPosition > this._fadeInLengthSamples) this._fadingIn = false;
        }
        else if(this._fadingOut)
        {
            step = -1 / this._fadeOutLengthSamples;
            level = 1 - this._fadeOutPosition / this._fadeOutLengthSamples;
            this._fadeOutPosition += TraxSequencer.BUFFER_LENGTH;

            if(this._fadeOutPosition > this._fadeOutLengthSamples)
            {
                this._fadeOutPosition = this._fadeOutLengthSamples;
            }
        }

        this.writeMixingBufferToOutputStreamWithFade(block, frames, level, step);

        return block;
    }

    // AS3: .../TraxSequencer.as::writeMixingBufferToOutputStream()
    private writeMixingBufferToOutputStream(block: Float32Array, frames: number): void
    {
        for(let i = 0; i < frames; i++)
        {
            const value = TraxSequencer.MIXING_BUFFER[i] * 0.000030517578125;

            block[i * 2] = value;
            block[i * 2 + 1] = value;
        }
    }

    /**
     * AS3: .../TraxSequencer.as::writeMixingBufferToOutputStreamWithFade()
     *
     * The ramp runs out mid-block when the fade ends: below 0 the rest of the block is silence,
     * above 1 the rest is written at full level. AS3 breaks out of its loop and finishes in one of
     * two tails, which is what the two loops below are.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::writeMixingBufferToOutputStreamWithFade()
    private writeMixingBufferToOutputStreamWithFade(
        block: Float32Array,
        frames: number,
        level: number,
        step: number
    ): void
    {
        let i = 0;

        while(i < frames)
        {
            if(level < 0 || level > 1) break;

            const value = TraxSequencer.MIXING_BUFFER[i] * 0.000030517578125 * level;

            level += step;
            block[i * 2] = value;
            block[i * 2 + 1] = value;
            i++;
        }

        if(level < 0)
        {
            while(i < frames)
            {
                block[i * 2] = 0;
                block[i * 2 + 1] = 0;
                i++;
            }

            return;
        }

        if(level > 1)
        {
            while(i < frames)
            {
                const value = TraxSequencer.MIXING_BUFFER[i] * 0.000030517578125;

                level += step;
                block[i * 2] = value;
                block[i * 2 + 1] = value;
                i++;
            }
        }
    }

    /**
     * AS3: .../TraxSequencer.as::checkSongFinishing()
     *
     * Two stages, and the order matters: past the end (plus the stream's own latency) the song is
     * marked finished and completes on a short timer, which lets the queued audio drain; before
     * that, crossing into the last `fadeOutLength` samples starts the fade — and cancels any fade
     * *in* still running.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSequencer.as::checkSongFinishing()
    private checkSongFinishing(): void
    {
        const end = this._lengthSamples < this._playLengthSamples
            ? this._lengthSamples
            : (this._playLengthSamples > 0 ? this._playLengthSamples : this._lengthSamples);

        if(this._position > end + this._latencyMs * (TraxSequencer.SAMPLES_PER_SECOND / 1000) && !this._finished)
        {
            this._finished = true;

            if(this._completeTimer !== null) clearTimeout(this._completeTimer);

            this._completeTimer = setTimeout(() => this.onPlayingComplete(), 2);

            return;
        }

        if(this._position > end - this._fadeOutLengthSamples && !this._fadingOut)
        {
            this._fadingIn = false;
            this._fadingOut = true;
            this._fadeOutPosition = 0;
        }
    }

    // AS3: .../TraxSequencer.as::stopWithFadeout()
    // The timer is the fade's own length plus the stream latency — the audio already queued has to
    // play out before the song can be called finished.
    private stopWithFadeout(): void
    {
        if(this._fadeOutStopTimer !== null) return;

        this._fadingOut = true;
        this._fadeOutPosition = 0;

        const delay = this._latencyMs + this._fadeOutLengthSamples / (TraxSequencer.SAMPLES_PER_SECOND / 1000);

        this._fadeOutStopTimer = setTimeout(() => this.onFadeOutComplete(), delay);
    }

    // AS3: .../TraxSequencer.as::stopImmediately()
    private stopImmediately(): void
    {
        this.removeStopTimer();

        if(this._stream !== null)
        {
            this._stream.stop();
            this._stream = null;
        }
    }

    // AS3: .../TraxSequencer.as::onPlayingComplete()
    private onPlayingComplete(): void
    {
        this._completeTimer = null;

        if(this._finished) this.playingComplete();
    }

    // AS3: .../TraxSequencer.as::onFadeOutComplete()
    private onFadeOutComplete(): void
    {
        this.removeFadeoutStopTimer();
        this.playingComplete();
    }

    // AS3: .../TraxSequencer.as::playingComplete()
    private playingComplete(): void
    {
        this.stopImmediately();
        this._events?.emit(
            SoundCompleteEvent.TRAX_SONG_COMPLETE,
            new SoundCompleteEvent(SoundCompleteEvent.TRAX_SONG_COMPLETE, this._songId)
        );
    }

    // AS3: .../TraxSequencer.as::removeFadeoutStopTimer()
    private removeFadeoutStopTimer(): void
    {
        if(this._fadeOutStopTimer !== null)
        {
            clearTimeout(this._fadeOutStopTimer);
            this._fadeOutStopTimer = null;
        }
    }

    // AS3: .../TraxSequencer.as::removeStopTimer()
    private removeStopTimer(): void
    {
        if(this._completeTimer !== null)
        {
            clearTimeout(this._completeTimer);
            this._completeTimer = null;
        }
    }
}
