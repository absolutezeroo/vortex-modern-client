import type {IWindow} from '@core/window/IWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import type {ILayoutNameProvider} from '../../interfaces/elements/ILayoutNameProvider';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * Base class for `GenericWidget` button-style content elements: wires a
 * click procedure and a localized caption, subclasses implement `onClick()`.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4133.as
 * (obfuscated as `_SafeCls_4524` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4524.as
 */
export class ButtonElementHandler implements IElementHandler, IDisposable, ILayoutNameProvider
{
    private _landingView: HabboLandingView | null = null;
    private _window: IWindow | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4524.as::get layoutName()
    get layoutName(): string
    {
        return 'element_button';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4524.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._window = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4524.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4524.as::initialize()
    initialize(landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        this._landingView = landingView;
        this._window = window;

        const captionKey = params[1];

        window.procedure = this.onButton;
        window.caption = '${' + captionKey + '}';
    }

    private onButton = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this.onClick();
        }
    };

    protected onClick(): void
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4524.as::refresh()
    refresh(): void
    {
    }

    protected get landingView(): HabboLandingView | null
    {
        return this._landingView;
    }

    protected get window(): IWindow | null
    {
        return this._window;
    }
}
