import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {SectionParam} from '../../params/SectionParam';
import type {ItemTypeSelectionPreset} from '../contracts/ItemTypeSelectionPreset';
import type {ChestItemIconPreviewerPreset} from '../contracts/ChestItemIconPreviewerPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * The titled "pick a furniture type" block: the picker itself, with a live icon of the current
 * selection floated into the section's header.
 *
 * The two halves are wired here rather than inside the picker — the picker announces a change and
 * this section forwards it to the previewer, which is why the previewer needs no knowledge of the
 * table.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/ItemTypeSelectionSection.as
 */
export class ItemTypeSelectionSection extends AbstractSectionPreset
{
    // AS3: ItemTypeSelectionSection.as::_SafeStr_5682 (name derived: the item-type picker)
    private _picker: ItemTypeSelectionPreset | null;

    // AS3: ItemTypeSelectionSection.as::_SafeStr_6819 (name derived: the header icon)
    private _iconPreviewer: ChestItemIconPreviewerPreset | null;

    // AS3: ItemTypeSelectionSection.as::ItemTypeSelectionSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._picker = presetManager.createItemTypeSelectionPreset();
        this._iconPreviewer = presetManager.createChestItemIconPreviewerPreset();

        const param = new SectionParam();

        // `floatVertically()` returns the preset, which is what goes into the header slot.
        param.addHeaderOption(this._iconPreviewer.floatVertically());

        this.initializeSection('${wiredcontracts.element.itemtype.selection}', this._picker, param);

        this._picker.addListener(this.onChangeItemType);
    }

    // AS3: ItemTypeSelectionSection.as::onChangeItemType()
    private onChangeItemType = (item: ChestItemType | null): void =>
    {
        if(this._iconPreviewer) this._iconPreviewer.item = item;
    };

    // AS3: ItemTypeSelectionSection.as::get selectedItem()
    get selectedItem(): ChestItemType | null
    {
        return this._picker?.selectedItem ?? null;
    }

    // AS3: ItemTypeSelectionSection.as::set selectedItem()
    set selectedItem(value: ChestItemType | null)
    {
        if(this._picker) this._picker.selectedItem = value;
    }

    // AS3: ItemTypeSelectionSection.as::get furniDataForSelectedItem()
    get furniDataForSelectedItem(): IFurnitureData | null
    {
        return this._picker?.furniDataForSelectedItem ?? null;
    }

    // AS3: ItemTypeSelectionSection.as::resetInteractions()
    resetInteractions(): void
    {
        this._picker?.resetInteractions();
    }

    /**
	 * AS3 calls `super.dispose()` *first* and nulls its own fields after — the base disposes the
	 * picker and the previewer through the section, so clearing them first would strand both.
	 */
    // AS3: ItemTypeSelectionSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();

        this._picker = null;
        this._iconPreviewer = null;
    }
}
