import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';

/**
 * One furniture type in the item-type picker's table: its localized name, its code, and whether it
 * goes on a wall or a floor.
 *
 * The lowercased name is cached at construction rather than recomputed per keystroke — the search
 * box filters the whole catalogue on every change, and that is thousands of rows.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/contracts/itemtable/ItemTypeTableObject.as
 */
export class ItemTypeTableObject implements ITableObject
{
    // AS3: ItemTypeTableObject.as::_chestItemType
    private _chestItemType: ChestItemType;

    // AS3: ItemTypeTableObject.as::_localizedName
    private _localizedName: string;

    // AS3: ItemTypeTableObject.as::_SafeStr_10206 (name derived: the lowercased name, for search)
    private _searchableName: string;

    // AS3: ItemTypeTableObject.as::_displayCode
    private _displayCode: string;

    // AS3: ItemTypeTableObject.as::ItemTypeTableObject()
    constructor(chestItemType: ChestItemType, localizedName: string, displayCode: string)
    {
        this._chestItemType = chestItemType;
        this._localizedName = localizedName;
        this._displayCode = displayCode;
        this._searchableName = localizedName.toLowerCase();
    }

    /**
	 * Prefixed by placement, because a wall item and a floor item can share a code — the table
	 * would otherwise treat them as the same row.
	 */
    // AS3: ItemTypeTableObject.as::get identifier()
    get identifier(): string
    {
        return (this._chestItemType.isWallItem ? '1-' : '0-') + this._displayCode;
    }

    // AS3: ItemTypeTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell | null
    {
        switch(columnId)
        {
            case 'furni_name':
                return new TableCell(TableCell.TYPE_TEXT, this._localizedName, false, true);
            case 'furni_code':
                return new TableCell(TableCell.TYPE_TEXT, this._displayCode, false, true);
            case 'furni_type':
                return new TableCell(
                    TableCell.TYPE_TEXT,
                    this._chestItemType.isWallItem
                        ? '${inventory.filter.placement.wall}'
                        : '${inventory.filter.placement.floor}'
                );
            default:
                return null;
        }
    }

    // AS3: ItemTypeTableObject.as::isPropertyUpdated()
    isPropertyUpdated(_property: string, _other: unknown): boolean
    {
        return false;
    }

    // AS3: ItemTypeTableObject.as::isUpdated()
    isUpdated(_other: unknown): boolean
    {
        return false;
    }

    // AS3: ItemTypeTableObject.as::get chestItemType()
    get chestItemType(): ChestItemType
    {
        return this._chestItemType;
    }

    // AS3: ItemTypeTableObject.as::get localizedName()
    get localizedName(): string
    {
        return this._localizedName;
    }

    // AS3: ItemTypeTableObject.as::get displayCode()
    get displayCode(): string
    {
        return this._displayCode;
    }

    /**
	 * The name is matched lowercased, the code as-is — codes are already lowercase in the data, and
	 * AS3 does not fold them.
	 */
    // AS3: ItemTypeTableObject.as::matchesSubstring()
    matchesSubstring(term: string): boolean
    {
        return this._searchableName.indexOf(term) !== -1 || this._displayCode.indexOf(term) !== -1;
    }
}
