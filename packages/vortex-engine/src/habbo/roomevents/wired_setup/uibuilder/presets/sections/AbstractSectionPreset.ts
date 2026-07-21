import type {IWindow} from '@core/window/IWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {SectionParam} from '../../params/SectionParam';
import {WiredUIPreset} from '../WiredUIPreset';
import type {SectionPreset} from '../SectionPreset';

/**
 * AbstractSectionPreset — the base for the concrete wired sections. Subclasses build their content in
 * the constructor and call initializeSection() to wrap it in a titled SectionPreset; this base then
 * delegates window/title/resize/splitter to that section.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/AbstractSectionPreset.as
 */
export class AbstractSectionPreset extends WiredUIPreset
{
    // AS3: AbstractSectionPreset.as::_section
    protected _section!: SectionPreset;

    // AS3: AbstractSectionPreset.as::AbstractSectionPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        super(roomEvents, presetManager, wiredStyle);
    }

    // AS3: AbstractSectionPreset.as::initializeSection()
    protected initializeSection(title: string, content: WiredUIPreset, param: SectionParam | null = null): void
    {
        this._section = this._presetManager.createSection(title, content, param);
    }

    // AS3: AbstractSectionPreset.as::get window()
    override get window(): IWindow
    {
        return this._section.window;
    }

    // AS3: AbstractSectionPreset.as::set sectionTitle()
    set sectionTitle(value: string)
    {
        this._section.titleText = value;
    }

    // AS3: AbstractSectionPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._section.resizeToWidth(width);
    }

    // AS3: AbstractSectionPreset.as::set splitterVisible()
    set splitterVisible(value: boolean)
    {
        this._section.splitterVisible = value;
    }

    // AS3: AbstractSectionPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._section];
    }

    // AS3: AbstractSectionPreset.as::dispose()
    override dispose(): void
    {
        super.dispose();
        this._section = null as unknown as SectionPreset;
    }
}
