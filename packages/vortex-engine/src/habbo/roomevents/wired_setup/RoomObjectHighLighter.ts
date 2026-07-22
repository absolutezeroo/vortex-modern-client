import {ColorMatrixFilter} from 'pixi.js';

import type {IRoomObject} from '@room/object/IRoomObject';

import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';

// Structural view of the bit of FurnitureVisualization this class drives: setting `.filters` marks
// the visualization dirty (_filtersChanged) so the next update re-runs updateSprite and merges the
// filters onto every layer's sprite; RoomRenderingCanvas then mirrors sprite.filters onto the display
// object. Kept structural to avoid a hard import of the concrete visualization class.
interface IFilterableVisualization
{
    filters: unknown[] | null;
}

/**
 * RoomObjectHighLighter — paints the in-room visual feedback for wired furni selection. Selected
 * furnis get a desaturating ColorMatrixFilter (25% saturation + grey lift) pushed onto their
 * FurnitureVisualization.filters, so they read as "greyed out / picked".
 *
 * AS3 applies more layers this port does NOT yet reproduce (documented as TODO on the individual
 * methods): the furnitureFilter_pbj edge shader (a compiled Flash Pixel Bender program that would need
 * a GLSL rewrite), the wall GlowFilter, the dual-picking red/blue source tints, and the yellow
 * active-wired highlight. The dominant "grey" effect is faithful; the rest is deferred.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/RoomObjectHighLighter.as
 */
export class RoomObjectHighLighter
{
    // Shared desaturation filter (PixiJS filters can be reused across display objects).
    private static _selectionFilter: ColorMatrixFilter | null = null;

    // AS3: RoomObjectHighLighter.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: RoomObjectHighLighter.as::RoomObjectHighLighter()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
    }

    // AS3: RoomObjectHighLighter.as::_filterBW (the ColorMatrixFilter half — the ShaderFilter is TODO).
    // Flash matrix (0-255 offsets) [0.25,0,0,0, 0.75*154 ; 0,0.25,0,0, 0.75*154+25.5 ; ...] ported with
    // PixiJS's 0-1 offset convention (offsets divided by 255).
    private static selectionFilter(): ColorMatrixFilter
    {
        if(RoomObjectHighLighter._selectionFilter === null)
        {
            const filter = new ColorMatrixFilter();

            filter.matrix = [
                0.25, 0, 0, 0, 0.4529,
                0, 0.25, 0, 0, 0.5529,
                0, 0, 0.25, 0, 0.5529,
                0, 0, 0, 1, 0
            ];

            RoomObjectHighLighter._selectionFilter = filter;
        }

        return RoomObjectHighLighter._selectionFilter;
    }

    // AS3: RoomObjectHighLighter.as::show() — activateFurni (BW filter). TODO(AS3): wall GlowFilter +
    // dual-picking source tint when param2 (dualPicking) is set.
    show(id: number, _dualPicking: boolean, _slot: number): void
    {
        this.applyFilters(id, [RoomObjectHighLighter.selectionFilter()]);
    }

    // AS3: RoomObjectHighLighter.as::hide() — inactivateFurni (removes the BW filter).
    hide(id: number, _dualPicking: boolean, _slot: number): void
    {
        this.applyFilters(id, null);
    }

    // AS3: RoomObjectHighLighter.as::showAll()
    showAll(ids: Iterable<number>, dualPicking: boolean, slot: number): void
    {
        for(const id of ids)
        {
            this.show(id, dualPicking, slot);
        }
    }

    // AS3: RoomObjectHighLighter.as::hideAll()
    hideAll(ids: Iterable<number>, dualPicking: boolean, slot: number): void
    {
        for(const id of ids)
        {
            this.hide(id, dualPicking, slot);
        }
    }

    // AS3: RoomObjectHighLighter.as::highlightActiveWired()
    highlightActiveWired(_id: number): void
    {
        // TODO(AS3): addFiltersToFurni(getFurni(id), _highlight) — yellow tint on the wired furni itself.
    }

    // AS3: RoomObjectHighLighter.as::unhighlightActiveWired()
    unhighlightActiveWired(_id: number): void
    {
        // TODO(AS3): removeFiltersFromFurni(getFurni(id), _highlight).
    }

    // AS3: RoomObjectHighLighter.as::getFurni() — negative id = wall furni (category 20), else floor (10).
    private getFurni(id: number): IRoomObject | null
    {
        const engine = this._roomEvents.roomEngine;

        if(engine === null)
        {
            return null;
        }

        if(id < 0)
        {
            return engine.getRoomObject(this._roomEvents.roomId, -id, 20);
        }

        return engine.getRoomObject(this._roomEvents.roomId, id, 10);
    }

    // AS3: RoomObjectHighLighter.as::add/removeFiltersFromFurni — sets FurnitureVisualization.filters.
    private applyFilters(id: number, filters: unknown[] | null): void
    {
        const furni = this.getFurni(id);

        if(furni === null)
        {
            return;
        }

        const visualization = furni.getVisualization() as unknown as IFilterableVisualization | null;

        if(visualization === null || !('filters' in visualization))
        {
            return;
        }

        visualization.filters = filters;
    }
}
