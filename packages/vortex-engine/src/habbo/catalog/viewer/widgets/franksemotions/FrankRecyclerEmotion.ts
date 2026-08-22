import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';

/**
 * A single floating "pat Frank" emotion bubble (random blush/heart, drifts up and fades in).
 * Recycles finished bitmaps through a static pool instead of disposing them.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/franksemotions/FrankRecyclerEmotion.as
 */
export class FrankRecyclerEmotion
{
    private static readonly EMOTIONS = ['franks_emotions_blush', 'franks_emotions_heart'];

    private static readonly TICK_INTERVAL_MS = 1000 / 60;

    private static readonly FADE_IN_RATE = 1.25;

    private static readonly DESPAWN_Y = -50;

    private static readonly POOL: IStaticBitmapWrapperWindow[] = [];

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/franksemotions/FrankRecyclerEmotion.as::_bitmap
    private _bitmap: IStaticBitmapWrapperWindow | null;

    private _timer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/franksemotions/FrankRecyclerEmotion.as::_startTime
    private _startTime: number = 0;

    private _startY: number = 0;

    private _riseSpeed: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/franksemotions/FrankRecyclerEmotion.as::FrankRecyclerEmotion()
    constructor(template: IStaticBitmapWrapperWindow)
    {
        const pooled = FrankRecyclerEmotion.POOL.pop();

        if(pooled != null)
        {
            this._bitmap = pooled;
            this._bitmap.y = template.y;
        }
        else
        {
            this._bitmap = template.clone() as unknown as IStaticBitmapWrapperWindow;
        }

        const emotion = FrankRecyclerEmotion.EMOTIONS[Math.floor(Math.random() * FrankRecyclerEmotion.EMOTIONS.length)];

        this._bitmap.assetUri = emotion;
        this._bitmap.x += Math.floor(Math.random() * 70) - 20;
        this._riseSpeed = -(Math.random() * 80 + 30);
        this._bitmap.blend = 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/franksemotions/FrankRecyclerEmotion.as::start()
    start(container: IWindowContainer): void
    {
        if(!this._bitmap) return;

        container.addChild(this._bitmap as unknown as IWindow);
        this._startTime = performance.now();
        this._startY = this._bitmap.y;
        this._timer = setInterval(() => this.onTick(), FrankRecyclerEmotion.TICK_INTERVAL_MS);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/franksemotions/FrankRecyclerEmotion.as::onTick()
    // TS deviation: AS3's disposed-check branch nulls `_bitmap` then falls through to read it
    // again in the same tick (a decompiler control-flow artifact - the original almost certainly
    // returned here). This port returns immediately instead of reproducing the guaranteed crash.
    private onTick(): void
    {
        if(this._bitmap == null) return;

        if(this._bitmap.disposed)
        {
            this.stopTimer();
            this._bitmap = null;

            return;
        }

        const elapsedSeconds = (performance.now() - this._startTime) / 1000;
        const targetBlend = Math.min(1, elapsedSeconds * FrankRecyclerEmotion.FADE_IN_RATE);

        if(targetBlend > this._bitmap.blend + 0.1 || (this._bitmap.blend < 1 && targetBlend === 1))
        {
            this._bitmap.blend = targetBlend;
        }

        this._bitmap.y = this._startY + this._riseSpeed * elapsedSeconds;

        if(this._bitmap.y < FrankRecyclerEmotion.DESPAWN_Y)
        {
            this.stopTimer();

            if(this._bitmap.parent) this._bitmap.parent = null;

            FrankRecyclerEmotion.POOL.push(this._bitmap);
        }
    }

    private stopTimer(): void
    {
        if(this._timer != null)
        {
            clearInterval(this._timer);
            this._timer = null;
        }
    }
}
