import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRadioButtonWindow} from '@core/window/components/IRadioButtonWindow';
import type {ISelectorWindow} from '@core/window/components/ISelectorWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {RadioButtonParam} from '../params/RadioButtonParam';
import {WiredUIPreset} from './WiredUIPreset';
import {RadioButtonPreset} from './RadioButtonPreset';

/**
 * RadioGroupPreset — a group of mutually-exclusive radio options (backed by a selector window),
 * laid out in one or more columns. A row's "newLine" option spans the remaining width. Exposes the
 * selected id and fires a change callback.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/RadioGroupPreset.as
 */
export class RadioGroupPreset extends WiredUIPreset
{
    // AS3: RadioGroupPreset.as::_container
    private _container: ISelectorWindow;

    // AS3: RadioGroupPreset.as::_radios
    private _radios: RadioButtonPreset[];

    // AS3: RadioGroupPreset.as::_onChange
    private _onChange: ((selected: number) => void) | null = null;

    // AS3: RadioGroupPreset.as::_rows (per-row horizontal lists, when multi-column)
    private _rows: IItemListWindow[] | null = null;

    // AS3: RadioGroupPreset.as::_columns
    private _columns: number;

    // AS3: RadioGroupPreset.as::RadioGroupPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, params: RadioButtonParam[], onChange: ((selected: number) => void) | null, columns: number = 1)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = presetManager.createLayout('radio_group_view') as unknown as ISelectorWindow;
        this._columns = columns;

        let currentRow: IItemListWindow | null = null;

        if(this._columns > 0)
        {
            this._rows = [];
        }

        this._radios = [];

        let rowIndex = -1;
        let columnIndex = 0;

        for(const param of params)
        {
            const last = params[params.length - 1] === param;
            const radio = presetManager.createRadioButton(param, last);

            this._radios.push(radio);

            if(columns > 1)
            {
                if(columnIndex === 0)
                {
                    currentRow = presetManager.createLayout('horizontal_list_view') as unknown as IItemListWindow;
                    currentRow.spacing = wiredStyle.genericHorizontalSpacing;
                    this._rows!.push(currentRow);
                    this.itemList.addListItem(currentRow);
                    rowIndex++;
                }

                currentRow!.addListItem(radio.window);
                radio.layoutRowIndex = rowIndex;
                radio.layoutColumnIndex = columnIndex;
                radio.spanRemainingWidth = param.newLine;

                if(param.newLine || columnIndex === columns - 1)
                {
                    columnIndex = 0;
                }
                else
                {
                    columnIndex++;
                }
            }
            else
            {
                this.itemList.addListItem(radio.window);
            }

            if(onChange != null)
            {
                radio.radioButton.addEventListener('WE_SELECTED', this._onSelectionChange);
            }
        }

        this.selected = 0;
        this._onChange = onChange;
    }

    // AS3: RadioGroupPreset.as::onSelectionChange()
    private _onSelectionChange = (_event: WindowEvent): void =>
    {
        if(this._onChange != null)
        {
            this._onChange(this.selected);
        }
    };

    // AS3: RadioGroupPreset.as::get selected()
    get selected(): number
    {
        return this._container.getSelected()!.id;
    }

    // AS3: RadioGroupPreset.as::set selected()
    set selected(value: number)
    {
        const radio = (this._container as unknown as IWindowContainer).findChildByName(RadioButtonPreset.OPTION_PREFIX + value) as unknown as IRadioButtonWindow;

        this._container.setSelected(radio);
    }

    // AS3: RadioGroupPreset.as::setOptionDisabled()
    setOptionDisabled(index: number, disabled: boolean): void
    {
        this._radios[index].disabled = disabled;
    }

    // AS3: RadioGroupPreset.as::_SafeStr_4547() (name derived: fetch the radio option by index)
    radioAt(index: number): RadioButtonPreset
    {
        return this._radios[index];
    }

    // AS3: RadioGroupPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
        this.itemList.width = width;

        const columnWidth = Math.trunc((width - (this._columns - 1) * this._wiredStyle.genericHorizontalSpacing) / this._columns);

        if(this._columns > 1)
        {
            for(const row of this._rows!)
            {
                row.height = 0;
                row.width = width;
            }
        }

        for(const radio of this._radios)
        {
            let optionWidth = columnWidth;

            if(this._columns > 1 && radio.spanRemainingWidth)
            {
                const used = radio.layoutColumnIndex * columnWidth + radio.layoutColumnIndex * this._wiredStyle.genericHorizontalSpacing;

                optionWidth = Math.max(columnWidth, width - used);
            }

            radio.resizeToWidth(optionWidth);

            if(this._columns > 1)
            {
                const row = this._rows![radio.layoutRowIndex];

                if(radio.window.height > row.height)
                {
                    row.height = radio.window.height;
                }
            }
        }
    }

    // AS3: RadioGroupPreset.as::get itemList()
    private get itemList(): IItemListWindow
    {
        return (this._container as unknown as IWindowContainer).findChildByName('radio_button_list') as unknown as IItemListWindow;
    }

    // AS3: RadioGroupPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: RadioGroupPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [...this._radios];
    }

    // AS3: RadioGroupPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as ISelectorWindow;
        this._radios = null as unknown as RadioButtonPreset[];
        this._onChange = null;
        this._rows = null;
    }
}
