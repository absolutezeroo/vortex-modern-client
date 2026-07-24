import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';

import {WiredMenuOverviewTab} from './WiredMenuOverviewTab';

/**
 * PropertyTableObject — one row in the overview tab's variable-properties table: a localized property
 * label and its value. The value is coerced from a string / boolean / int at construction (booleans
 * become the localized yes/no string).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_variable_overview/PropertyTableObject.as
 */
export class PropertyTableObject implements ITableObject
{
    // AS3: PropertyTableObject.as::_SafeStr_7608 (name derived: property key)
    private _key: string;

    // AS3: PropertyTableObject.as::_SafeStr_4717 (name derived: formatted value string)
    private _value: string;

    // AS3: PropertyTableObject.as::_localization
    private _localization: IHabboLocalizationManager;

    // AS3: PropertyTableObject.as::_SafeStr_9062 (name derived: highlight/inspectable flag)
    private _highlight: boolean;

    // AS3: PropertyTableObject.as::PropertyTableObject()
    constructor(key: string, value: string | boolean | number, localization: IHabboLocalizationManager, highlight: boolean = false)
    {
        this._key = key;
        this._localization = localization;
        this._highlight = highlight;

        // AS3 branches on `param2 as String` / `as Boolean` / `is int`, in that order.
        if(typeof value === 'string')
        {
            this._value = value;
        }
        else if(typeof value === 'boolean')
        {
            this._value = localization.getLocalization('wiredmenu.bool.' + (value ? 'yes' : 'no'));
        }
        else if(typeof value === 'number')
        {
            this._value = String(value);
        }
        else
        {
            this._value = '';
        }
    }

    // AS3: PropertyTableObject.as::get identifier()
    get identifier(): string
    {
        return this._key;
    }

    // AS3: PropertyTableObject.as::isPropertyUpdated()
    isPropertyUpdated(columnId: string, other: object): boolean
    {
        const property = other as PropertyTableObject;

        if(columnId === WiredMenuOverviewTab.PROPERTIES_COLUMN_VALUE)
        {
            return this._value !== property.value;
        }

        return false;
    }

    // AS3: PropertyTableObject.as::isUpdated()
    isUpdated(other: object): boolean
    {
        return this._value !== (other as PropertyTableObject).value;
    }

    // AS3: PropertyTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell
    {
        if(columnId === WiredMenuOverviewTab.PROPERTIES_COLUMN_PROPERTY)
        {
            return new TableCell(TableCell.TYPE_TEXT, this._localization.getLocalization('wiredmenu.variable_overview.properties.' + this._key));
        }

        if(columnId === WiredMenuOverviewTab.PROPERTIES_COLUMN_VALUE)
        {
            return new TableCell(TableCell.TYPE_TEXT, this._value, false, this._highlight);
        }

        return null as unknown as TableCell;
    }

    // AS3: PropertyTableObject.as::get value()
    get value(): string
    {
        return this._value;
    }
}
