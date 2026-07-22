import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';

/**
 * RoomObjectHighLighter — paints the in-room visual feedback for wired furni selection: selected
 * furnis get a black/white desaturation + edge shader (walls also get a glow), the active wired furni
 * gets a yellow tint, and dual-picking mode tints source-set 1 / source-set 2 differently. It does
 * this by pushing PixiJS filters onto each furni's FurnitureVisualization.filters.
 *
 * TODO(AS3): VISUAL HIGHLIGHT NOT PORTED. The AS3 class builds five filter stacks in its ctor and
 * applies them via addFiltersToFurni(roomObject.getVisualization().filters, ...):
 *   - _filterBW      = [ColorMatrixFilter(desaturate 0.75), ShaderFilter(furnitureFilter_pbj)]
 *   - _filterBWWall  = _filterBW + GlowFilter(0xFFFFFF, 1, 5, 5, 3, 1, true, false)
 *   - _highlight     = [ColorMatrixFilter(yellow tint)]           (active wired furni)
 *   - _dualPicking1  = [ColorMatrixFilter(red-ish tint)]          (source set 1)
 *   - _dualPicking2  = [ColorMatrixFilter(blue-ish tint)]         (source set 2)
 * ColorMatrixFilter/GlowFilter have PixiJS equivalents, but `furnitureFilter_pbj` is a compiled Flash
 * Pixel Bender shader that must be reimplemented in GLSL, and the port's FurnitureVisualization needs a
 * `.filters` surface. Until then every method here is a no-op, so functional selection (toggle + count
 * + save) works without the on-furni glow.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/RoomObjectHighLighter.as
 */
export class RoomObjectHighLighter
{
    // AS3: RoomObjectHighLighter.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: RoomObjectHighLighter.as::RoomObjectHighLighter()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
    }

    // AS3: RoomObjectHighLighter.as::show()
    show(_id: number, _dualPicking: boolean, _slot: number): void
    {
        // TODO(AS3): activateFurni(getFurni(id), id < 0, dualPicking, slot) — apply the BW/wall filters.
    }

    // AS3: RoomObjectHighLighter.as::hide()
    hide(_id: number, _dualPicking: boolean, _slot: number): void
    {
        // TODO(AS3): inactivateFurni(getFurni(id), id < 0, dualPicking, slot) — remove the BW filters.
    }

    // AS3: RoomObjectHighLighter.as::showAll()
    showAll(_ids: Iterable<number>, _dualPicking: boolean, _slot: number): void
    {
        // TODO(AS3): activateFurni for each id in the dictionary.
    }

    // AS3: RoomObjectHighLighter.as::hideAll()
    hideAll(_ids: Iterable<number>, _dualPicking: boolean, _slot: number): void
    {
        // TODO(AS3): inactivateFurni for each id in the dictionary.
    }

    // AS3: RoomObjectHighLighter.as::highlightActiveWired()
    highlightActiveWired(_id: number): void
    {
        // TODO(AS3): addFiltersToFurni(getFurni(id), _highlight) — yellow tint on the wired furni.
    }

    // AS3: RoomObjectHighLighter.as::unhighlightActiveWired()
    unhighlightActiveWired(_id: number): void
    {
        // TODO(AS3): removeFiltersFromFurni(getFurni(id), _highlight).
    }
}
