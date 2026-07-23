import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';

import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {AssetButtonRowPreset} from '../AssetButtonRowPreset';
import type {SimpleListViewPreset} from '../SimpleListViewPreset';
import {WiredUIPreset} from '../WiredUIPreset';
import type {FloorDrawingPreset} from './FloorDrawingPreset';

/**
 * FloorEditorPreset — wraps the InNeighborhood floor editor: a draw-mode button row above a
 * bordered, centered FloorDrawingPreset canvas, inside a growing container.
 *
 * (Construction wires buttonRow + floorDrawing into a bordered centered container and a vertical list;
 * the port keeps only the container/list as fields — the button row, canvas and centered container are
 * owned and disposed through the list's preset tree, matching the AS3 graph.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/applications/FloorEditorPreset.as
 */
export class FloorEditorPreset extends WiredUIPreset
{
    // AS3: FloorEditorPreset.as::_container
    private _container: IWindowContainer;

    // AS3: FloorEditorPreset.as::_SafeStr_4652 (name derived: the vertical list view)
    private _listView: SimpleListViewPreset;

    // AS3: FloorEditorPreset.as::FloorEditorPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, buttonRow: AssetButtonRowPreset, floorDrawing: FloorDrawingPreset)
    {
        super(roomEvents, presetManager, wiredStyle);

        const borderView = presetManager.createLayout('border_view') as unknown as IRegionWindow;
        borderView.color = wiredStyle.advancedBackgroundColor;
        const centeredContainer = presetManager.createCenteredContainerPreset(floorDrawing, 5, borderView);
        this._listView = presetManager.createSimpleListView(true, [buttonRow, centeredContainer]);
        this._listView.spacing = wiredStyle.genericVerticalSpacing;
        this._container = presetManager.createLayout('growing_container_view') as unknown as IWindowContainer;
        this._container.addChild(this._listView.window);
    }

    // AS3: FloorEditorPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: FloorEditorPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._listView.resizeToWidth(width);
        this._container.width = width;
        this._container.height = this._listView.window.height;
    }

    // AS3: FloorEditorPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._listView];
    }

    // AS3: FloorEditorPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._listView = null as unknown as SimpleListViewPreset;
    }
}
