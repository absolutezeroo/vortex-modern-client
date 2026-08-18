/**
 * One tab of the issue browser (open / picked / mine).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/IIssueBrowserView.as
 *
 * AS3 declares `visible` write-only; the port keeps it a plain property because a write-only
 * accessor on an interface has no TypeScript equivalent — nothing reads it either way.
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';

export interface IIssueBrowserView
{
    // AS3: IIssueBrowserView.as::set visible()
    visible: boolean;

    // AS3: IIssueBrowserView.as::update()
    update(): void;

    // AS3: IIssueBrowserView.as::get view()
    readonly view: IWindowContainer | null;
}
