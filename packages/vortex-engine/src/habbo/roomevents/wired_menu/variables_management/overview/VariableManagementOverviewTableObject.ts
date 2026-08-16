import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import type {WiredUserVariablesElement} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredUserVariablesElement';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {RequestVariableManagementDetailComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestVariableManagementDetailComposer';

import {VariableValueTableObject} from '../../tabs/tab_inspection/VariableValueTableObject';
import type {VariableManagementOverviewController} from './VariableManagementOverviewController';

/**
 * VariableManagementOverviewTableObject — one row in the variable-management overview: the holder's
 * type/name (name links to the user's profile for real users), the value's creation/last-update
 * times, the stored value cell, and a "manage" link that opens the detail view for this holder.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/overview/VariableManagementOverviewTableObject.as
 */
export class VariableManagementOverviewTableObject implements ITableObject
{
    // AS3: VariableManagementOverviewTableObject.as::_SafeStr_4593 (name derived: the controller)
    private _controller: VariableManagementOverviewController;

    // AS3: VariableManagementOverviewTableObject.as::_SafeStr_4896 (name derived: the row element)
    private _element: WiredUserVariablesElement;

    // AS3: VariableManagementOverviewTableObject.as::_SafeStr_5878 (name derived: the managed variable)
    private _variable: WiredVariable;

    // AS3: VariableManagementOverviewTableObject.as::VariableManagementOverviewTableObject()
    constructor(controller: VariableManagementOverviewController, element: WiredUserVariablesElement, variable: WiredVariable)
    {
        this._controller = controller;
        this._element = element;
        this._variable = variable;
    }

    // AS3: VariableManagementOverviewTableObject.as::get identifier()
    get identifier(): string
    {
        return this._element.entityType + '-' + this._element.entityId;
    }

    // AS3: VariableManagementOverviewTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell | null
    {
        switch(columnId)
        {
            case 'usertype':
                return new TableCell(TableCell.TYPE_TEXT, this.localize('wiredfurni.params.usertype.' + this._element.entityType));
            case 'name':
                if(this._element.entityType === 1)
                {
                    return new TableCell(TableCell.TYPE_LINK, this._element.entityName, false, true, null, this._onClickUsername);
                }

                return new TableCell(TableCell.TYPE_TEXT, this._element.entityName, false, true);
            case 'creation_time':
                return new TableCell(TableCell.TYPE_TEXT, this._element.storage.creationTimeStr, false, true);
            case 'last_update_time':
                return new TableCell(TableCell.TYPE_TEXT, this._element.storage.lastUpdateTimeStr, false, true);
            case 'value':
                return VariableValueTableObject.createVariableValueCell(this._variable, this._element.storage.value, this._controller.roomEvents, false, false);
            case 'manage':
                return new TableCell(TableCell.TYPE_LINK, this.localize('wiredmenu.variable_management.manage'), false, false, null, this._onClickManage);
            default:
                return null;
        }
    }

    // AS3: VariableManagementOverviewTableObject.as::onClickUsername()
    private _onClickUsername = (): void =>
    {
        this._controller.send(new GetExtendedProfileMessageComposer(this._element.entityId, true));
    };

    // AS3: VariableManagementOverviewTableObject.as::onClickManage()
    private _onClickManage = (): void =>
    {
        this._controller.send(new RequestVariableManagementDetailComposer(this._element.entityType, this._element.entityId));
    };

    // AS3: VariableManagementOverviewTableObject.as::localize()
    private localize(key: string): string
    {
        return this._controller.localizationManager.getLocalization(key);
    }

    // AS3: VariableManagementOverviewTableObject.as::get element()
    get element(): WiredUserVariablesElement
    {
        return this._element;
    }

    // AS3: VariableManagementOverviewTableObject.as::get variable()
    get variable(): WiredVariable
    {
        return this._variable;
    }

    // AS3: VariableManagementOverviewTableObject.as::isPropertyUpdated()
    isPropertyUpdated(columnId: string, other: object): boolean
    {
        const otherObject = other as VariableManagementOverviewTableObject;

        if(columnId === 'creation_time')
        {
            return this._element.storage.creationTime !== otherObject.element.storage.creationTime;
        }

        if(columnId === 'last_update_time')
        {
            return this._element.storage.lastUpdateTime !== otherObject.element.storage.lastUpdateTime;
        }

        if(columnId === 'value')
        {
            return this._element.storage.value !== otherObject.element.storage.value || this._variable.hasValue !== otherObject.variable.hasValue;
        }

        return false;
    }

    // AS3: VariableManagementOverviewTableObject.as::isUpdated()
    isUpdated(other: object): boolean
    {
        return this.isPropertyUpdated('creation_time', other) || this.isPropertyUpdated('last_update_time', other) || this.isPropertyUpdated('value', other);
    }
}
