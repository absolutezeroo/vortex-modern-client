import type {IWindow} from '@core/window/IWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';

/**
 * Static image content element.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4542.as
 */
export class ImageElementHandler implements IElementHandler
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4542.as::initialize()
    initialize(_landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        const bitmapWindow = window as IStaticBitmapWrapperWindow;

        bitmapWindow.assetUri = '${image.library.url}' + params[1];
        bitmapWindow.x = parseInt(params[2], 10);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4542.as::refresh()
    refresh(): void
    {
    }
}
