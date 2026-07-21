import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {WiredUIPreset} from '../WiredUIPreset';
import type {ButtonPreset} from '../ButtonPreset';
import type {ButtonRowPreset} from '../ButtonRowPreset';
import type {SplitterPreset} from '../SplitterPreset';

/**
 * FooterPreset — the wired dialog footer: a top splitter and a row with the save ("ready") and cancel
 * buttons.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/main_layout/FooterPreset.as
 */
export class FooterPreset extends WiredUIPreset
{
    // AS3: FooterPreset.as::_container
    private _container: IItemListWindow;

    // AS3: FooterPreset.as::_splitter
    private _splitter: SplitterPreset;

    // AS3: FooterPreset.as::_buttonRow
    private _buttonRow: ButtonRowPreset;

    // AS3: FooterPreset.as::_saveButton
    private _saveButton: ButtonPreset;

    // AS3: FooterPreset.as::FooterPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, onSave: () => void, onCancel: () => void)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._splitter = presetManager.createSplitter();
        this._saveButton = presetManager.createButton(this.loc('wiredfurni.ready'), onSave);

        const cancel = presetManager.createButton(this.loc('cancel'), onCancel);

        this._buttonRow = presetManager.createButtonRow([this._saveButton, cancel]);
        this._buttonRow.window.x = wiredStyle.sectionLeftRightMargin;
        this._container.spacing = this._wiredStyle.sectionSpacing;
        this._container.addListItem(this._splitter.window);
        this._container.addListItem(this._buttonRow.window);
    }

    // AS3: FooterPreset.as::set saveButtonDisabled()
    set saveButtonDisabled(value: boolean)
    {
        this._saveButton.disabled = value;
    }

    // AS3: FooterPreset.as::set saveButtonCaption()
    set saveButtonCaption(value: string)
    {
        if(this._saveButton != null && this._saveButton.window != null)
        {
            this._saveButton.window.caption = value;
        }
    }

    // AS3: FooterPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: FooterPreset.as::set splitterVisible()
    set splitterVisible(value: boolean)
    {
        this._splitter.visible = value;
    }

    // AS3: FooterPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
        this._splitter.resizeToWidth(width);
        this._buttonRow.resizeToWidth(width - this._wiredStyle.sectionLeftRightMargin * 2);
    }

    // AS3: FooterPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._splitter, this._buttonRow];
    }

    // AS3: FooterPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IItemListWindow;
        this._splitter = null as unknown as SplitterPreset;
        this._buttonRow = null as unknown as ButtonRowPreset;
        this._saveButton = null as unknown as ButtonPreset;
    }
}
