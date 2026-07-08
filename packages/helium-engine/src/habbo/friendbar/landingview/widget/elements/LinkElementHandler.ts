import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import type {IElementHandler} from '../../interfaces/elements/IElementHandler';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

/**
 * External web link content element - warns before navigating away.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4540.as
 */
export class LinkElementHandler implements IElementHandler, IDisposable
{
    private _landingView: HabboLandingView | null = null;
    private _url: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4540.as::dispose()
    dispose(): void
    {
        this._landingView = null;
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4540.as::initialize()
    initialize(landingView: HabboLandingView, window: IWindow, params: string[], _ownerWidget: GenericWidget): void
    {
        this._landingView = landingView;

        const captionKey = params[1];

        this._url = params[2];
        window.procedure = this.onLink;

        const container = window as IWindowContainer;
        const linkText = container.findChildByName('link_txt');

        if(linkText)
        {
            linkText.caption = '${' + captionKey + '}';
        }
    }

    private onLink = (event: WindowEvent): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            this._landingView?.windowManager?.alert('${catalog.alert.external.link.title}', '${catalog.alert.external.link.desc}', 0, null);
            HabboWebTools.openWebPage(this._url);
            this._landingView?.tracking?.trackGoogle('landingView', 'click_link');
        }
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4540.as::refresh()
    refresh(): void
    {
    }
}
