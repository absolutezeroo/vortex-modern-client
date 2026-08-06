import type {TraxSample} from './TraxSample';

/**
 * A sample being played on a channel, and how far into it the mixer is.
 *
 * It exists to carry that offset: `TraxSample` itself is shared between channels and songs, so it
 * cannot hold a play position — each write returns the new offset and this keeps it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/trax/TraxChannelSample.as
 */
export class TraxChannelSample
{
    // AS3: .../TraxChannelSample.as::_sample
    private _sample: TraxSample;

    // AS3: .../TraxChannelSample.as::_offset
    private _offset: number;

    // AS3: .../TraxChannelSample.as::TraxChannelSample()
    constructor(sample: TraxSample, offset: number)
    {
        this._sample = sample;
        this._offset = offset;
    }

    // AS3: .../TraxChannelSample.as::setSample()
    setSample(target: Int32Array, targetOffset: number, count: number): void
    {
        this._offset = this._sample.setSample(target, targetOffset, count, this._offset);
    }

    // AS3: .../TraxChannelSample.as::addSample()
    addSample(target: Int32Array, targetOffset: number, count: number): void
    {
        this._offset = this._sample.addSample(target, targetOffset, count, this._offset);
    }
}
