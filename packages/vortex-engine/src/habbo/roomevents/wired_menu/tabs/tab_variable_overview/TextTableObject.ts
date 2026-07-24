import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';

import {WiredMenuOverviewTab} from './WiredMenuOverviewTab';

/**
 * TextTableObject — one row in the overview tab's "text connector" table: an integer value and the
 * text a variable maps it to. Both cells are inspectable (read-only selectable).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_variable_overview/TextTableObject.as
 */
export class TextTableObject implements ITableObject
{
    // AS3: TextTableObject.as::_SafeStr_4717 (name derived: the integer value)
    private _value: number;

    // AS3: TextTableObject.as::_text
    private _text: string;

    // AS3: TextTableObject.as::TextTableObject()
    constructor(value: number, text: string)
    {
        this._value = value;
        this._text = text;
    }

    // AS3: TextTableObject.as::get identifier()
    get identifier(): string
    {
        return String(this._value);
    }

    // AS3: TextTableObject.as::isPropertyUpdated()
    isPropertyUpdated(columnId: string, other: object): boolean
    {
        const textObject = other as TextTableObject;

        if(columnId === WiredMenuOverviewTab.TEXT_COLUMN_TEXT)
        {
            return this._text !== textObject.text;
        }

        return false;
    }

    // AS3: TextTableObject.as::isUpdated()
    isUpdated(other: object): boolean
    {
        return this._text !== (other as TextTableObject).text;
    }

    // AS3: TextTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell
    {
        if(columnId === WiredMenuOverviewTab.TEXT_COLUMN_VALUE)
        {
            return new TableCell(TableCell.TYPE_TEXT, String(this._value), false, true);
        }

        if(columnId === WiredMenuOverviewTab.TEXT_COLUMN_TEXT)
        {
            return new TableCell(TableCell.TYPE_TEXT, this._text, false, true);
        }

        return null as unknown as TableCell;
    }

    // AS3: TextTableObject.as::get text()
    get text(): string
    {
        return this._text;
    }
}
