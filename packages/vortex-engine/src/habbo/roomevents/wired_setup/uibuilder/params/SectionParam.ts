import type {WiredUIPreset} from '../presets/WiredUIPreset';
import type {SourceTypeSelectorParam} from './SourceTypeSelectorParam';

/**
 * SectionParam — value object configuring a SectionPreset: its expand mode, an optional source-type
 * selector, header options (a left option plus a misc list), and the title's vertical offset.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/SectionParam.as
 */
export class SectionParam
{
    // AS3: SectionParam.as::_SafeStr_10309 (expand-mode enum; name derived — no readable counterpart)
    public static readonly EXPAND_MODE_EXPANDED: number = 0;

    // AS3: SectionParam.as::_SafeStr_10386 (name derived — no readable counterpart)
    public static readonly EXPAND_MODE_COLLAPSED: number = 1;

    // AS3: SectionParam.as::_SafeStr_10391 (name derived — no readable counterpart)
    public static readonly EXPAND_MODE_HIDDEN: number = 2;

    // AS3: SectionParam.as::DEFAULT
    public static readonly DEFAULT: SectionParam = new SectionParam(null, 0);

    // AS3: SectionParam.as::COLLAPSED
    public static readonly COLLAPSED: SectionParam = new SectionParam(null, 1);

    // AS3: SectionParam.as::_SafeStr_5794 (name derived — the "hidden" preset instance)
    public static readonly HIDDEN: SectionParam = new SectionParam(null, 2);

    // AS3: SectionParam.as::miscHeaderOptions (backing field)
    private _miscHeaderOptions: WiredUIPreset[] = [];

    // AS3: SectionParam.as::_expandMode
    private _expandMode: number;

    // AS3: SectionParam.as::sourceTypeSelectorParam (backing field)
    private _sourceTypeSelectorParam: SourceTypeSelectorParam | null;

    // AS3: SectionParam.as::_headerOptionLeft
    private _headerOptionLeft: WiredUIPreset | null;

    // AS3: SectionParam.as::titleYOffset (backing field)
    private _titleYOffset: number;

    // AS3: SectionParam.as::SectionParam()
    constructor(sourceTypeSelectorParam: SourceTypeSelectorParam | null = null, expandMode: number = 0, headerOptionLeft: WiredUIPreset | null = null, titleYOffset: number = 0)
    {
        this._expandMode = expandMode;
        this._sourceTypeSelectorParam = sourceTypeSelectorParam;
        this._headerOptionLeft = headerOptionLeft;
        this._titleYOffset = titleYOffset;
    }

    // AS3: SectionParam.as::get expandMode()
    get expandMode(): number
    {
        return this._expandMode;
    }

    // AS3: SectionParam.as::set expandMode()
    set expandMode(value: number)
    {
        this._expandMode = value;
    }

    // AS3: SectionParam.as::get sourceTypeSelectorParam()
    get sourceTypeSelectorParam(): SourceTypeSelectorParam | null
    {
        return this._sourceTypeSelectorParam;
    }

    // AS3: SectionParam.as::set sourceTypeSelectorParam()
    set sourceTypeSelectorParam(value: SourceTypeSelectorParam | null)
    {
        this._sourceTypeSelectorParam = value;
    }

    // AS3: SectionParam.as::addHeaderOption()
    addHeaderOption(preset: WiredUIPreset): void
    {
        this._miscHeaderOptions.push(preset);
    }

    // AS3: SectionParam.as::get miscHeaderOptions()
    get miscHeaderOptions(): WiredUIPreset[]
    {
        return this._miscHeaderOptions;
    }

    // AS3: SectionParam.as::get headerOptionLeft()
    get headerOptionLeft(): WiredUIPreset | null
    {
        return this._headerOptionLeft;
    }

    // AS3: SectionParam.as::get titleYOffset()
    get titleYOffset(): number
    {
        return this._titleYOffset;
    }

    // AS3: SectionParam.as::set headerOptionLeft()
    set headerOptionLeft(value: WiredUIPreset | null)
    {
        this._headerOptionLeft = value;
    }

    // AS3: SectionParam.as::set titleYOffset()
    set titleYOffset(value: number)
    {
        this._titleYOffset = value;
    }
}
