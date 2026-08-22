/**
 * WaitIndicator
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/WaitIndicator.as
 *
 * Eight dots on a circle, each faded by a rotating phase. Style 1 (Illumina) shades the dots'
 * colour; style 2 (Hitch) fades their alpha instead.
 */
import {Bitmap} from './display/Bitmap';
import {BitmapData} from './display/BitmapData';
import {Sprite} from './display/DisplayObjectContainer';
import {ColorTransform, Rectangle} from './display/Geom';

export class WaitIndicator extends Sprite
{
    // AS3: DOT_COUNT
    private static readonly DOT_COUNT = 8;

    // AS3: _disposed
    private _disposed: boolean = false;

    // AS3: _style
    private _style: number;

    /**
     * TS-only: the dots' own colour transforms. Flash mutates `getChildAt(i).transform.colorTransform`
     * per frame; this runtime keeps the same per-dot state and applies it when painting.
     */
    private readonly _shades: ColorTransform[] = [];

    /** TS-only: `flash.utils.getTimer()`'s origin — ms since the indicator's own start. */
    private readonly _startTime: number = performance.now();

    // AS3: WaitIndicator(_arg_1:int)
    constructor(style: number)
    {
        super();

        this._style = style;

        const white = 0xFFFFFFFF;
        const dot = new BitmapData(4, 4, true, 0);

        dot.setVector(new Rectangle(0, 0, 4, 4), [
            0, white, white, 0,
            white, white, white, white,
            white, white, white, white,
            0, white, white, 0,
        ]);

        for(let i = 0; i < WaitIndicator.DOT_COUNT; i++)
        {
            const bitmap = new Bitmap(dot);
            const radius = style === 1 ? 12 : 8;

            this.addChild(bitmap);
            bitmap.x = Math.trunc(radius * Math.sin((i * Math.PI * 2) / WaitIndicator.DOT_COUNT)) - 3;
            bitmap.y = Math.trunc(radius * Math.cos((i * Math.PI * 2) / WaitIndicator.DOT_COUNT)) - 3;
            this._shades.push(new ColorTransform());
        }

        this.addEventListener('addedToStage', this._onAddedToStage);
    }

    // AS3: get disposed():Boolean
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * AS3: circleShade(_arg_1:int):ColorTransform
     */
    // AS3: .../src/onBoardingHcUi/WaitIndicator.as::circleShade()
    private circleShade(index: number): ColorTransform
    {
        let phase = index / WaitIndicator.DOT_COUNT - (performance.now() - this._startTime) * 0.001;

        phase -= Math.floor(phase);

        if(this._style === 1)
        {
            const shade = (48 + (192 * phase)) / 255;

            return new ColorTransform(shade, shade, shade);
        }

        return new ColorTransform(1, 1, 1, phase);
    }

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        this.removeEventListener('addedToStage', this._onAddedToStage);
        this.addEventListener('enterFrame', this._onEnterFrame);
    };

    // AS3: onEnterFrame(_arg_1:Event)
    private _onEnterFrame = (): void =>
    {
        for(let i = 0; i < WaitIndicator.DOT_COUNT; i++)
        {
            const shade = this.circleShade(i);
            const dot = this.getChildAt(i);

            this._shades[i] = shade;
            dot.alpha = this._style === 1 ? 1 : shade.alphaMultiplier;
        }
    };

    // AS3: dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this.removeEventListener('enterFrame', this._onEnterFrame);
    }
}
