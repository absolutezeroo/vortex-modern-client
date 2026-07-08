import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import type {IFloatableElementHandler} from '../../interfaces/elements/IFloatableElementHandler';
import {HabboLandingView as HabboLandingViewClass} from '../../HabboLandingView';

/**
 * Section title content element - positions its caption then stretches the
 * header divider line to fill the remaining width.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/TitleElementHandler.as
 */
export class TitleElementHandler implements IElementHandler, IFloatableElementHandler
{
    private _isFloating: boolean = false;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/TitleElementHandler.as::initialize()
    initialize(_landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        const container = window as IWindowContainer;
        const titleKey = params[1];

        this._isFloating = params.length > 2 ? params[2] === 'true' : false;

        const titleText = container.findChildByName('title_txt');

        if(titleText)
        {
            titleText.caption = '${' + titleKey + '}';
        }

        HabboLandingViewClass.positionAfterAndStretch(container, 'title_txt', 'hdr_line');
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/TitleElementHandler.as::isFloating()
    isFloating(value: boolean): boolean
    {
        return value || this._isFloating;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/TitleElementHandler.as::refresh()
    refresh(): void
    {
    }
}
