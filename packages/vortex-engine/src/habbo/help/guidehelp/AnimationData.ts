import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';

/**
 * One frame-cycling bitmap: the window to repaint, the asset name to build frame URIs from, and
 * how many frames there are before it wraps.
 *
 * A plain record with public fields, exactly as AS3 declares it — `GuideSessionController` owns the
 * single timer that walks every registered instance, so nothing here has behaviour of its own.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/guidehelp/AnimationData.as
 */
export class AnimationData
{
    // AS3: .../src/com/sulake/habbo/help/guidehelp/AnimationData.as::window
    window: IStaticBitmapWrapperWindow;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/AnimationData.as::asset
    asset: string;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/AnimationData.as::frameCount
    frameCount: number;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/AnimationData.as::AnimationData()
    constructor(window: IStaticBitmapWrapperWindow, asset: string, frameCount: number)
    {
        this.window = window;
        this.asset = asset;
        this.frameCount = frameCount;
    }
}
