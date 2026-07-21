import type {ISourceTypeListener} from '../../inputsources/ISourceTypeListener';

/**
 * SourceTypeSelectorParam — value object configuring a source-type selector: the selectable ids, the
 * initially-selected index, and the listener notified of selection changes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/SourceTypeSelectorParam.as
 */
export class SourceTypeSelectorParam
{
    // AS3: SourceTypeSelectorParam.as::ids (backing field)
    private _ids: number[];

    // AS3: SourceTypeSelectorParam.as::currentSelection (backing field)
    private _currentSelection: number;

    // AS3: SourceTypeSelectorParam.as::listener (backing field)
    private _listener: ISourceTypeListener;

    // AS3: SourceTypeSelectorParam.as::SourceTypeSelectorParam()
    constructor(ids: number[], listener: ISourceTypeListener, currentSelection: number = 0)
    {
        this._ids = ids;
        this._currentSelection = currentSelection;
        this._listener = listener;
    }

    // AS3: SourceTypeSelectorParam.as::get ids()
    get ids(): number[]
    {
        return this._ids;
    }

    // AS3: SourceTypeSelectorParam.as::get currentSelection()
    get currentSelection(): number
    {
        return this._currentSelection;
    }

    // AS3: SourceTypeSelectorParam.as::get listener()
    get listener(): ISourceTypeListener
    {
        return this._listener;
    }
}
