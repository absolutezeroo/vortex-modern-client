/**
 * One Trax sample: a decoded loop, stored packed, and the two operations the sequencer performs
 * on it — write into a mixing buffer, or add into one.
 *
 * **Why it is packed.** AS3 keeps the decoded audio in a `Vector.<int>` with two 16-bit values (or
 * four 8-bit ones) per entry, because that was the cheapest buffer Flash offered. The packing is
 * kept here rather than "modernised" to a `Float32Array`: every shift and mask below is AS3's, and
 * the sequencer's mixing arithmetic is written against exactly this layout. Unpacking would mean
 * rewriting the mixer's numerics, which is the one place a silent, audible bug could hide.
 *
 * The int arithmetic wraps at 32 bits in AS3 (`int` is signed 32-bit) and the packing relies on
 * it, so every accumulation here is forced back through `| 0`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/trax/TraxSample.as
 */
export class TraxSample
{
    // AS3: .../TraxSample.as::SAMPLE_FREQUENCY_44KHZ
    static readonly SAMPLE_FREQUENCY_44KHZ: string = 'sample_44khz';

    // AS3: .../TraxSample.as::SAMPLE_FREQUENCY_22KHZ
    static readonly SAMPLE_FREQUENCY_22KHZ: string = 'sample_22khz';

    // AS3: .../TraxSample.as::SAMPLE_FREQUENCY_11KHZ
    static readonly SAMPLE_FREQUENCY_11KHZ: string = 'sample_11khz';

    // AS3: .../TraxSample.as::SAMPLE_SCALE_16BIT
    static readonly SAMPLE_SCALE_16BIT: string = 'sample_16bit';

    // AS3: .../TraxSample.as::SAMPLE_SCALE_8BIT
    static readonly SAMPLE_SCALE_8BIT: string = 'sample_8bit';

    // AS3: .../TraxSample.as::SAMPLE_VALUE_MULTIPLIER
    // 1 / 32768 — what turns a packed value back into the -1..1 range the output stream wants.
    static readonly SAMPLE_VALUE_MULTIPLIER: number = 0.000030517578125;

    // AS3: .../TraxSample.as::FADEOUT_LENGTH
    // The last 32 samples of every loop are ramped to silence, which is what stops a loop point
    // from clicking.
    private static readonly FADEOUT_LENGTH: number = 32;

    // AS3: .../TraxSample.as::MASK_8BIT
    private static readonly MASK_8BIT: number = 0xFF;

    // AS3: .../TraxSample.as::MASK_16BIT
    private static readonly MASK_16BIT: number = 0xFFFF;

    // AS3: .../TraxSample.as::OFFSET_8BIT
    private static readonly OFFSET_8BIT: number = 127;

    // AS3: .../TraxSample.as::OFFSET_16BIT
    private static readonly OFFSET_16BIT: number = 32767;

    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSample.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../TraxSample.as::_sampleData
    private _sampleData: Int32Array | null = null;

    // AS3: .../TraxSample.as::_id
    private _id: number;

    // AS3: .../TraxSample.as::_scale
    // Name DERIVED (`_SafeStr_4863`): how many values are packed into one entry — 2 at 16-bit,
    // 4 at 8-bit.
    private _scale: number = 2;

    // AS3: .../TraxSample.as::_downsampleFactor
    // Name DERIVED (`_SafeStr_4678`): 1 at 44 kHz, 2 at 22 kHz, 4 at 11 kHz. One stored value
    // covers this many output samples.
    private _downsampleFactor: number = 1;

    // AS3: .../TraxSample.as::_usedFromSongs
    // Name DERIVED (`_SafeStr_5718`): the song ids this sample is part of, which is how the
    // sample manager knows what it may unload.
    private _usedFromSongs: number[] = [];

    // AS3: .../TraxSample.as::_usageTimeStamp
    // Name DERIVED (`_SafeStr_9045`).
    private _usageTimeStamp: number = 0;

    /**
     * AS3: .../TraxSample.as::TraxSample()
     *
     * AS3 is handed a `ByteArray` of interleaved stereo floats — a `Sound.extract()` dump — and
     * reads it as pairs, **keeping the left channel and discarding the right**. The port takes the
     * same interleaved layout as a `Float32Array`, so `data.length / 2` is the frame count where
     * AS3 computes `byteArray.length / 8` (two 4-byte floats per frame).
     *
     * Downsampling is an average, accumulated as it reads: `v = v * (n - 1) / n + next / n`.
     */
    constructor(
        data: Float32Array,
        id: number,
        frequency: string = TraxSample.SAMPLE_FREQUENCY_44KHZ,
        scale: string = TraxSample.SAMPLE_SCALE_16BIT
    )
    {
        this._id = id;

        // AS3 initialises this to 65536 and then assigns it again in both branches of the scale
        // test below; the initialiser is dead there too.
        let range: number;

        switch(frequency)
        {
            case TraxSample.SAMPLE_FREQUENCY_22KHZ:
                this._downsampleFactor = 2;
                break;

            case TraxSample.SAMPLE_FREQUENCY_11KHZ:
                this._downsampleFactor = 4;
                break;

            default:
                this._downsampleFactor = 1;
        }

        if(scale !== TraxSample.SAMPLE_SCALE_8BIT)
        {
            this._scale = 2;
            range = 65536;
        }
        else
        {
            this._scale = 4;
            range = 256;
        }

        const valuesPerEntry = this._scale * this._downsampleFactor;
        let frameCount = Math.floor(data.length / 2);

        // Trimmed to a whole number of packed entries — a partial entry is dropped, as in AS3.
        frameCount = Math.floor(frameCount / valuesPerEntry) * valuesPerEntry;

        this._sampleData = new Int32Array(frameCount / valuesPerEntry);

        const step = 1 / (range / 2);
        const outputCount = frameCount / this._downsampleFactor;
        let readIndex = 0;
        let accumulator = 0;

        for(let i = 0; i < outputCount; i++)
        {
            let value = data[readIndex];

            readIndex += 2;

            for(let n = 2; n <= this._downsampleFactor; n++)
            {
                const next = data[readIndex];

                readIndex += 2;
                value = value * (n - 1) / n + next / n;
            }

            if(i >= outputCount - 1 - TraxSample.FADEOUT_LENGTH)
            {
                value *= (outputCount - i - 1) / TraxSample.FADEOUT_LENGTH;
            }

            let quantised = Math.trunc((value + 1) / step);

            if(quantised < 0) quantised = 0;
            else if(quantised >= range) quantised = range - 1;

            accumulator = (accumulator * range + quantised) | 0;

            if(i % this._scale === this._scale - 1)
            {
                this._sampleData[Math.trunc(i / this._scale)] = accumulator;
                accumulator = 0;
            }
        }
    }

    // AS3: .../TraxSample.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../TraxSample.as::get length()
    // In output samples at 44.1 kHz — one stored entry covers `scale * downsampleFactor` of them.
    get length(): number
    {
        return (this._sampleData?.length ?? 0) * this._scale * this._downsampleFactor;
    }

    // AS3: .../TraxSample.as::get usageCount()
    get usageCount(): number
    {
        return this._usedFromSongs.length;
    }

    // AS3: .../TraxSample.as::get usageTimeStamp()
    get usageTimeStamp(): number
    {
        return this._usageTimeStamp;
    }

    // AS3: .../TraxSample.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * AS3: .../TraxSample.as::setSample()
     *
     * Unpacks into `target` from `offset`, **overwriting**. The offset is in output samples and is
     * divided down to an entry index — AS3 does this on an `int`, so it truncates, and the return
     * value multiplies it back up, which is how the caller's offset stays aligned to entries.
     *
     * Running past the end of the sample zero-fills the remainder rather than leaving stale audio.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSample.as::setSample()
    setSample(target: Int32Array, targetOffset: number, count: number, offset: number): number
    {
        if(this._sampleData === null) return offset;

        const valuesPerEntry = this._scale * this._downsampleFactor;
        let entryIndex = Math.trunc(offset / valuesPerEntry);
        let writeIndex = targetOffset;

        if(writeIndex < 0)
        {
            count += writeIndex;
            writeIndex = 0;
        }

        if(count > target.length - writeIndex) count = target.length - writeIndex;

        let entries = Math.trunc(count / valuesPerEntry);
        let zeroFill = 0;

        if(entries > this._sampleData.length - entryIndex)
        {
            zeroFill = (entries - (this._sampleData.length - entryIndex)) * valuesPerEntry;
            entries = this._sampleData.length - entryIndex;

            if(zeroFill > target.length - writeIndex) zeroFill = target.length - writeIndex;
        }

        while(entries-- > 0)
        {
            const packed = this._sampleData[entryIndex++];

            for(const value of this.unpack(packed))
            {
                for(let repeat = 0; repeat < this._downsampleFactor; repeat++)
                {
                    target[writeIndex++] = value;
                }
            }
        }

        while(zeroFill-- > 0) target[writeIndex++] = 0;

        return entryIndex * valuesPerEntry;
    }

    /**
     * AS3: .../TraxSample.as::addSample()
     *
     * The same walk as `setSample()`, mixing instead of overwriting — this is what layers a
     * channel on top of the ones already in the buffer. It has no zero-fill: past the end of the
     * sample there is simply nothing to add.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSample.as::addSample()
    addSample(target: Int32Array, targetOffset: number, count: number, offset: number): number
    {
        if(this._sampleData === null) return offset;

        const valuesPerEntry = this._scale * this._downsampleFactor;
        let entryIndex = Math.trunc(offset / valuesPerEntry);
        let writeIndex = targetOffset;

        if(writeIndex < 0)
        {
            count += writeIndex;
            writeIndex = 0;
        }

        if(count > target.length - writeIndex) count = target.length - writeIndex;

        let entries = Math.trunc(count / valuesPerEntry);

        if(entries > this._sampleData.length - entryIndex) entries = this._sampleData.length - entryIndex;

        while(entries-- > 0)
        {
            const packed = this._sampleData[entryIndex++];

            for(const value of this.unpack(packed))
            {
                for(let repeat = 0; repeat < this._downsampleFactor; repeat++)
                {
                    target[writeIndex] = target[writeIndex] + value;
                    writeIndex++;
                }
            }
        }

        return entryIndex * valuesPerEntry;
    }

    // AS3: .../TraxSample.as::setSample()/addSample()
    // The unpacking both share, written out four times between them in AS3 — two scales, and
    // each again for the downsampled path.
    private unpack(packed: number): number[]
    {
        if(this._scale === 2)
        {
            return [
                ((packed >> 16) & TraxSample.MASK_16BIT) - TraxSample.OFFSET_16BIT,
                (packed & TraxSample.MASK_16BIT) - TraxSample.OFFSET_16BIT
            ];
        }

        // 8-bit values are shifted back up to the 16-bit range they are mixed in.
        return [
            (((packed >> 24) & TraxSample.MASK_8BIT) - TraxSample.OFFSET_8BIT) << 8,
            (((packed >> 16) & TraxSample.MASK_8BIT) - TraxSample.OFFSET_8BIT) << 8,
            (((packed >> 8) & TraxSample.MASK_8BIT) - TraxSample.OFFSET_8BIT) << 8,
            ((packed & TraxSample.MASK_8BIT) - TraxSample.OFFSET_8BIT) << 8
        ];
    }

    // AS3: .../TraxSample.as::setUsageFromSong()
    setUsageFromSong(songId: number, timeStamp: number): void
    {
        if(this._usedFromSongs.indexOf(songId) === -1) this._usedFromSongs.push(songId);

        this._usageTimeStamp = timeStamp;
    }

    // AS3: .../TraxSample.as::isUsedFromSong()
    isUsedFromSong(songId: number): boolean
    {
        return this._usedFromSongs.indexOf(songId) !== -1;
    }

    /**
     * AS3: .../TraxSample.as::dispose()
     *
     * **AS3 never sets `_disposed`** — it drops the two buffers and leaves the flag false, so
     * `disposed` always answers false and a second call runs the same body again. Kept as written:
     * the body is idempotent, nothing in the client reads this `disposed`, and "fixing" it would
     * change what a caller sees.
     *
     * AS3 also nulls its usage array, which would make `usageCount` throw — that one getter has no
     * guard where the other two readers do. The array is emptied here instead, which is the same
     * answer for every guarded path and no crash for the unguarded one.
     */
    // AS3: .../src/com/sulake/habbo/sound/trax/TraxSample.as::dispose()
    dispose(): void
    {
        this._sampleData = null;
        this._usedFromSongs = [];
    }
}
