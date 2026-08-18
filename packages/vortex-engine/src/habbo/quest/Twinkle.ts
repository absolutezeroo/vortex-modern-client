/**
 * Twinkle — one sparkle: it waits for its start offset, plays six frames out and back, then
 * reports itself finished forever.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/Twinkle.as
 *
 * Its position is drawn once per animation, at random inside a 44x44 box, which is what makes
 * fifteen of these look like a scatter rather than a row.
 */
import type {IAnimationObject} from './IAnimationObject';
import type {TwinkleImages} from './TwinkleImages';

export class Twinkle implements IAnimationObject
{
    // AS3: Twinkle.as::FRAME_DURATION_IN_MSECS
    private static readonly FRAME_DURATION_IN_MSECS: number = 100;

    // AS3: Twinkle.as::FRAME_NOT_STARTED
    private static readonly FRAME_NOT_STARTED: number = -1;

    // AS3: Twinkle.as::FRAME_FINISHED
    private static readonly FRAME_FINISHED: number = -2;

    /** Six frames out and five back — the sparkle grows and shrinks. */
    // AS3: Twinkle.as::FRAME_SEQUENCE
    private static readonly FRAME_SEQUENCE: ReadonlyArray<number> = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];

    /** Derived name — `_SafeStr_8646`: the box a twinkle's random position is drawn from. */
    // AS3: Twinkle.as::_SafeStr_8646
    private static readonly SCATTER_BOX: {x: number; y: number} = {x: 44, y: 44};

    // AS3: Twinkle.as::_twinkleImages
    private _twinkleImages: TwinkleImages | null;

    /** Derived name — `_SafeStr_9285`: how long after the animation starts this one begins. */
    // AS3: Twinkle.as::_SafeStr_9285
    private _startDelayMs: number;

    /** Derived name — `_SafeStr_6812`: the position drawn in `onAnimationStart()`. */
    // AS3: Twinkle.as::_SafeStr_6812
    private _position: {x: number; y: number} | null = null;

    // AS3: Twinkle.as::Twinkle()
    constructor(twinkleImages: TwinkleImages, startDelayMs: number)
    {
        this._twinkleImages = twinkleImages;
        this._startDelayMs = startDelayMs;
    }

    // AS3: Twinkle.as::get disposed()
    public get disposed(): boolean
    {
        return this._twinkleImages === null;
    }

    // AS3: Twinkle.as::onAnimationStart()
    public onAnimationStart(): void
    {
        this._position = {
            x: Math.round(Math.random() * Twinkle.SCATTER_BOX.x),
            y: Math.round(Math.random() * Twinkle.SCATTER_BOX.y)
        };
    }

    // AS3: Twinkle.as::getPosition()
    public getPosition(_elapsedMs: number): {x: number; y: number} | null
    {
        return this._position;
    }

    // AS3: Twinkle.as::isFinished()
    public isFinished(elapsedMs: number): boolean
    {
        return this.getFrame(elapsedMs) === Twinkle.FRAME_FINISHED;
    }

    /**
     * Before its start offset the frame is `FRAME_NOT_STARTED`, and AS3 indexes the sequence with
     * it — `FRAME_SEQUENCE[-1]` is `undefined` there and the lookup yields nothing. The port
     * returns null explicitly rather than reproducing an out-of-range read.
     */
    // AS3: Twinkle.as::getBitmap()
    public getBitmap(elapsedMs: number): ImageBitmap | null
    {
        const frame = this.getFrame(elapsedMs);

        if(frame < 0) return null;

        return this._twinkleImages?.getImage(Twinkle.FRAME_SEQUENCE[frame]) ?? null;
    }

    // AS3: Twinkle.as::getFrame()
    private getFrame(elapsedMs: number): number
    {
        const sinceStart = elapsedMs - this._startDelayMs;

        if(sinceStart < 0)
        {
            return Twinkle.FRAME_NOT_STARTED;
        }

        const frame = Math.floor(sinceStart / Twinkle.FRAME_DURATION_IN_MSECS);

        if(frame >= Twinkle.FRAME_SEQUENCE.length)
        {
            return Twinkle.FRAME_FINISHED;
        }

        return frame;
    }

    // AS3: Twinkle.as::dispose()
    public dispose(): void
    {
        this._twinkleImages = null;
        this._position = null;
    }
}
