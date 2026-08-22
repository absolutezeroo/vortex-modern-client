import {ColorMatrixFilter} from 'pixi.js';

import {GlowFilter} from '@core/utils/GlowFilter';

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
 * furnis get a desaturating ColorMatrixFilter (25% saturation + grey lift) and the wired furni being
 * edited gets the active-wired tint, both pushed onto their FurnitureVisualization.filters.
 *
 * A *wall* item gets a white inner glow on top of the desaturation — negative ids address the wall
 * category, which is how `getFurni()` tells the two apart — and dual-picking adds a warm or a cool
 * tint depending on which of the two sources is being picked.
 *
 * One AS3 layer is still missing: the `furnitureFilter_pbj` edge shader, a compiled Flash Pixel
 * Bender program that would need a GLSL rewrite. It is part of the BW stack, so a selected furni is
 * desaturated but not outlined.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/RoomObjectHighLighter.as
 */
export class RoomObjectHighLighter
{
    // Shared desaturation filter (PixiJS filters can be reused across display objects).
    private static _selectionFilter: ColorMatrixFilter | null = null;

    // Shared active-wired tint filter.
    private static _activeWiredFilter: ColorMatrixFilter | null = null;

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

    // AS3: RoomObjectHighLighter.as::_filterBWWall — its third entry, `GlowFilter(0xFFFFFF, 1, 5, 5,
    // 3, 1, true, false)`. Inner, so it lines the item's own edge rather than haloing the wall.
    private static _wallGlowFilter: GlowFilter | null = null;

    private static wallGlowFilter(): GlowFilter
    {
        if(RoomObjectHighLighter._wallGlowFilter === null)
        {
            RoomObjectHighLighter._wallGlowFilter = new GlowFilter(0xFFFFFF, 1, 5, 5, 3, 1, true, false);
        }

        return RoomObjectHighLighter._wallGlowFilter;
    }

    // AS3: RoomObjectHighLighter.as::_dualPicking1Filter / _dualPicking2Filter. Flash matrices
    // [1.13,0,0,0,35 ; 0,1.13,0,0,35 ; 0,0,1,0,0 ; 0,0,0,1,0] and
    // [1,0,0,0,0 ; 0,1,0,0,0 ; 0,0,1.15,0,40 ; 0,0,0,1,0] — offsets divided by 255 for PixiJS.
    private static _dualPickingFilters: [ColorMatrixFilter | null, ColorMatrixFilter | null] = [null, null];

    private static dualPickingFilter(isFirstSlot: boolean): ColorMatrixFilter
    {
        const index = isFirstSlot ? 0 : 1;
        const cached = RoomObjectHighLighter._dualPickingFilters[index];

        if(cached !== null) return cached;

        const filter = new ColorMatrixFilter();

        filter.matrix = isFirstSlot
            ? [
                1.13, 0, 0, 0, 0.1373,
                0, 1.13, 0, 0, 0.1373,
                0, 0, 1, 0, 0,
                0, 0, 0, 1, 0
            ]
            : [
                1, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1.15, 0, 0.1569,
                0, 0, 0, 1, 0
            ];

        RoomObjectHighLighter._dualPickingFilters[index] = filter;

        return filter;
    }

    // AS3: RoomObjectHighLighter.as::_SafeStr_8420 (the active-wired highlight tint). Flash matrix
    // [0.9,0,0,0,0 ; 0,1,0,0,40 ; 0,0,1,0,80 ; 0,0,0,0.8,0] — green/blue lift + 0.8 alpha, offsets /255.
    private static activeWiredFilter(): ColorMatrixFilter
    {
        if(RoomObjectHighLighter._activeWiredFilter === null)
        {
            const filter = new ColorMatrixFilter();

            filter.matrix = [
                0.9, 0, 0, 0, 0,
                0, 1, 0, 0, 0.1569,
                0, 0, 1, 0, 0.3137,
                0, 0, 0, 0.8, 0
            ];

            RoomObjectHighLighter._activeWiredFilter = filter;
        }

        return RoomObjectHighLighter._activeWiredFilter;
    }

    // AS3: RoomObjectHighLighter.as::addFiltersToFurni() — appends (or, when prepend is set, prepends)
    // a filter array onto the furni's FurnitureVisualization.filters, skipping if any of the filters
    // are already present. Used by VariableHoldersHighlighter to apply an arbitrary filter set to a
    // resolved room object (the instance show/hide path resolves furnis by id instead).
    static addFiltersToFurni(furni: IRoomObject | null, filters: unknown[], prepend: boolean = false): void
    {
        if(furni === null)
        {
            return;
        }

        if(RoomObjectHighLighter.hasFilters(furni, filters))
        {
            return;
        }

        const visualization = furni.getVisualization() as unknown as IFilterableVisualization | null;

        if(visualization === null || !('filters' in visualization))
        {
            return;
        }

        const current = visualization.filters == null ? [] : visualization.filters;
        visualization.filters = prepend ? filters.concat(current) : current.concat(filters);
    }

    // AS3: RoomObjectHighLighter.as::removeFiltersFromFurni() — removes the given filters (by identity)
    // from the furni's FurnitureVisualization.filters.
    static removeFiltersFromFurni(furni: IRoomObject | null, filters: unknown[]): void
    {
        if(furni === null)
        {
            return;
        }

        const visualization = furni.getVisualization() as unknown as IFilterableVisualization | null;

        if(visualization === null || visualization.filters == null)
        {
            return;
        }

        const remaining = visualization.filters.slice();

        for(const filter of filters)
        {
            const index = remaining.indexOf(filter);

            if(index !== -1)
            {
                remaining.splice(index, 1);
            }
        }

        visualization.filters = remaining;
    }

    // AS3: RoomObjectHighLighter.as::hasFilters() — true if any of the given filters is already on the
    // furni's FurnitureVisualization.filters.
    static hasFilters(furni: IRoomObject | null, filters: unknown[]): boolean
    {
        if(furni === null)
        {
            return false;
        }

        const visualization = furni.getVisualization() as unknown as IFilterableVisualization | null;

        if(visualization === null || visualization.filters == null)
        {
            return false;
        }

        const current = visualization.filters;

        for(const filter of filters)
        {
            if(current.indexOf(filter) !== -1)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Marks one furni as selected.
     *
     * A negative id is a wall item — the same encoding `getFurni()` decodes — and only those take
     * the glow: a wall item is flat against the wall, where the desaturation alone leaves no edge
     * to see.
     */
    // AS3: RoomObjectHighLighter.as::show() — activateFurni()
    show(id: number, dualPicking: boolean, slot: number): void
    {
        const filters: unknown[] = id < 0
            ? [RoomObjectHighLighter.selectionFilter(), RoomObjectHighLighter.wallGlowFilter()]
            : [RoomObjectHighLighter.selectionFilter()];

        // Slot 1 warms the picked source, anything else cools it — that is the whole visual
        // difference between "this is source A" and "this is source B".
        if(dualPicking) filters.push(RoomObjectHighLighter.dualPickingFilter(slot === 1));

        this.applyFilters(id, filters);
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

    // AS3: RoomObjectHighLighter.as::highlightActiveWired() — tints the wired furni being edited.
    highlightActiveWired(id: number): void
    {
        this.applyFilters(id, [RoomObjectHighLighter.activeWiredFilter()]);
    }

    // AS3: RoomObjectHighLighter.as::unhighlightActiveWired()
    unhighlightActiveWired(id: number): void
    {
        this.applyFilters(id, null);
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
