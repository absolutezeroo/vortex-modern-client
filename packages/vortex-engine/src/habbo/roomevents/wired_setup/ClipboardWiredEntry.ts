/**
 * ClipboardWiredEntry — a snapshot of one wired element's configuration held in the copy/paste
 * clipboard: the form params (intParams / stringParam / variableIds), the picked furni (stuffIds /
 * stuffIds2), the input-source types, plus the per-kind extras (action delay, condition quantifier,
 * selector filter/invert).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/ClipboardWiredEntry.as
 */
export class ClipboardWiredEntry
{
    // AS3: ClipboardWiredEntry.as::_intParams
    private readonly _intParams: number[];

    // AS3: ClipboardWiredEntry.as::_SafeStr_6686 (name derived from getter stringParam)
    private readonly _stringParam: string;

    // AS3: ClipboardWiredEntry.as::_SafeStr_7468 (name derived from getter variableIds)
    private readonly _variableIds: string[];

    // AS3: ClipboardWiredEntry.as::_SafeStr_7374 (name derived from getter stuffIds)
    private readonly _stuffIds: number[];

    // AS3: ClipboardWiredEntry.as::_stuffIds2
    private readonly _stuffIds2: number[];

    // AS3: ClipboardWiredEntry.as::_furniSourceTypes
    private readonly _furniSourceTypes: number[];

    // AS3: ClipboardWiredEntry.as::_userSourceTypes
    private readonly _userSourceTypes: number[];

    // AS3: ClipboardWiredEntry.as::_delayInPulses
    private _delayInPulses: number = 0;

    // AS3: ClipboardWiredEntry.as::_quantifierCode
    private _quantifierCode: number = 0;

    // AS3: ClipboardWiredEntry.as::_SafeStr_8011 (name derived from getter isFilter)
    private _isFilter: boolean = false;

    // AS3: ClipboardWiredEntry.as::_SafeStr_8215 (name derived from getter isInvert)
    private _isInvert: boolean = false;

    // AS3: ClipboardWiredEntry.as::ClipboardWiredEntry()
    constructor(intParams: number[], stringParam: string, variableIds: string[], stuffIds: number[], stuffIds2: number[], furniSourceTypes: number[], userSourceTypes: number[])
    {
        this._intParams = intParams;
        this._stringParam = stringParam;
        this._variableIds = variableIds;
        this._stuffIds = stuffIds;
        this._stuffIds2 = stuffIds2;
        this._furniSourceTypes = furniSourceTypes;
        this._userSourceTypes = userSourceTypes;
    }

    // AS3: ClipboardWiredEntry.as::get intParams()
    get intParams(): number[]
    {
        return this._intParams;
    }

    // AS3: ClipboardWiredEntry.as::get stringParam()
    get stringParam(): string
    {
        return this._stringParam;
    }

    // AS3: ClipboardWiredEntry.as::get variableIds()
    get variableIds(): string[]
    {
        return this._variableIds;
    }

    // AS3: ClipboardWiredEntry.as::get stuffIds()
    get stuffIds(): number[]
    {
        return this._stuffIds;
    }

    // AS3: ClipboardWiredEntry.as::get stuffIds2()
    get stuffIds2(): number[]
    {
        return this._stuffIds2;
    }

    // AS3: ClipboardWiredEntry.as::get furniSourceTypes()
    get furniSourceTypes(): number[]
    {
        return this._furniSourceTypes;
    }

    // AS3: ClipboardWiredEntry.as::get userSourceTypes()
    get userSourceTypes(): number[]
    {
        return this._userSourceTypes;
    }

    // AS3: ClipboardWiredEntry.as::get delayInPulses()
    get delayInPulses(): number
    {
        return this._delayInPulses;
    }

    // AS3: ClipboardWiredEntry.as::set delayInPulses()
    set delayInPulses(value: number)
    {
        this._delayInPulses = value;
    }

    // AS3: ClipboardWiredEntry.as::get quantifierCode()
    get quantifierCode(): number
    {
        return this._quantifierCode;
    }

    // AS3: ClipboardWiredEntry.as::set quantifierCode()
    set quantifierCode(value: number)
    {
        this._quantifierCode = value;
    }

    // AS3: ClipboardWiredEntry.as::get isFilter()
    get isFilter(): boolean
    {
        return this._isFilter;
    }

    // AS3: ClipboardWiredEntry.as::set isFilter()
    set isFilter(value: boolean)
    {
        this._isFilter = value;
    }

    // AS3: ClipboardWiredEntry.as::get isInvert()
    get isInvert(): boolean
    {
        return this._isInvert;
    }

    // AS3: ClipboardWiredEntry.as::set isInvert()
    set isInvert(value: boolean)
    {
        this._isInvert = value;
    }
}
