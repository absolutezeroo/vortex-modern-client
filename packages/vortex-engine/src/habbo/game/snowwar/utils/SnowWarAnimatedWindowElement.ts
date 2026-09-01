import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import {drawIntoBitmapSlot} from '@core/utils/BitmapSlot';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.game.snowwar.utils.SnowWarAnimatedWindowElement');

/**
 * A flipbook on a bitmap window: `prefix1`, `prefix2`, … pulled out of the asset library once and
 * swapped on a timer. Every animated thing in the snow-war windows is one of these — the loading
 * screen, the lobby, the ending panel.
 *
 * `pingPong` appends the middle of the sequence backwards (`n-1` down to `2`), so a 5-frame strip
 * plays as 8 and returns to frame 1 without a jump.
 *
 * A missing frame is not fatal: AS3 pushes a 1x1 bitmap so the modulo indexing stays aligned and
 * logs it. The port keeps the alignment with a null entry instead of allocating a placeholder —
 * `update()` then leaves the slot cleared for that frame, which is what a 1x1 transparent bitmap
 * drew anyway.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/SnowWarAnimatedWindowElement.as
 */
export class SnowWarAnimatedWindowElement implements IDisposable
{
    /** Derived name — `_SafeStr_5360`, the modulo of `update()`. Grows when `pingPong` is set. */
    // AS3: SnowWarAnimatedWindowElement.as::_SafeStr_5360
    private _frameCount: number;

    /** Derived name — `_SafeStr_6318`, the asset-name prefix each frame index is appended to. */
    // AS3: SnowWarAnimatedWindowElement.as::_SafeStr_6318
    private readonly _assetPrefix: string;

    // AS3: SnowWarAnimatedWindowElement.as::_frames
    private readonly _frames: (ImageBitmap | null)[] = [];

    // AS3: SnowWarAnimatedWindowElement.as::_currentFrame
    private _currentFrame: number = 0;

    /** Derived name — `_SafeStr_4860`, the window the frames are drawn into. */
    // AS3: SnowWarAnimatedWindowElement.as::_SafeStr_4860
    private _element: IBitmapWrapperWindow | null;

    /** Derived name — `_SafeStr_4902`. AS3's `flash.utils.Timer`; a `setInterval` handle here. */
    // AS3: SnowWarAnimatedWindowElement.as::_SafeStr_4902
    private _timer: ReturnType<typeof setInterval> | null = null;

    // AS3: SnowWarAnimatedWindowElement.as::_disposed
    private _disposed: boolean = false;

    // AS3: SnowWarAnimatedWindowElement.as::SnowWarAnimatedWindowElement()
    constructor(
        assets: IAssetLibrary,
        element: IBitmapWrapperWindow,
        assetPrefix: string,
        frameCount: number,
        interval: number = 100,
        pingPong: boolean = false
    )
    {
        this._element = element;
        this._assetPrefix = assetPrefix;
        this._frameCount = frameCount;

        for(let frame = 1; frame <= frameCount; frame++)
        {
            this._frames.push(this.loadFrame(assets, frame, 'Missing asset for Snow War: '));
        }

        if(pingPong)
        {
            this._frameCount += frameCount - 2;

            for(let frame = frameCount - 1; frame > 1; frame--)
            {
                this._frames.push(this.loadFrame(assets, frame, 'Missing loop asset for Snow War: '));
            }
        }

        this.update();

        this._timer = setInterval(() => this.update(), interval);
    }

    // AS3: SnowWarAnimatedWindowElement.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // TS-only: AS3 inlines this twice, once per loop, with only the log message differing.
    private loadFrame(assets: IAssetLibrary, frame: number, missingMessage: string): ImageBitmap | null
    {
        const name = this._assetPrefix + frame;

        if(assets.hasAsset(name))
        {
            return (assets.getAssetByName(name)?.content ?? null) as ImageBitmap | null;
        }

        log.warn(missingMessage + name);

        return null;
    }

    /**
     * Steps to the next frame and redraws it, centred in the window.
     *
     * The first call is the constructor's, so the element shows frame 1 — never frame 0 — before
     * the timer has ticked once.
     */
    // AS3: SnowWarAnimatedWindowElement.as::update()
    private update(): void
    {
        if(!this._element) return;

        this._currentFrame = (this._currentFrame + 1) % this._frameCount;

        const frame = this._frames[this._currentFrame] ?? null;

        this._element.bitmap = drawIntoBitmapSlot(frame, this._element.width, this._element.height, false);
        this._element.invalidate();
    }

    // AS3: SnowWarAnimatedWindowElement.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._timer !== null)
        {
            clearInterval(this._timer);
            this._timer = null;
        }

        if(this._element && this._element.bitmap)
        {
            this._element.bitmap = null;
            this._element.invalidate();
        }

        this._element = null;
        this._disposed = true;
    }
}
