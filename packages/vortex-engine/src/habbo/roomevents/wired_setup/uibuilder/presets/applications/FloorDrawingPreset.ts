import type {IWindow} from '@core/window/IWindow';

import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {NeighborhoodFloor} from '../../../common/NeighborhoodFloor';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {BitmapViewPreset} from '../BitmapViewPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * FloorDrawingPreset — the interactive neighborhood floor-drawing canvas for the InNeighborhood selector.
 *
 * PORT STATUS: rendering + interaction are stubbed; the preset provides only the (blank) bitmap surface.
 * The full AS3 implementation is a raw-pixel tile editor: it composites embedded floor_editor and
 * fp_border PNGs into a Flash BitmapData (clone + colorTransform for taken/untaken tiles, copyPixels per
 * cell) and assigns it to the bitmap window, and handles drawing via a window procedure (WindowMouseEvent
 * up/down/move, shift-drag rectangles, line interpolation). None of that pixel-compositing,
 * window-procedure or embedded-asset machinery is ported yet, so the canvas stays blank and read-only.
 *
 * This does NOT affect correctness of the selector: the floor occupancy is held by NeighborhoodFloor and
 * (de)serialized by SpiralUtils in InNeighborhood, independent of this visual editor — existing
 * neighborhoods load and save faithfully; only interactive editing is unavailable.
 *
 * TODO(AS3): port the interactive editor from
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/applications/FloorDrawingPreset.as —
 * updateView() (BitmapData compositing of the tile/border assets), editorWindowProcedure() +
 * applyDraw/allowDraw/interpolateBetweenLastPointAndDrawPoint (mouse drawing), and setMode/setRootTile
 * feedback. Needs a BitmapData pixel layer, the embedded PNG assets, and window-procedure mouse events.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/applications/FloorDrawingPreset.as
 */
export class FloorDrawingPreset extends WiredUIPreset
{
    // AS3: FloorDrawingPreset.as::_SafeStr_5280 (name derived: the bitmap surface)
    private _bitmapView: BitmapViewPreset;

    // AS3: FloorDrawingPreset.as::FloorDrawingPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, _onRootTileChanged: (x: number, y: number) => void)
    {
        super(roomEvents, presetManager, wiredStyle);
        // TODO(AS3): store _onRootTileChanged and set bitmapWindow.procedure = editorWindowProcedure;
        // also build the coloured taken/untaken tile BitmapData from the embedded base tile asset.
        this._bitmapView = presetManager.createBitmapViewPreset();
    }

    // AS3: FloorDrawingPreset.as::setFloor()
    setFloor(_floor: NeighborhoodFloor): void
    {
        // TODO(AS3): store the floor and updateView() (render the occupancy grid).
    }

    // AS3: FloorDrawingPreset.as::setRootTile()
    setRootTile(_x: number, _y: number): void
    {
        // TODO(AS3): store the root tile and updateView() (draw the entry marker).
    }

    // AS3: FloorDrawingPreset.as::setMode()
    setMode(_mode: string): void
    {
        // TODO(AS3): store the draw mode (add_tile / remove_tile / set_root_tile) for the mouse editor.
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
    }
}
