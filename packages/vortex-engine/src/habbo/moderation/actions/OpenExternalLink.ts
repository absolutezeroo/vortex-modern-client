/**
 * OpenExternalLink — wires one button so that clicking it opens a URL in a new tab.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/OpenExternalLink.as
 *
 * AS3 takes a `ModerationManager` it never stores or uses; the parameter is kept so the call sites
 * port unchanged. The navigation goes through `HabboWebTools` rather than Flash's `navigateToURL`,
 * which is where every other outbound link in this port goes.
 */
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {ModerationManager} from '../ModerationManager';

export class OpenExternalLink
{
    /** Derived name — `_SafeStr_5520`. */
    // AS3: OpenExternalLink.as::_SafeStr_5520
    private _url: string;

    // AS3: OpenExternalLink.as::OpenExternalLink()
    constructor(_main: ModerationManager, button: IWindow, url: string)
    {
        this._url = url;

        button.procedure = this.onClick;
    }

    // AS3: OpenExternalLink.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        HabboWebTools.navigateToURL(this._url, '_blank');
    };
}
