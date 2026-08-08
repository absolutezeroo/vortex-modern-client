import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The three sound volumes, pushed back to the settings view after every read, store or preview.
 *
 * **The constructor argument order does not match the field order.** AS3 takes
 * `(type, trax, furni, ui)` and assigns `_uiVolume = param4`, `_furniVolume = param3`,
 * `_traxVolume = param2` — bottom-up. Every call site passes
 * `(type, soundManager.traxVolume, soundManager.furniVolume, soundManager.genericVolume)`, so the
 * *generic* volume is what surfaces as `uiVolume`. Kept exactly, because swapping the parameters
 * would silently relabel two of the three sliders.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSettingsUpdateEvent.as
 */
export class RoomWidgetSettingsUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetSettingsUpdateEvent.as::SETTINGS
    // Name DERIVED (`_SafeStr_11298`), from its value "RWSUE_SETTINGS".
    public static readonly SETTINGS: string = 'RWSUE_SETTINGS';

    // AS3: .../widget/events/RoomWidgetSettingsUpdateEvent.as::_uiVolume
    // Fed from the sound manager's *generic* volume — see the class note.
    private _uiVolume: number;

    // AS3: .../widget/events/RoomWidgetSettingsUpdateEvent.as::_furniVolume
    private _furniVolume: number;

    // AS3: .../widget/events/RoomWidgetSettingsUpdateEvent.as::_traxVolume
    private _traxVolume: number;

    // AS3: .../widget/events/RoomWidgetSettingsUpdateEvent.as::RoomWidgetSettingsUpdateEvent()
    // The two Flash Event flags AS3 forwards are dropped — see RoomWidgetHabboClubUpdateEvent.
    constructor(type: string, traxVolume: number, furniVolume: number, uiVolume: number)
    {
        super(type);

        this._uiVolume = uiVolume;
        this._furniVolume = furniVolume;
        this._traxVolume = traxVolume;
    }

    // AS3: .../widget/events/RoomWidgetSettingsUpdateEvent.as::get uiVolume()
    public get uiVolume(): number
    {
        return this._uiVolume;
    }

    // AS3: .../widget/events/RoomWidgetSettingsUpdateEvent.as::get furniVolume()
    public get furniVolume(): number
    {
        return this._furniVolume;
    }

    // AS3: .../widget/events/RoomWidgetSettingsUpdateEvent.as::get traxVolume()
    public get traxVolume(): number
    {
        return this._traxVolume;
    }
}
