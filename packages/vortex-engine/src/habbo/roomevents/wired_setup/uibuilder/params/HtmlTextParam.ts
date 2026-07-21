import {TextParam} from './TextParam';

/**
 * HtmlTextParam — a TextParam variant for HtmlPreset, adding whether the rendered HTML text is
 * user-selectable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/HtmlTextParam.as
 */
export class HtmlTextParam extends TextParam
{
    // AS3: HtmlTextParam.as::DEFAULT
    public static readonly DEFAULT: HtmlTextParam = new HtmlTextParam(1);

    // AS3: HtmlTextParam.as::selectable (backing field)
    private _selectable: boolean;

    // AS3: HtmlTextParam.as::HtmlTextParam()
    constructor(mode: number, selectable: boolean = false, maxLines: number = 0)
    {
        super(mode, false, maxLines);
        this._selectable = selectable;
    }

    // AS3: HtmlTextParam.as::get selectable()
    get selectable(): boolean
    {
        return this._selectable;
    }
}
