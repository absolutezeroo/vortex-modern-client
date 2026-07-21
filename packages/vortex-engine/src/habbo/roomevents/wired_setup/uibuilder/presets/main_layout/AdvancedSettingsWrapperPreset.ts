import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {WiredUIPreset} from '../WiredUIPreset';
import type {TextualButtonPreset} from '../TextualButtonPreset';
import type {SimpleListViewPreset} from '../SimpleListViewPreset';

/**
 * AdvancedSettingsWrapperPreset — wraps advanced settings behind an expand/collapse link (or always
 * expanded). The advanced content sits on a darker background that blends into the section on expand.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/main_layout/AdvancedSettingsWrapperPreset.as
 */
export class AdvancedSettingsWrapperPreset extends WiredUIPreset
{
    // AS3: AdvancedSettingsWrapperPreset.as::_container
    private _container: IItemListWindow;

    // AS3: AdvancedSettingsWrapperPreset.as::_button
    private _button: TextualButtonPreset | null = null;

    // AS3: AdvancedSettingsWrapperPreset.as::_buttonWrapper
    private _buttonWrapper: WiredUIPreset | null = null;

    // AS3: AdvancedSettingsWrapperPreset.as::_content
    private _content: SimpleListViewPreset;

    // AS3: AdvancedSettingsWrapperPreset.as::_isExpanded
    private _isExpanded: boolean = false;

    // AS3: AdvancedSettingsWrapperPreset.as::_alwaysExpanded
    private _alwaysExpanded: boolean = false;

    // AS3: AdvancedSettingsWrapperPreset.as::AdvancedSettingsWrapperPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, presets: WiredUIPreset[], alwaysExpanded: boolean)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._alwaysExpanded = alwaysExpanded;
        this._container = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._container.spacing = wiredStyle.sectionSpacing;
        this._content = presetManager.createSimpleListView(true, presets);
        this._content.spacing = wiredStyle.sectionSpacing;
        this._content.backgroundColor = wiredStyle.advancedBackgroundColor;
        this.blendingBackgroundColor = wiredStyle.backgroundColor;

        if(!alwaysExpanded)
        {
            this._button = presetManager.createTextualButtonPreset('${wiredfurni.params.sources.expand}', this.expandOrCollapse);
            this._buttonWrapper = this._button.alignCenter();
            this._container.addListItem(this._buttonWrapper.window);
        }
        else
        {
            this.expanded = true;
        }
    }

    // AS3: AdvancedSettingsWrapperPreset.as::set expanded()
    set expanded(value: boolean)
    {
        if(this._isExpanded !== value && !(this._alwaysExpanded && this._isExpanded))
        {
            this.expandOrCollapse();
        }
    }

    // AS3: AdvancedSettingsWrapperPreset.as::expandOrCollapse()
    private expandOrCollapse = (): void =>
    {
        if(this._isExpanded)
        {
            this._container.removeListItem(this._content.window);
            this._isExpanded = false;
            this.blendingBackgroundColor = this._wiredStyle.backgroundColor;
        }
        else
        {
            this._container.addListItem(this._content.window);
            this._isExpanded = true;
            this.blendingBackgroundColor = this._wiredStyle.advancedBackgroundColor;
        }

        if(this._button != null)
        {
            this._button.text = this._isExpanded ? '${wiredfurni.params.sources.collapse}' : '${wiredfurni.params.sources.expand}';
            this._buttonWrapper!.resizeToWidth(this._container.width);
        }
    };

    // AS3: AdvancedSettingsWrapperPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: AdvancedSettingsWrapperPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;

        if(this._buttonWrapper != null)
        {
            this._buttonWrapper.resizeToWidth(width);
        }

        this._content.resizeToWidth(width);
    }

    // AS3: AdvancedSettingsWrapperPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        if(this._buttonWrapper == null)
        {
            return [this._content];
        }

        return [this._buttonWrapper, this._content];
    }

    // AS3: AdvancedSettingsWrapperPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IItemListWindow;
        this._button = null;
        this._buttonWrapper = null;
        this._content = null as unknown as SimpleListViewPreset;
    }
}
