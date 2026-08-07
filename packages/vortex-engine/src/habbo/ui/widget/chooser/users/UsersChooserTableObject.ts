import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {ChooserItem} from '../ChooserItem';
import {UsersView} from './UsersView';

/**
 * One `ChooserItem` seen through the table view: two cells, and an identity that survives a
 * refresh so the table can tell an unchanged row from a new one.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/users/UsersChooserTableObject.as
 */
export class UsersChooserTableObject implements ITableObject
{
    // AS3: .../chooser/users/UsersChooserTableObject.as::_chooserItem
    private _chooserItem: ChooserItem;

    // AS3: .../chooser/users/UsersChooserTableObject.as::UsersChooserTableObject()
    constructor(chooserItem: ChooserItem)
    {
        this._chooserItem = chooserItem;
    }

    // AS3: .../chooser/users/UsersChooserTableObject.as::get chooserItem()
    get chooserItem(): ChooserItem
    {
        return this._chooserItem;
    }

    // AS3: .../chooser/users/UsersChooserTableObject.as::get identifier()
    // Type *and* id: a pet and a user can share a room index.
    get identifier(): string
    {
        return `${this._chooserItem.type}-${this._chooserItem.id}`;
    }

    /**
     * The name cell is the only one AS3 marks as both non-bold and selectable.
     *
     * AS3 returns **null** for any other column; this port's `ITableObject` declares the return
     * non-null and `TableRowView` hands the cell straight on without checking, so the default
     * returns an empty cell instead. The branch is unreachable either way — the table only ever
     * asks for the two columns it was initialised with.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/users/UsersChooserTableObject.as::getTableCell()
    getTableCell(column: string): TableCell
    {
        switch(column)
        {
            case UsersView.COLUMN_USER_NAME:
                return new TableCell(TableCell.TYPE_TEXT, this._chooserItem.name, false, true);

            case UsersView.COLUMN_TYPE:
                return new TableCell(TableCell.TYPE_TEXT, `\${new_user_chooser.usertype.${this._chooserItem.type}}`);

            default:
                return new TableCell(TableCell.TYPE_TEXT, '');
        }
    }

    // AS3: .../chooser/users/UsersChooserTableObject.as::isPropertyUpdated()
    // Always false in AS3 too — the list is rebuilt wholesale rather than diffed.
    isPropertyUpdated(_property: string, _value: unknown): boolean
    {
        return false;
    }

    // AS3: .../chooser/users/UsersChooserTableObject.as::isUpdated()
    isUpdated(_value: unknown): boolean
    {
        return false;
    }
}
