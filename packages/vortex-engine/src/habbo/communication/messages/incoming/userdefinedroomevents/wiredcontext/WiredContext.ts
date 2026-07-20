import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {AllVariablesInRoom} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/AllVariablesInRoom';
import {VariableInfoAndHolders} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/VariableInfoAndHolders';
import {VariableInfoAndValue} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/VariableInfoAndValue';
import {VariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/VariableList';
import {SharedVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedVariableList';
import {SharedGlobalPlaceholderList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedGlobalPlaceholderList';
import {WiredContextDataType} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/WiredContextDataType';

/**
 * WiredContext — the bundle of variable/placeholder data a Triggerable definition carries for the
 * wired configuration UI. The message enumerates a count of sections; each section is prefixed by a
 * WiredContextDataType tag telling which sub-DTO to parse and which context field to populate.
 * Constructed inline from the message stream during a Triggerable parse; a null wrapper yields the
 * empty default instance.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/WiredContext.as
 */
export class WiredContext
{
    // AS3: WiredContext.as::EMPTY (name derived: static default built from `new WiredContext(null)`;
    // the same obfuscated member _-H27 maps to "empty" in the inventory enum and to a static default
    // instance in AbstractVariableList).
    static readonly EMPTY: WiredContext = new WiredContext(null);

    // AS3: WiredContext.as::roomVariablesList (backing field)
    private _roomVariablesList: AllVariablesInRoom | null = null;

    // AS3: WiredContext.as::furniVariableInfo (backing field)
    private _furniVariableInfo: VariableInfoAndHolders | null = null;

    // AS3: WiredContext.as::userVariableInfo (backing field)
    private _userVariableInfo: VariableInfoAndHolders | null = null;

    // AS3: WiredContext.as::globalVariableInfo (backing field)
    private _globalVariableInfo: VariableInfoAndValue | null = null;

    // AS3: WiredContext.as::rulesetVariables (backing field)
    private _rulesetVariables: VariableList | null = null;

    // AS3: WiredContext.as::referenceVariablesList (backing field)
    private _referenceVariablesList: SharedVariableList | null = null;

    // AS3: WiredContext.as::referencePlaceholderList (backing field)
    private _referencePlaceholderList: SharedGlobalPlaceholderList | null = null;

    // AS3: WiredContext.as::WiredContext()
    constructor(wrapper: IMessageDataWrapper | null)
    {
        if(wrapper === null)
        {
            return;
        }
        const count: number = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            const type: number = wrapper.readInt();
            switch(type)
            {
                case WiredContextDataType.ALL_VARIABLES_IN_ROOM:
                    this._roomVariablesList = new AllVariablesInRoom(wrapper);
                    break;
                case WiredContextDataType.FURNI_VARIABLE_INFO:
                    this._furniVariableInfo = new VariableInfoAndHolders(wrapper);
                    break;
                case WiredContextDataType.USER_VARIABLE_INFO:
                    this._userVariableInfo = new VariableInfoAndHolders(wrapper);
                    break;
                case WiredContextDataType.GLOBAL_VARIABLE_INFO:
                    this._globalVariableInfo = new VariableInfoAndValue(wrapper);
                    break;
                case WiredContextDataType.REFERENCE_VARIABLE_LIST:
                    this._referenceVariablesList = new SharedVariableList(wrapper);
                    break;
                case WiredContextDataType.RULESET_VARIABLES:
                    this._rulesetVariables = VariableList.createFromMessage(wrapper);
                    break;
                case WiredContextDataType.REFERENCE_PLACEHOLDER_LIST:
                    this._referencePlaceholderList = new SharedGlobalPlaceholderList(wrapper);
                    break;
            }
        }
    }

    // AS3: WiredContext.as::get roomVariablesList()
    get roomVariablesList(): AllVariablesInRoom | null
    {
        return this._roomVariablesList;
    }

    // AS3: WiredContext.as::get furniVariableInfo()
    get furniVariableInfo(): VariableInfoAndHolders | null
    {
        return this._furniVariableInfo;
    }

    // AS3: WiredContext.as::get userVariableInfo()
    get userVariableInfo(): VariableInfoAndHolders | null
    {
        return this._userVariableInfo;
    }

    // AS3: WiredContext.as::get globalVariableInfo()
    get globalVariableInfo(): VariableInfoAndValue | null
    {
        return this._globalVariableInfo;
    }

    // AS3: WiredContext.as::get referenceVariablesList()
    get referenceVariablesList(): SharedVariableList | null
    {
        return this._referenceVariablesList;
    }

    // AS3: WiredContext.as::get referencePlaceholderList()
    get referencePlaceholderList(): SharedGlobalPlaceholderList | null
    {
        return this._referencePlaceholderList;
    }

    // AS3: WiredContext.as::get rulesetVariables()
    get rulesetVariables(): VariableList | null
    {
        return this._rulesetVariables;
    }
}
