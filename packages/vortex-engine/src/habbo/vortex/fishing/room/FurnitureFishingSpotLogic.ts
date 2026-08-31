import {FurnitureLogic} from '@habbo/room/object/logic/furniture/FurnitureLogic';

/**
 * Room-object logic for a fishing spot.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §2.3.
 *
 * **`get widget()` is the whole class, and it is one of four wirings that must all be present.** A
 * furni opens a widget only when its logic names one *and* `RoomUI` creates that widget *and*
 * `RoomDesktop` builds a handler for it *and* `RoomWidgetFactory` builds the widget itself. Three of
 * the four fail silently — the furni is simply inert — which is why they are listed here.
 *
 * The logic is selected by the furni's `logic` field in furnidata (`vortex_fishing_spot`), resolved
 * through `RoomObjectFactory`.
 */
export class FurnitureFishingSpotLogic extends FurnitureLogic
{
    // TS-only: Vortex-only system. Names the widget a click on this furni opens.
    public override get widget(): string | null
    {
        return 'RWE_FISHING_SPOT';
    }
}
