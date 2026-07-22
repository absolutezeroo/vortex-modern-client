import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import {SliderWindowControllerNew} from '../../common/SliderWindowControllerNew';
import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';
import type {SimpleListViewPreset} from './SimpleListViewPreset';

/**
 * SliderPreset — a slider flanked by left/right nudge icon buttons, laid out horizontally. Exposes the
 * value and a "change" event, both backed by the SliderWindowControllerNew.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/SliderPreset.as
 */
export class SliderPreset extends WiredUIPreset
{
    // AS3: SliderPreset.as::_container
    private _container: IWindowContainer;

    // AS3: SliderPreset.as::_list
    private _list: SimpleListViewPreset;

    // AS3: SliderPreset.as::_controller
    private _controller: SliderWindowControllerNew;

    // AS3: SliderPreset.as::SliderPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, min: number = 0, max: number = 1, step: number = 0)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('container_view') as unknown as IWindowContainer;

        const slider = wiredStyle.createSlider();

        this._controller = new SliderWindowControllerNew(slider, min, max, step);
        this._list = presetManager.createSimpleListView(false, [
            presetManager.createIconButtonPreset('left', () => this._controller.moveSliderToLeft()),
            this.wrapWindow(slider),
            presetManager.createIconButtonPreset('right', () => this._controller.moveSliderToRight())
        ], true);
        this._list.spacing = wiredStyle.LRContainerSpacing;
        this._container.addChild(this._list.window);
        this._list.window.x = wiredStyle.LRContainerMargin;
        this._list.window.y = wiredStyle.LRContainerTopBottomPadding;
    }

    // AS3: SliderPreset.as::set value()
    set value(value: number)
    {
        this._controller.setValue(value);
    }

    // AS3: SliderPreset.as::get value()
    get value(): number
    {
        return this._controller.getValue();
    }

    // AS3: SliderPreset.as::addEventListener()
    addEventListener(type: string, listener: (...args: unknown[]) => void): void
    {
        this._controller.addEventListener(type, listener);
    }

    // AS3: SliderPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: SliderPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
        this._list.resizeToWidth(width - this._wiredStyle.LRContainerMargin * 2);
        this._container.height = this._list.window.height + 2 * this._wiredStyle.LRContainerTopBottomPadding;
    }

    // AS3: SliderPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._list];
    }

    // AS3: SliderPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._list = null as unknown as SimpleListViewPreset;
        this._controller.dispose();
        this._controller = null as unknown as SliderWindowControllerNew;
    }
}
