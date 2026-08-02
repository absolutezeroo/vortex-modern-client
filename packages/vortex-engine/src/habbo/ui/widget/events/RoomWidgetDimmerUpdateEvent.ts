import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';
import {RoomWidgetDimmerUpdateEventPresetItem} from './RoomWidgetDimmerUpdateEventPresetItem';

/**
 * RoomWidgetDimmerUpdateEvent
 *
 * Carries the moodlight's presets to the widget (`RWDUE_PRESETS`), or tells it the furni is
 * gone (`RWDUE_HIDE`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetDimmerUpdateEvent.as
 */
export class RoomWidgetDimmerUpdateEvent extends RoomWidgetUpdateEvent
{
    /** The identifier is obfuscated in every tree (`_SafeStr_11167`); only the value is recovered, and this name is derived from it. */
    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::_SafeStr_11167
    public static readonly PRESETS: string = 'RWDUE_PRESETS';

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::DIMMER_HIDE
    public static readonly DIMMER_HIDE: string = 'RWDUE_HIDE';

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::RoomWidgetDimmerUpdateEvent()
    constructor(type: string)
    {
        super(type);
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::_SafeStr_8834
    private _selectedPresetId: number = 0;

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::get selectedPresetId()
    public get selectedPresetId(): number
    {
        return this._selectedPresetId;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::set selectedPresetId()
    public set selectedPresetId(value: number)
    {
        this._selectedPresetId = value;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::_SafeStr_5957
    private _presets: RoomWidgetDimmerUpdateEventPresetItem[] = [];

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::get presets()
    public get presets(): RoomWidgetDimmerUpdateEventPresetItem[]
    {
        return this._presets;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::get presetCount()
    public get presetCount(): number
    {
        return this._presets.length;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::_SafeStr_7108
    private _itemId: number = 0;

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::get itemId()
    public get itemId(): number
    {
        return this._itemId;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::set itemId()
    public set itemId(value: number)
    {
        this._itemId = value;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::_SafeStr_6008
    private _isOn: boolean = false;

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::get isOn()
    public get isOn(): boolean
    {
        return this._isOn;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::set isOn()
    public set isOn(value: boolean)
    {
        this._isOn = value;
    }

    /** Presets are 1-based on the wire and stored 0-based, hence `id - 1`. */
    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::storePreset()
    public storePreset(id: number, type: number, color: number, light: number): void
    {
        this._presets[id - 1] = new RoomWidgetDimmerUpdateEventPresetItem(id, type, color, light);
    }

    /**
     * AS3 bounds-checks against `_SafeStr_5957.count`, which does not exist on an Array —
     * reading it yields `undefined`, so `param1 >= undefined` is false and the guard passes
     * everything through, returning `undefined` for an out-of-range index. Ported as the
     * length check it was meant to be: the one caller (`FurnitureDimmerWidgetHandler`) loops
     * to `presetCount`, so the corrected guard changes nothing it does, and it stops an
     * out-of-range read from reaching the widget as a fake preset.
     */
    // AS3: .../events/RoomWidgetDimmerUpdateEvent.as::getPreset()
    public getPreset(index: number): RoomWidgetDimmerUpdateEventPresetItem | null
    {
        if(index < 0 || index >= this._presets.length)
        {
            return null;
        }

        return this._presets[index] ?? null;
    }
}
