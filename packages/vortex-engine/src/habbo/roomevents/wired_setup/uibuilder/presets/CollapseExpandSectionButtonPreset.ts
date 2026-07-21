import type {IWindow} from '@core/window/IWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * CollapseExpandSectionButtonPreset — the up/down arrow region toggling a section's expanded state.
 * Swaps the visible arrow on click and reports the new state through the callback.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/CollapseExpandSectionButtonPreset.as
 */
export class CollapseExpandSectionButtonPreset extends WiredUIPreset
{
    // AS3: CollapseExpandSectionButtonPreset.as::_region
    private _region: IRegionWindow;

    // AS3: CollapseExpandSectionButtonPreset.as::_callback
    private _callback: ((expanded: boolean) => void) | null;

    // AS3: CollapseExpandSectionButtonPreset.as::CollapseExpandSectionButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, callback: ((expanded: boolean) => void) | null, startExpanded: boolean)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._callback = callback;
        this._region = wiredStyle.createExpandCollapseSectionRegion();
        this.upArrow.visible = startExpanded;
        this.downArrow.visible = !startExpanded;
        this._region.addEventListener('WME_CLICK', this._onButtonClicked);
    }

    // AS3: CollapseExpandSectionButtonPreset.as::get window()
    override get window(): IWindow
    {
        return this._region;
    }

    // AS3: CollapseExpandSectionButtonPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
    }

    // AS3: CollapseExpandSectionButtonPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: CollapseExpandSectionButtonPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._region.width;
    }

    // AS3: CollapseExpandSectionButtonPreset.as::get isExpanded()
    get isExpanded(): boolean
    {
        return this.upArrow.visible;
    }

    // AS3: CollapseExpandSectionButtonPreset.as::onButtonClicked()
    private _onButtonClicked = (_event: WindowMouseEvent): void =>
    {
        const expanded = !this.isExpanded;

        this.upArrow.visible = expanded;
        this.downArrow.visible = !expanded;

        if(this._callback != null)
        {
            this._callback(expanded);
        }
    };

    // AS3: CollapseExpandSectionButtonPreset.as::get upArrow()
    private get upArrow(): IStaticBitmapWrapperWindow
    {
        return this._region.findChildByName('up_arrow') as unknown as IStaticBitmapWrapperWindow;
    }

    // AS3: CollapseExpandSectionButtonPreset.as::get downArrow()
    private get downArrow(): IStaticBitmapWrapperWindow
    {
        return this._region.findChildByName('down_arrow') as unknown as IStaticBitmapWrapperWindow;
    }

    // AS3: CollapseExpandSectionButtonPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._region.dispose();
        this._region = null as unknown as IRegionWindow;
        this._callback = null;
    }
}
