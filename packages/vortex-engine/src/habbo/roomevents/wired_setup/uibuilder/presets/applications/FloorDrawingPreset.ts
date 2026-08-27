import type {IWindow} from '@core/window/IWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {LineInterpolation} from '@room/utils/LineInterpolation';

import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import {NeighborhoodFloor} from '../../../common/NeighborhoodFloor';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {BitmapViewPreset} from '../BitmapViewPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * FloorDrawingPreset — the interactive neighborhood floor-drawing canvas for the InNeighborhood
 * selector.
 *
 * An isometric grid of tiles the player paints on: click or drag to add, remove, or set the entry
 * tile, shift-drag for a rectangle. Every tile is the same base image tinted two ways (blue for
 * taken, grey for free), with eight border pieces framing the grid.
 *
 * Two things are worth knowing about the geometry. The grid is stored square and *displayed*
 * rotated: `transformToScreenSpace()` is a 2:1 isometric projection with a half-tile stagger, and
 * `transformFromScreenSpace()` is its inverse, which is what turns a mouse position back into a
 * cell. And the visualised square is not always the whole floor — `visualizingRadius` can shrink
 * to the inner square, so every read and write offsets by `RADIUS - visualizingRadius`.
 *
 * The occupancy itself lives in `NeighborhoodFloor` and is (de)serialized by `SpiralUtils` in
 * `InNeighborhood`, independent of this editor.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/applications/FloorDrawingPreset.as
 */
export class FloorDrawingPreset extends WiredUIPreset
{
    /**
     * The channel multipliers AS3 feeds a `ColorTransform`: the taken tile keeps none of its red,
     * the free one is darkened evenly.
     */
    // AS3: FloorDrawingPreset.as::TAKEN_TILE_RGB
    private static readonly TAKEN_TILE_RGB: readonly number[] = [0, 0.4, 0.8];

    // AS3: FloorDrawingPreset.as::UNTAKEN_TILE_RGB
    private static readonly UNTAKEN_TILE_RGB: readonly number[] = [0.2, 0.2, 0.2];

    // AS3: FloorDrawingPreset.as::DRAW_MODES
    private static readonly DRAW_MODES: readonly string[] = ['add_tile', 'remove_tile', 'set_root_tile'];

    /**
     * N, NE, E, SE, S, SW, W, NW — the order matters, `updateView()` indexes into it.
     */
    // TODO(AS3): FloorDrawingPreset.as::floor_editor_border_N, floor_editor_border_NE,
    // floor_editor_border_E, floor_editor_border_SE, floor_editor_border_S,
    // floor_editor_border_SW, floor_editor_border_W, floor_editor_border_NW — plus
    // floor_editor_tile_base and floor_editor_tile_entry — are `[Embed]` asset classes, and
    // FLOOR_EDITOR_BORDERS instantiates each one to pull its bitmapData out. Embedded classes have
    // no TypeScript counterpart — the same artwork ships as files here — so the array below names
    // the assets instead and the ten classes are deliberately not reproduced. Spelled out in full
    // rather than as `N/NE/E/...` so `as3-member-coverage.mjs` can see all ten are accounted for;
    // the abbreviated form left seven of them reading as real port gaps.
    // AS3: FloorDrawingPreset.as::FLOOR_EDITOR_BORDERS
    private static readonly BORDER_ASSETS: readonly string[] = [
        'fp_border_N', 'fp_border_NE', 'fp_border_E', 'fp_border_SE',
        'fp_border_S', 'fp_border_SW', 'fp_border_W', 'fp_border_NW',
    ];

    // AS3: FloorDrawingPreset.as::_SafeStr_5280 (name derived: the bitmap surface)
    private _bitmapView: BitmapViewPreset;

    // AS3: FloorDrawingPreset.as::_SafeStr_7473 (name derived: the root-tile callback)
    private _onRootTileChanged: ((x: number, y: number) => void) | null;

    // AS3: FloorDrawingPreset.as::_tileImageBase
    private _tileImageBase: ImageBitmap | null = null;

    // AS3: FloorDrawingPreset.as::_tileImageEntry
    private _tileImageEntry: ImageBitmap | null = null;

    // AS3: FloorDrawingPreset.as::_tileTaken
    private _tileTaken: ImageBitmap | null = null;

    // AS3: FloorDrawingPreset.as::_tileUntaken
    private _tileUntaken: ImageBitmap | null = null;

    // AS3: FloorDrawingPreset.as::_drawing
    private _drawing: boolean = false;

    /**
     * (-1000, -1000) is AS3's "nowhere yet" sentinel, checked literally in
     * `interpolateBetweenLastPointAndDrawPoint()`.
     */
    // AS3: FloorDrawingPreset.as::_lastDrawAddress
    private _lastDrawAddress: {x: number; y: number} = {x: -1000, y: -1000};

    // AS3: FloorDrawingPreset.as::_selectionStartPoint
    private _selectionStartPoint: {x: number; y: number} = {x: -1000, y: -1000};

    // AS3: FloorDrawingPreset.as::_isRectSelect
    private _isRectSelect: boolean = false;

    // AS3: FloorDrawingPreset.as::_drawMode
    private _drawMode: string = FloorDrawingPreset.DRAW_MODES[0];

    // AS3: FloorDrawingPreset.as::_SafeStr_5140 (name derived: the entry tile's address)
    private _rootTile: {x: number; y: number} = {x: 0, y: 0};

    // AS3: FloorDrawingPreset.as::_floor
    private _floor: NeighborhoodFloor | null = null;

    // AS3: FloorDrawingPreset.as::FloorDrawingPreset()
    constructor(
        roomEvents: HabboUserDefinedRoomEvents,
        presetManager: PresetManager,
        wiredStyle: WiredStyle,
        onRootTileChanged: (x: number, y: number) => void
    )
    {
        super(roomEvents, presetManager, wiredStyle);

        this._onRootTileChanged = onRootTileChanged;
        this._bitmapView = presetManager.createBitmapViewPreset();

        const bitmapWindow = this._bitmapView.bitmapWindow;

        if(bitmapWindow !== null) bitmapWindow.procedure = this.editorWindowProcedure;

        this._tileImageBase = this.loadAsset('floor_editor_tile_base');
        this._tileImageEntry = this.loadAsset('floor_editor_tile_entry');
        this._tileTaken = FloorDrawingPreset.tint(this._tileImageBase, FloorDrawingPreset.TAKEN_TILE_RGB);
        this._tileUntaken = FloorDrawingPreset.tint(this._tileImageBase, FloorDrawingPreset.UNTAKEN_TILE_RGB);
    }

    /**
     * These images are plain embeds in AS3, not wired-style variants, so they are looked up by
     * their bare names rather than through `resolveAssetFullName()`.
     */
    // TS-only: AS3 reads `Bitmap(new floor_editor_tile_base()).bitmapData` off an [Embed]ed class,
    // which this port ships as an ordinary registered image instead.
    private loadAsset(name: string): ImageBitmap | null
    {
        return this._roomEvents.windowManager?.resourceManager?.getAsset(name) ?? null;
    }

    /**
     * Flash's `ColorTransform(r, g, b)` multiplies each channel and leaves alpha alone.
     */
    // AS3: FloorDrawingPreset.as::FloorDrawingPreset() — the two `colorTransform()` calls.
    private static tint(source: ImageBitmap | null, rgb: readonly number[]): ImageBitmap | null
    {
        if(source === null) return null;

        const canvas = new OffscreenCanvas(source.width, source.height);
        const ctx = canvas.getContext('2d');

        if(ctx === null) return null;

        ctx.drawImage(source, 0, 0);

        const image = ctx.getImageData(0, 0, source.width, source.height);
        const {data} = image;

        for(let i = 0; i < data.length; i += 4)
        {
            data[i] = data[i] * rgb[0];
            data[i + 1] = data[i + 1] * rgb[1];
            data[i + 2] = data[i + 2] * rgb[2];
        }

        ctx.putImageData(image, 0, 0);

        return canvas.transferToImageBitmap();
    }

    // AS3: FloorDrawingPreset.as::transformFromScreenSpace()
    private static transformFromScreenSpace(x: number, y: number): {x: number; y: number}
    {
        const halfX = x / 16;
        const halfY = y / 8;

        return {x: Math.trunc(halfY + halfX - 1), y: Math.trunc(halfY - halfX - 1)};
    }

    // AS3: FloorDrawingPreset.as::transformToScreenSpace()
    private static transformToScreenSpace(x: number, y: number): {x: number; y: number}
    {
        return {x: 8 * (x - y + 1), y: 4 * (x + y + 1)};
    }

    // AS3: FloorDrawingPreset.as::setFloor()
    setFloor(floor: NeighborhoodFloor): void
    {
        this._floor = floor;
        this.updateView();
    }

    // AS3: FloorDrawingPreset.as::setRootTile()
    setRootTile(x: number, y: number): void
    {
        this._rootTile.x = x;
        this._rootTile.y = y;
        this.updateView();
    }

    // AS3: FloorDrawingPreset.as::setMode()
    setMode(mode: string): void
    {
        this._drawMode = mode;
    }

    /**
     * Down starts a stroke, move continues it, up ends it.
     *
     * Shift-down opens a *temporary* cache on the floor: every cell the rubber band covers is
     * written into it and cleared again on each move, so dragging the rectangle back smaller undoes
     * what the larger one painted. Only the up commits it.
     */
    // AS3: FloorDrawingPreset.as::editorWindowProcedure()
    private editorWindowProcedure = (event: WindowEvent, _window: IWindow): void =>
    {
        const bitmapWindow = this.bitmapWindow;
        const floor = this._floor;

        if(bitmapWindow === null || floor === null) return;

        const type = event.type;
        const isMove = this._drawing && type === 'WME_MOVE';

        if(type !== 'WME_UP' && type !== 'WME_UP_OUTSIDE' && type !== 'WME_DOWN' && !isMove) return;

        const mouse = event as WindowMouseEvent;
        const originX = Math.trunc(bitmapWindow.width / 2);
        const originY = Math.trunc(bitmapWindow.height / 2 - (bitmapWindow.bitmap?.height ?? 0) / 2);
        const address = FloorDrawingPreset.transformFromScreenSpace(mouse.localX - originX, mouse.localY - originY);

        let changed = false;

        if(type === 'WME_UP' || type === 'WME_UP_OUTSIDE')
        {
            this._drawing = false;

            if(this._isRectSelect)
            {
                this._isRectSelect = false;
                floor.submitTemporaryCache();
            }
        }

        if(type === 'WME_DOWN')
        {
            this._drawing = true;
            this._lastDrawAddress = {x: -1000, y: -1000};

            if(mouse.shiftKey)
            {
                this._isRectSelect = true;
                this._selectionStartPoint = address;
                floor.initTemporaryCache();
            }

            this.applyDraw(address.x, address.y);
            changed = true;
            this.updateView();
            this._lastDrawAddress = address;
        }

        if(isMove)
        {
            if(this._isRectSelect && this._drawMode !== FloorDrawingPreset.DRAW_MODES[2])
            {
                const minX = Math.min(this._selectionStartPoint.x, address.x);
                const maxX = Math.max(this._selectionStartPoint.x, address.x);
                const minY = Math.min(this._selectionStartPoint.y, address.y);
                const maxY = Math.max(this._selectionStartPoint.y, address.y);

                floor.clearTemporaryCache();

                for(let x = minX; x <= maxX; x++)
                {
                    for(let y = minY; y <= maxY; y++)
                    {
                        this.applyDraw(x, y);
                        changed = true;
                    }
                }

                this.updateView();
            }
            else
            {
                if(this._lastDrawAddress.x !== address.x || this._lastDrawAddress.y !== address.y)
                {
                    this.applyDraw(address.x, address.y);
                    changed = true;
                }

                const delta = this.interpolateBetweenLastPointAndDrawPoint(address);

                if(Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) this.updateView();
            }

            this._lastDrawAddress = address;
        }

        if(changed) floor.occupationHasChanged();
    };

    /**
     * Fills in the cells a fast drag skipped between two frames, endpoints excluded — the caller
     * has already painted those.
     */
    // AS3: FloorDrawingPreset.as::interpolateBetweenLastPointAndDrawPoint()
    private interpolateBetweenLastPointAndDrawPoint(point: {x: number; y: number}): {x: number; y: number}
    {
        if(this._lastDrawAddress.x === -1000 && this._lastDrawAddress.y === -1000)
        {
            this._lastDrawAddress.x = point.x;
            this._lastDrawAddress.y = point.y;
        }

        const dx = point.x - this._lastDrawAddress.x;
        const dy = point.y - this._lastDrawAddress.y;
        const points = LineInterpolation.interpolationPoints(
            this._lastDrawAddress.x, this._lastDrawAddress.y, point.x, point.y
        );

        for(const step of points)
        {
            const isEndpoint = (this._lastDrawAddress.x === step.x && this._lastDrawAddress.y === step.y)
                || (point.x === step.x && point.y === step.y);

            if(!isEndpoint) this.applyDraw(step.x, step.y);
        }

        return {x: dx, y: dy};
    }

    // AS3: FloorDrawingPreset.as::applyDraw()
    private applyDraw(x: number, y: number): boolean
    {
        const floor = this._floor;

        if(floor === null || !this.allowDraw(x, y)) return false;

        const offset = NeighborhoodFloor.RADIUS - floor.visualizingRadius;

        switch(this._drawMode)
        {
            case FloorDrawingPreset.DRAW_MODES[0]:
                floor.setOccupied(x + offset, y + offset, true);
                break;
            case FloorDrawingPreset.DRAW_MODES[1]:
                floor.setOccupied(x + offset, y + offset, false);
                break;
            case FloorDrawingPreset.DRAW_MODES[2]:
                // The entry tile is addressed from the centre, not the corner, which is why this
                // one subtracts the radius where the other two add the offset.
                this.setRootTileInternal(x - floor.visualizingRadius, y - floor.visualizingRadius);

                if(this._onRootTileChanged !== null) this._onRootTileChanged(this._rootTile.x, this._rootTile.y);

                break;
        }

        return true;
    }

    // AS3: FloorDrawingPreset.as::setRootTileInternal()
    private setRootTileInternal(x: number, y: number): void
    {
        this._rootTile.x = x;
        this._rootTile.y = y;
    }

    // AS3: FloorDrawingPreset.as::allowDraw()
    private allowDraw(x: number, y: number): boolean
    {
        const floor = this._floor;

        if(floor === null) return false;

        return x >= 0 && y >= 0 && x < floor.visualizingDimension && y < floor.visualizingDimension;
    }

    /**
     * Repaints the whole grid.
     *
     * It builds the draw list first, then measures its bounding box and allocates a canvas exactly
     * that size — the border pieces sit at negative coordinates, so the origin is not known until
     * everything has been placed.
     */
    // AS3: FloorDrawingPreset.as::updateView()
    private updateView(): void
    {
        const bitmapWindow = this.bitmapWindow;
        const floor = this._floor;

        if(bitmapWindow === null || floor === null) return;

        const draws: Array<{point: {x: number; y: number}; image: ImageBitmap | null}> = [];
        const offset = NeighborhoodFloor.RADIUS - floor.visualizingRadius;
        const dimension = floor.visualizingDimension;

        for(let y = 0; y < dimension; y++)
        {
            for(let x = 0; x < dimension; x++)
            {
                draws.push({
                    point: FloorDrawingPreset.transformToScreenSpace(x, y),
                    image: floor.isOccupied(x + offset, y + offset) ? this._tileTaken : this._tileUntaken,
                });
            }
        }

        const radius = floor.visualizingRadius;

        if(this._rootTile.x >= -radius && this._rootTile.x <= radius
            && this._rootTile.y >= -radius && this._rootTile.y <= radius)
        {
            draws.push({
                point: FloorDrawingPreset.transformToScreenSpace(this._rootTile.x + radius, this._rootTile.y + radius),
                image: this._tileImageEntry,
            });
        }

        for(let i = 0; i < dimension; i++)
        {
            draws.push({point: FloorDrawingPreset.transformToScreenSpace(i, -1), image: this.border(0)});
            draws.push({point: FloorDrawingPreset.transformToScreenSpace(i, dimension), image: this.border(4)});
        }

        for(let i = 0; i < dimension; i++)
        {
            draws.push({point: FloorDrawingPreset.transformToScreenSpace(-1, i), image: this.border(6)});
            draws.push({point: FloorDrawingPreset.transformToScreenSpace(dimension, i), image: this.border(2)});
        }

        draws.push({point: FloorDrawingPreset.transformToScreenSpace(-1, -1), image: this.border(7)});
        draws.push({point: FloorDrawingPreset.transformToScreenSpace(dimension, -1), image: this.border(1)});
        draws.push({point: FloorDrawingPreset.transformToScreenSpace(dimension, dimension), image: this.border(3)});
        draws.push({point: FloorDrawingPreset.transformToScreenSpace(-1, dimension), image: this.border(5)});

        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;

        for(const draw of draws)
        {
            if(draw.image === null) continue;

            minX = Math.min(minX, draw.point.x);
            minY = Math.min(minY, draw.point.y);
            maxX = Math.max(maxX, draw.point.x + draw.image.width);
            maxY = Math.max(maxY, draw.point.y + draw.image.height);
        }

        if(maxX <= minX || maxY <= minY) return;

        const canvas = new OffscreenCanvas(maxX - minX, maxY - minY);
        const ctx = canvas.getContext('2d');

        if(ctx === null) return;

        // AS3 allocates the BitmapData with `transparent = false` and the style's background as its
        // fill, so the grid is drawn onto an opaque plate rather than over whatever is behind it.
        ctx.fillStyle = `#${(this._wiredStyle.advancedBackgroundColor & 0xFFFFFF).toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for(const draw of draws)
        {
            if(draw.image === null) continue;

            ctx.drawImage(draw.image, draw.point.x - minX, draw.point.y - minY);
        }

        bitmapWindow.bitmap = canvas.transferToImageBitmap();
        this._bitmapView.setBitmapSize(canvas.width, canvas.height);
        this.resize();
    }

    // TS-only: AS3 holds the eight border bitmaps in a static array built at class-init time; the
    // port resolves them from the resource manager, which is not available that early.
    private border(index: number): ImageBitmap | null
    {
        return this.loadAsset(FloorDrawingPreset.BORDER_ASSETS[index]);
    }

    // AS3: FloorDrawingPreset.as::get bitmapWindow()
    private get bitmapWindow(): IBitmapWrapperWindow | null
    {
        return this._bitmapView?.bitmapWindow ?? null;
    }

    // AS3: FloorDrawingPreset.as::get window()
    override get window(): IWindow
    {
        return this._bitmapView.window;
    }

    // AS3: FloorDrawingPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._bitmapView.resizeToWidth(width);
    }

    // AS3: FloorDrawingPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return this._bitmapView.hasStaticWidth();
    }

    // AS3: FloorDrawingPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._bitmapView.staticWidth;
    }

    // AS3: FloorDrawingPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._bitmapView];
    }

    // AS3: FloorDrawingPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._bitmapView = null as unknown as BitmapViewPreset;
        this._onRootTileChanged = null;
        this._floor = null;
        this._tileImageBase = null;
        this._tileImageEntry = null;
        this._tileTaken = null;
        this._tileUntaken = null;
    }
}
