/**
 * TwinkleImages — the six sparkle frames, pulled through the window manager's resource manager.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/TwinkleImages.as
 *
 * The constructor only *requests* the six images; `getImage()` reads whatever has arrived, so an
 * early frame simply draws nothing rather than blocking.
 */
import type {HabboQuestEngine} from './HabboQuestEngine';

export class TwinkleImages
{
    // AS3: TwinkleImages.as::IMAGE_COUNT
    private static readonly IMAGE_COUNT: number = 6;

    // AS3: TwinkleImages.as::_questEngine
    private _questEngine: HabboQuestEngine | null;

    // AS3: TwinkleImages.as::TwinkleImages()
    constructor(questEngine: HabboQuestEngine)
    {
        this._questEngine = questEngine;

        const resourceManager = questEngine.windowManager?.resourceManager ?? null;

        if(resourceManager === null) return;

        for(let index = 1; index <= TwinkleImages.IMAGE_COUNT; index++)
        {
            resourceManager.retrieveAsset(TwinkleImages.getImageUri(index), null);
        }
    }

    // AS3: TwinkleImages.as::getImageUri()
    private static getImageUri(index: number): string
    {
        return '${image.library.questing.url}ach_twinkle' + index + '.png';
    }

    /**
     * AS3 reads the asset out of the window manager's own library after interpolating the URI; the
     * port's `ResourceManager.getAsset()` is the same lookup by resolved name.
     */
    // AS3: TwinkleImages.as::getImage()
    public getImage(index: number): ImageBitmap | null
    {
        if(this._questEngine === null) return null;

        const uri = this._questEngine.interpolate(TwinkleImages.getImageUri(index));

        return this._questEngine.windowManager?.resourceManager?.getAsset(uri) ?? null;
    }

    /**
     * **AS3 has this inverted** — it returns `_questEngine != null`, i.e. "disposed" is true while
     * the object is alive. Kept as written: nothing reads it, and `Animation` decides an object's
     * lifetime through `isFinished()` instead, so correcting it would be an invented change.
     */
    // AS3: TwinkleImages.as::get disposed()
    public get disposed(): boolean
    {
        return this._questEngine !== null;
    }

    // AS3: TwinkleImages.as::dispose()
    public dispose(): void
    {
        this._questEngine = null;
    }
}
