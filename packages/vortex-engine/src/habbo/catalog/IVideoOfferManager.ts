import type {VideoOfferTypeEnum} from './enum/VideoOfferTypeEnum';
import type {IVideoOfferLauncher} from './IVideoOfferLauncher';

/**
 * The catalog's window onto the SuperSaver rewarded-video ads.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/IVideoOfferManager.as
 */
export interface IVideoOfferManager
{
    // AS3: IVideoOfferManager.as::get enabled()
    readonly enabled: boolean;

    // AS3: IVideoOfferManager.as::load()
    load(launcher: IVideoOfferLauncher): void;

    // AS3: IVideoOfferManager.as::launch()
    launch(type: VideoOfferTypeEnum): boolean;
}
