import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('RewardBadgeElementHandler');

/**
 * Static reward-badge image content element.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4527.as
 */
export class RewardBadgeElementHandler implements IElementHandler
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4527.as::initialize()
    initialize(_landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        const container = window as IWindowContainer;
        const badgeDesc = container.findChildByName('badge_desc');

        if(badgeDesc)
        {
            badgeDesc.caption = '';
        }

        const badgeImage = container.findChildByName('badge_image') as IStaticBitmapWrapperWindow | null;
        const assetUri = '${image.library.url}album1584/' + params[1] + '.png';

        log.debug('IMAGE: ' + assetUri);

        if(badgeImage)
        {
            badgeImage.assetUri = assetUri;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4527.as::refresh()
    refresh(): void
    {
    }
}
