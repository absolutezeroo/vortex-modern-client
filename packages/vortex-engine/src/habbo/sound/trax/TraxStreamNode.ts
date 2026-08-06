import {SoundContext} from '../SoundContext';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.sound.trax.TraxStreamNode');

/**
 * TS-only: no AS3 counterpart — this stands in for Flash's `Sound` + `SampleDataEvent` pair.
 *
 * Flash streams generated audio by *pulling*: you call `sound.play()`, the runtime raises
 * `sampleData` whenever it wants more, and you write 8192 stereo frames into the event's byte
 * array. Web Audio has no equivalent event; the closest shape is an `AudioWorklet` — a processor
 * running on the audio thread — fed from a queue the main thread tops up.
 *
 * So the pull is inverted into a request: the processor drains its queue and posts `need` when it
 * is running low, which is what the sequencer answers by mixing another block. When the queue runs
 * dry it outputs silence and posts `starved`, which is exactly what AS3's "Audio buffer under
 * run..." log records.
 *
 * The processor is created from a Blob URL rather than a separate file so the engine stays
 * self-contained: `audioWorklet.addModule()` needs a URL, and a bundled asset path would tie this
 * module to one build setup.
 */
export class TraxStreamNode
{
    /** Frames per block — Flash's `SampleDataEvent` quantum, kept so the mixer is unchanged. */
    static readonly BLOCK_FRAMES: number = 8192;

    /** Ask for more once fewer than this many blocks are queued. */
    private static readonly LOW_WATER_BLOCKS: number = 2;

    private static _modulePromise: Promise<void> | null = null;

    private _node: AudioWorkletNode | null = null;
    private _gain: GainNode | null = null;
    private _pending: Float32Array[] = [];
    private _started: boolean = false;
    private _stopped: boolean = false;
    private _volume: number = 1;

    /** Called on the main thread when the processor wants another block. */
    onNeedMore: (() => void) | null = null;

    /** Called when the queue ran dry and silence had to be emitted. */
    onStarved: (() => void) | null = null;

    /**
     * The worklet processor, as source. It owns the queue and de-interleaves into the two output
     * channels; the sequencer writes the same value to both, as AS3 does.
     */
    private static readonly PROCESSOR_SOURCE: string = `
class TraxStreamProcessor extends AudioWorkletProcessor
{
    constructor()
    {
        super();
        this._blocks = [];
        this._offset = 0;
        this._queuedFrames = 0;
        this._starved = false;
        this.port.onmessage = (event) =>
        {
            if(event.data.type === 'push')
            {
                this._blocks.push(event.data.block);
                this._queuedFrames += event.data.block.length / 2;
                this._starved = false;
            }
            else if(event.data.type === 'flush')
            {
                this._blocks = [];
                this._offset = 0;
                this._queuedFrames = 0;
            }
        };
    }

    process(inputs, outputs)
    {
        const left = outputs[0][0];
        const right = outputs[0][1] ?? outputs[0][0];

        for(let i = 0; i < left.length; i++)
        {
            const block = this._blocks[0];

            if(block === undefined)
            {
                left[i] = 0;
                right[i] = 0;

                if(!this._starved)
                {
                    this._starved = true;
                    this.port.postMessage({type: 'starved'});
                }

                continue;
            }

            left[i] = block[this._offset];
            right[i] = block[this._offset + 1];
            this._offset += 2;
            this._queuedFrames--;

            if(this._offset >= block.length)
            {
                this._blocks.shift();
                this._offset = 0;
            }
        }

        if(this._queuedFrames < ${TraxStreamNode.BLOCK_FRAMES * TraxStreamNode.LOW_WATER_BLOCKS})
        {
            this.port.postMessage({type: 'need'});
        }

        return true;
    }
}

registerProcessor('trax-stream-processor', TraxStreamProcessor);
`;

    /**
     * Starts the node. Loading a worklet module is asynchronous where Flash's `play()` is not, so
     * blocks pushed before the module is ready are held and flushed through once it is — the song
     * starts a few milliseconds late rather than losing its opening bars.
     */
    async start(): Promise<boolean>
    {
        const context = SoundContext.context;

        if(context === null)
        {
            log.warn('No AudioContext — a Trax song cannot be streamed');

            return false;
        }

        if(context.audioWorklet === undefined)
        {
            log.warn('AudioWorklet is unavailable — a Trax song cannot be streamed');

            return false;
        }

        try
        {
            if(TraxStreamNode._modulePromise === null)
            {
                const blob = new Blob([TraxStreamNode.PROCESSOR_SOURCE], {type: 'application/javascript'});

                TraxStreamNode._modulePromise = context.audioWorklet.addModule(URL.createObjectURL(blob));
            }

            await TraxStreamNode._modulePromise;
        }
        catch (error)
        {
            log.error(`Trax stream processor failed to load: ${String(error)}`);

            return false;
        }

        if(this._stopped) return false;

        this._node = new AudioWorkletNode(context, 'trax-stream-processor', {outputChannelCount: [2]});
        this._gain = context.createGain();
        this._gain.gain.value = this._volume;

        this._node.connect(this._gain);
        this._gain.connect(context.destination);

        this._node.port.onmessage = (event: MessageEvent): void =>
        {
            if(event.data.type === 'need') this.onNeedMore?.();
            else if(event.data.type === 'starved') this.onStarved?.();
        };

        this._started = true;

        for(const block of this._pending)
        {
            this._node.port.postMessage({type: 'push', block}, [block.buffer]);
        }

        this._pending = [];

        return true;
    }

    /** Queues one block of interleaved stereo frames. */
    push(block: Float32Array): void
    {
        if(this._stopped) return;

        if(!this._started || this._node === null)
        {
            this._pending.push(block);

            return;
        }

        this._node.port.postMessage({type: 'push', block}, [block.buffer]);
    }

    get volume(): number
    {
        return this._volume;
    }

    set volume(value: number)
    {
        this._volume = value;

        if(this._gain !== null) this._gain.gain.value = value;
    }

    /** Drops everything queued and disconnects. */
    stop(): void
    {
        this._stopped = true;
        this._pending = [];

        if(this._node !== null)
        {
            this._node.port.postMessage({type: 'flush'});
            this._node.port.onmessage = null;
            this._node.disconnect();
            this._node = null;
        }

        if(this._gain !== null)
        {
            this._gain.disconnect();
            this._gain = null;
        }

        this.onNeedMore = null;
        this.onStarved = null;
    }
}
