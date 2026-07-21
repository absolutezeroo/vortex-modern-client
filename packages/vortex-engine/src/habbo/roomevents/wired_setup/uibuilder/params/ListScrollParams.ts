/**
 * ListScrollParams — immutable value object describing how a scrollable list preset should behave
 * (scrollbar visibility, min/max height, sticky header/footer). Passed to
 * PresetManager.createScrollList / WiredUIBuilder.build.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/ListScrollParams.as
 */
export class ListScrollParams
{
    // AS3: ListScrollParams.as::_alwaysShowScrollbar
    private _alwaysShowScrollbar: boolean;

    // AS3: ListScrollParams.as::minHeight (backing field)
    private _minHeight: number;

    // AS3: ListScrollParams.as::maxHeight (backing field)
    private _maxHeight: number;

    // AS3: ListScrollParams.as::stickyFooter (backing field)
    private _stickyFooter: boolean;

    // AS3: ListScrollParams.as::stickyHeader (backing field)
    private _stickyHeader: boolean;

    // AS3: ListScrollParams.as::ListScrollParams()
    constructor(alwaysShowScrollbar: boolean, minHeight: number, maxHeight: number, stickyFooter: boolean = false, stickyHeader: boolean = false)
    {
        this._alwaysShowScrollbar = alwaysShowScrollbar;
        this._minHeight = minHeight;
        this._maxHeight = maxHeight;
        this._stickyFooter = stickyFooter;
        this._stickyHeader = stickyHeader;
    }

    // AS3: ListScrollParams.as::get alwaysShowScrollbar()
    get alwaysShowScrollbar(): boolean
    {
        return this._alwaysShowScrollbar;
    }

    // AS3: ListScrollParams.as::get minHeight()
    get minHeight(): number
    {
        return this._minHeight;
    }

    // AS3: ListScrollParams.as::get maxHeight()
    get maxHeight(): number
    {
        return this._maxHeight;
    }

    // AS3: ListScrollParams.as::get stickyFooter()
    get stickyFooter(): boolean
    {
        return this._stickyFooter;
    }

    // AS3: ListScrollParams.as::get stickyHeader()
    get stickyHeader(): boolean
    {
        return this._stickyHeader;
    }
}
