import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';

/**
 * Generic text content element, used for the `caption`, `subcaption`, and
 * `bodytext` config types.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4133.as
 * (obfuscated as `_SafeCls_4531` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4531.as
 */
export class TextElementHandler implements IElementHandler
{
    private _window: ITextWindow | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4531.as::initialize()
    initialize(_landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        this._window = window as ITextWindow;

        const localizationKey = params[1];

        this._window.caption = '${' + localizationKey + '}';

        if(params.length > 2)
        {
            this._window.width = parseInt(params[2], 10);
        }

        if(params.length > 3 && params[3] === 'true')
        {
            this._window.border = true;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4531.as::refresh()
    refresh(): void
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4531.as::set localizationKey()
    set localizationKey(value: string)
    {
        if(this._window)
        {
            this._window.caption = '${' + value + '}';
        }
    }
}
