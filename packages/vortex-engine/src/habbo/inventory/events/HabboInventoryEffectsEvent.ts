/**
 * Dispatched on HabboInventory's event emitter whenever the owned-effects list
 * or an effect's state changes. The me-menu EffectsWidget handler listens for
 * it to re-render.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryEffectsEvent.as
 */
export class HabboInventoryEffectsEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryEffectsEvent.as::HIEE_EFFECTS_CHANGED
    public static readonly HIEE_EFFECTS_CHANGED: string = 'HIEE_EFFECTS_CHANGED';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/events/HabboInventoryEffectsEvent.as::HabboInventoryEffectsEvent()
    constructor(type: string = HabboInventoryEffectsEvent.HIEE_EFFECTS_CHANGED)
    {
        this._type = type;
    }

    private _type: string;

    get type(): string
    {
        return this._type;
    }
}
