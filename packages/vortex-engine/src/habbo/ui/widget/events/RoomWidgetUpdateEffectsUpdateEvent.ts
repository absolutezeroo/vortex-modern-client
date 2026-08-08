import type {Effect} from '@habbo/inventory/effects/Effect';
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The user's avatar effects, whole. There is no incremental form — every change re-sends the full
 * list off `IHabboInventory.getAvatarEffects()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetUpdateEffectsUpdateEvent.as
 */
export class RoomWidgetUpdateEffectsUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetUpdateEffectsUpdateEvent.as::UPDATE_EFFECTS
    // Name DERIVED (`_SafeStr_11165`), from its value "RWUEUE_UPDATE_EFFECTS".
    public static readonly UPDATE_EFFECTS: string = 'RWUEUE_UPDATE_EFFECTS';

    // AS3: .../widget/events/RoomWidgetUpdateEffectsUpdateEvent.as::_effects
    // Name DERIVED (`_SafeStr_5175`): the field behind `get effects()`. AS3 types it as a bare
    // Array; the port's inventory returns `Effect[]`, which is what it actually holds.
    private _effects: Effect[] | null;

    // AS3: .../widget/events/RoomWidgetUpdateEffectsUpdateEvent.as::RoomWidgetUpdateEffectsUpdateEvent()
    // The type is fixed, not a parameter. The two Flash Event flags AS3 forwards are dropped —
    // see RoomWidgetHabboClubUpdateEvent.
    constructor(effects: Effect[] | null = null)
    {
        super(RoomWidgetUpdateEffectsUpdateEvent.UPDATE_EFFECTS);

        this._effects = effects;
    }

    // AS3: .../widget/events/RoomWidgetUpdateEffectsUpdateEvent.as::get effects()
    public get effects(): Effect[] | null
    {
        return this._effects;
    }
}
