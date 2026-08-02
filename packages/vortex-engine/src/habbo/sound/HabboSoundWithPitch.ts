import type {IUpdateReceiver} from '@core/runtime/IContext';
import {HabboSoundBase} from './HabboSoundBase';
import {SoundContext} from './SoundContext';

/**
 * A sound played at an arbitrary pitch — what furniture uses to detune one sample across a
 * scale rather than shipping one file per note.
 *
 * Flash has no playback-rate control on `SoundChannel`, so AS3 resamples by hand: it
 * `extract()`s the stereo PCM, keeps the left channel, then walks it at `pitch` samples per
 * step and writes each picked sample to both channels of a new `Sound` via
 * `loadPCMFromByteArray()`. That is ported literally — Web Audio's `playbackRate` would be
 * one line, but it also resamples with interpolation, where this nearest-neighbour walk is
 * audibly the grainier thing the client actually sounds like.
 *
 * The 50 ms of silence and 175 ms ramp in `update()` are AS3's own: the resampled buffer
 * starts with a click, so playback begins muted and fades in.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/HabboSoundWithPitch.as
 */
export class HabboSoundWithPitch extends HabboSoundBase implements IUpdateReceiver
{
    // AS3: .../sound/HabboSoundWithPitch.as::SILENCE_MS
    private static readonly SILENCE_MS: number = 50;

    // AS3: .../sound/HabboSoundWithPitch.as::FADEIN_MS
    private static readonly FADEIN_MS: number = 175;

    // AS3: .../sound/HabboSoundWithPitch.as::HabboSoundWithPitch()
    constructor(soundObject: AudioBuffer, pitch: number = 1)
    {
        super(soundObject);

        this._pitch = pitch;

        this.extractMonoSamples();
        this.setPitch(this._pitch);
    }

    // AS3: .../sound/HabboSoundWithPitch.as::_SafeStr_6744
    private _pitch: number;

    /** The resampled buffer actually played, in place of AS3's second `Sound` instance. */
    // AS3: .../sound/HabboSoundWithPitch.as::_SafeStr_7170
    private _pitchedSound: AudioBuffer | null = null;

    // AS3: .../sound/HabboSoundWithPitch.as::_loadedSamples
    private _loadedSamples: Float32Array | null = null;

    // AS3: .../sound/HabboSoundWithPitch.as::_numSamples
    private _numSamples: number = 0;

    // AS3: .../sound/HabboSoundWithPitch.as::_SafeStr_7614
    private _elapsedMs: number = 0;

    // AS3: .../sound/HabboSoundWithPitch.as::_SafeStr_7698
    private _playStartedAtMs: number = 0;

    // AS3: .../sound/HabboSoundWithPitch.as::_SafeStr_7838
    private _atFullVolume: boolean = false;

    // AS3: .../sound/HabboSoundWithPitch.as::play()
    override play(_startPosition: number = 0): boolean
    {
        this.stop();

        this._playStartedAtMs = this._elapsedMs;
        this._atFullVolume = false;

        this.setComplete(false);
        this.startPitchedChannel();

        return true;
    }

    // AS3: .../sound/HabboSoundWithPitch.as::stop()
    override stop(): boolean
    {
        const channel = this.getSoundChannel();

        if(channel !== null)
        {
            try
            {
                channel.source.stop();
            }
            catch
            {
                // Not started, or already finished.
            }
        }

        return true;
    }

    /**
     * Drives the fade-in. AS3 takes the frame delta and compares elapsed-since-play against
     * two fixed windows: silent below 50 ms, linear ramp to full volume by 175 ms.
     */
    // AS3: .../sound/HabboSoundWithPitch.as::update()
    update(delta: number): void
    {
        this._elapsedMs += delta;

        const sincePlay = this._elapsedMs - this._playStartedAtMs;

        if(this._playStartedAtMs > 0 && sincePlay < HabboSoundWithPitch.SILENCE_MS)
        {
            this.setChannelVolume(0);
        }
        else if(this._playStartedAtMs > 0
            && sincePlay >= HabboSoundWithPitch.SILENCE_MS
            && sincePlay < HabboSoundWithPitch.FADEIN_MS)
        {
            this.setChannelVolume(this.volume * (sincePlay / HabboSoundWithPitch.FADEIN_MS));
        }
        else if(!this._atFullVolume)
        {
            this.setChannelVolume(this.volume);

            this._atFullVolume = true;
        }
    }

    // AS3: .../sound/HabboSoundWithPitch.as::get disposed()
    get disposed(): boolean
    {
        return this._loadedSamples === null;
    }

    /**
     * Walks the mono samples at `pitch` per step, writing each picked sample to both
     * channels — AS3's `while(_loc4_ < _loc3_ && int(_loc2_) * 4 < _loadedSamples.length)`,
     * where the `* 4` is a byte offset into 32-bit floats and so an index here.
     */
    // AS3: .../sound/HabboSoundWithPitch.as::setPitch()
    setPitch(pitch: number): void
    {
        const context = SoundContext.context;
        const samples = this._loadedSamples;

        if(context === null || samples === null)
        {
            return;
        }

        this._pitch = pitch;

        const target = Math.floor(samples.length * this._pitch);
        const picked: number[] = [];

        let cursor = 0;
        let written = 0;

        while(written < target && Math.floor(cursor) < samples.length)
        {
            picked.push(samples[Math.floor(cursor)]!);

            cursor += this._pitch;
            written += 1;
        }

        if(picked.length === 0)
        {
            this._pitchedSound = null;

            return;
        }

        const buffer = context.createBuffer(2, picked.length, context.sampleRate);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for(let i = 0; i < picked.length; i += 1)
        {
            left[i] = picked[i]!;
            right[i] = picked[i]!;
        }

        this._pitchedSound = buffer;
    }

    /**
     * AS3 `extract()`s the source into interleaved stereo floats and keeps every other one,
     * i.e. the left channel. `AudioBuffer` is already deinterleaved, so channel 0 is the
     * same data — copied rather than referenced, because the source buffer is shared with
     * every other instance playing that sample.
     */
    // AS3: .../sound/HabboSoundWithPitch.as::extractMonoSamples()
    private extractMonoSamples(): void
    {
        const source = this.getSoundObject();

        if(source === null)
        {
            return;
        }

        this._loadedSamples = new Float32Array(source.getChannelData(0));
        this._numSamples = this._loadedSamples.length;
    }

    /** TS-only: the `_SafeStr_7170.play(0, 0, new SoundTransform(0))` half of AS3's `play()`. */
    private startPitchedChannel(): void
    {
        const context = SoundContext.context;
        const buffer = this._pitchedSound;

        if(context === null || buffer === null)
        {
            return;
        }

        SoundContext.resume();

        const gain = context.createGain();
        const source = context.createBufferSource();

        source.buffer = buffer;

        // Starts silent, as AS3's `new SoundTransform(0)` does; update() ramps it up.
        gain.gain.value = 0;

        source.connect(gain);
        gain.connect(context.destination);

        source.onended = (): void =>
        {
            this.setComplete(true);
        };

        source.start(0);

        this.setSoundChannel({source, gain, startedAt: context.currentTime});
    }

    // AS3: .../sound/HabboSoundWithPitch.as::dispose()
    override dispose(): void
    {
        super.dispose();

        this._pitchedSound = null;
        this._loadedSamples = null;
    }
}
