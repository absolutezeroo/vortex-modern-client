import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHTMLTextWindow} from '@core/window/components/IHTMLTextWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {HtmlTextParam} from '../params/HtmlTextParam';
import type {TextParam} from '../params/TextParam';
import {TextPreset} from './TextPreset';

/**
 * HtmlPreset — a TextPreset backed by the style's HTML text view (link support, optional text
 * selection). Forces single-line off multiline and applies the param's `selectable` flag.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/HtmlPreset.as
 */
export class HtmlPreset extends TextPreset
{
    // AS3: HtmlPreset.as::_htmlParam
    private _htmlParam: HtmlTextParam;

    // AS3: HtmlPreset.as::HtmlPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, text: string, param: HtmlTextParam)
    {
        super(roomEvents, presetManager, wiredStyle, text, param);

        this._htmlParam = param;
        (this.window as IHTMLTextWindow).selectable = this._htmlParam.selectable;
    }

    // AS3: HtmlPreset.as::createView()
    protected override createView(): ITextWindow
    {
        return this._wiredStyle.createHtmlView();
    }

    // AS3: HtmlPreset.as::initializeMode()
    protected override initializeMode(param: TextParam): void
    {
        super.initializeMode(param);
        this._window.multiline = false;
    }

    // AS3: HtmlPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._htmlParam = null as unknown as HtmlTextParam;
    }
}
