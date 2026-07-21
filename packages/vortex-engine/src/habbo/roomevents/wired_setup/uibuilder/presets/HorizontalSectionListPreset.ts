import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * HorizontalSectionListPreset — arranges child presets side by side, inserting a vertical splitter
 * between each. Distributes the width between static- and flexible-width children (the last flexible
 * child absorbs any rounding remainder) and matches all heights to the tallest child.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/HorizontalSectionListPreset.as
 */
export class HorizontalSectionListPreset extends WiredUIPreset
{
    // AS3: HorizontalSectionListPreset.as::_list
    private _list: IItemListWindow;

    // AS3: HorizontalSectionListPreset.as::_splitters
    private _splitters: IWindow[];

    // AS3: HorizontalSectionListPreset.as::_presets
    private _presets: WiredUIPreset[];

    // AS3: HorizontalSectionListPreset.as::HorizontalSectionListPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, presets: WiredUIPreset[])
    {
        super(roomEvents, presetManager, wiredStyle);

        this._list = presetManager.createLayout('horizontal_list_view') as unknown as IItemListWindow;
        this._list.spacing = 0;
        this._splitters = [];
        this._presets = presets;

        for(let i = 0; i < presets.length; i++)
        {
            const preset = presets[i];

            if(i > 0)
            {
                const splitter = wiredStyle.createSplitterVerticalView();

                splitter.setParamFlag(16, false);
                this._splitters.push(splitter);
                this._list.addListItem(splitter);
            }

            this._list.addListItem(preset.window);
        }
    }

    // AS3: HorizontalSectionListPreset.as::get window()
    override get window(): IWindow
    {
        return this._list;
    }

    // AS3: HorizontalSectionListPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        let splitterWidth = 0;

        if(this._splitters.length > 0)
        {
            splitterWidth = this._splitters[0].width;
        }

        let remaining = width - this._splitters.length * splitterWidth;
        let flexCount = 0;

        for(const preset of this._presets)
        {
            if(preset.hasStaticWidth())
            {
                remaining -= preset.staticWidth;
            }
            else
            {
                flexCount += 1;
            }
        }

        const flexWidth = Math.max(0, Math.trunc(remaining / flexCount));
        let lastFlex: WiredUIPreset | null = null;
        let maxHeight = 0;
        let lastHeight = 0;

        for(const preset of this._presets)
        {
            if(preset.hasStaticWidth())
            {
                preset.resizeToWidth(preset.staticWidth);
            }
            else
            {
                lastFlex = preset;
                preset.resizeToWidth(flexWidth);
                remaining -= flexWidth;
            }

            lastHeight = preset.window.height;

            if(lastHeight > maxHeight)
            {
                maxHeight = lastHeight;
            }
        }

        if(remaining > 0 && lastFlex != null)
        {
            lastFlex.resizeToWidth(flexWidth + remaining);

            if(lastHeight > maxHeight)
            {
                maxHeight = lastHeight;
            }
        }

        for(const splitter of this._splitters)
        {
            splitter.height = maxHeight + this._wiredStyle.sectionSpacing;
        }

        this._list.height = maxHeight;
        this._list.width = width;
        this._list.arrangeListItems();
    }

    // AS3: HorizontalSectionListPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return this._presets;
    }

    // AS3: HorizontalSectionListPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._list.dispose();
        this._list = null as unknown as IItemListWindow;
        this._presets = null as unknown as WiredUIPreset[];
        this._splitters = null as unknown as IWindow[];
    }
}
