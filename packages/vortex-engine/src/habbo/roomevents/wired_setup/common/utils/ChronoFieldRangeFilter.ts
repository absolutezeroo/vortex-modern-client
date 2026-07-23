/**
 * ChronoFieldRangeFilter — an immutable descriptor for one chrono field's match rule (seconds, minutes,
 * hours, day, year …): whether the filter is active, its [min, max] range, and a default value used when
 * inactive. Produced/consumed by ChronoRangeFilterPreset.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/utils/ChronoFieldRangeFilter.as
 */
export class ChronoFieldRangeFilter
{
    // AS3: ChronoFieldRangeFilter.as::_name
    private readonly _name: string;

    // AS3: ChronoFieldRangeFilter.as::_SafeStr_10229 (name derived from getter useFilter)
    private readonly _useFilter: boolean;

    // AS3: ChronoFieldRangeFilter.as::_min
    private readonly _min: number;

    // AS3: ChronoFieldRangeFilter.as::_SafeStr_6640 (name derived from getter max)
    private readonly _max: number;

    // AS3: ChronoFieldRangeFilter.as::_SafeStr_5242 (name derived from getter defaultValue)
    private readonly _defaultValue: number;

    // AS3: ChronoFieldRangeFilter.as::ChronoFieldRangeFilter()
    constructor(name: string, useFilter: boolean, min: number, max: number, defaultValue: number = 0)
    {
        this._name = name;
        this._useFilter = useFilter;
        this._min = min;
        this._max = max;
        this._defaultValue = defaultValue;
    }

    // AS3: ChronoFieldRangeFilter.as::get defaultValue()
    get defaultValue(): number
    {
        return this._defaultValue;
    }

    // AS3: ChronoFieldRangeFilter.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: ChronoFieldRangeFilter.as::get useFilter()
    get useFilter(): boolean
    {
        return this._useFilter;
    }

    // AS3: ChronoFieldRangeFilter.as::get min()
    get min(): number
    {
        return this._min;
    }

    // AS3: ChronoFieldRangeFilter.as::get max()
    get max(): number
    {
        return this._max;
    }
}
