import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.ui.widget.camera.CameraFxPreloader');

/**
 * Sequentially preloads the camera's composite/frame effect textures from the asset host.
 *
 * A singleton with static state, exactly as AS3: `init()` is a no-op once an instance exists, the
 * URL list is consumed destructively by `shift()`, and a failed load is skipped rather than
 * retried, so the queue always drains.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/camera/CameraFxPreloader.as
 */
export class CameraFxPreloader
{
    // AS3: .../ui/widget/camera/CameraFxPreloader.as::ASSETS
    private static _assets: Map<string, ImageBitmap> | null = null;

    // AS3: .../ui/widget/camera/CameraFxPreloader.as::instance
    private static _instance: CameraFxPreloader | null = null;

    // AS3: .../ui/widget/camera/CameraFxPreloader.as::_urls
    private static _urls: string[] = [];

    // AS3: .../ui/widget/camera/CameraFxPreloader.as::_SafeStr_6160
    private static _imageLibraryUrl: string = '';

    // AS3: .../ui/widget/camera/CameraFxPreloader.as::_SafeStr_8972
    private _preloadFinished: boolean = false;

    // AS3: .../ui/widget/camera/CameraFxPreloader.as::CameraFxPreloader()
    constructor()
    {
        void this.loadNextImage();
    }

    // AS3: .../ui/widget/camera/CameraFxPreloader.as::init()
    static init(imageLibraryUrl: string, urls: string[]): void
    {
        if(!CameraFxPreloader._instance)
        {
            CameraFxPreloader._assets = new Map();
            CameraFxPreloader._imageLibraryUrl = imageLibraryUrl;
            CameraFxPreloader._urls = urls;
            CameraFxPreloader._instance = new CameraFxPreloader();
        }
    }

    // AS3: .../ui/widget/camera/CameraFxPreloader.as::preloadFinished()
    static preloadFinished(): boolean
    {
        return CameraFxPreloader._instance !== null ? CameraFxPreloader._instance._preloadFinished : false;
    }

    // AS3: .../ui/widget/camera/CameraFxPreloader.as::getImage()
    static getImage(name: string): ImageBitmap | null
    {
        return CameraFxPreloader._assets !== null ? (CameraFxPreloader._assets.get(name) ?? null) : null;
    }

    /**
	 * AS3 drives this with a single `Loader` plus complete/ioError listeners; the fetch/decode pair
	 * is the same sequence expressed without the event round-trip, and keeps AS3's behaviour of
	 * shifting the URL off the queue in both outcomes.
	 */
    // AS3: .../ui/widget/camera/CameraFxPreloader.as::loadNextImage()
    private async loadNextImage(): Promise<void>
    {
        if(CameraFxPreloader._urls.length === 0)
        {
            this._preloadFinished = true;

            return;
        }

        const name = CameraFxPreloader._urls[0];
        const url = CameraFxPreloader._imageLibraryUrl + 'Habbo-Stories/' + name + '.png';

        try
        {
            const response = await fetch(url);

            if(!response.ok) throw new Error(`HTTP ${response.status}`);

            const bitmap = await createImageBitmap(await response.blob());

            CameraFxPreloader._assets?.set(CameraFxPreloader._urls.shift() as string, bitmap);
        }
        catch
        {
            // AS3: .../ui/widget/camera/CameraFxPreloader.as::loadFailed()
            log.warn(`Camera Fx preloading failed for ${url}`);
            CameraFxPreloader._urls.shift();
        }

        await this.loadNextImage();
    }
}
