import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {VariableDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/VariableDefinition';

import type {IWiredElement} from '../IWiredElement';
import type {IWiredTypeHolder} from '../IWiredTypeHolder';
import {ContextVariable} from './ContextVariable';
import {DailyTaskVariable} from './DailyTaskVariable';
import {EchoVariable} from './EchoVariable';
import {ReferenceVariable} from './ReferenceVariable';
import {FurniVariable} from './FurniVariable';
import {GlobalVariable} from './GlobalVariable';
import {QuestChainVariable} from './QuestChainVariable';
import {QuestVariable} from './QuestVariable';
import {UserVariable} from './UserVariable';

/**
 * VariableTypes — the wired variable registry (IWiredTypeHolder): instantiates every variable type and
 * resolves one by its server code.
 *
 * PORT GAP: AS3 registers the full set; this port omits the not-yet-ported types — TODO(AS3) the
 * ChooseVariable-blocked generic variable (_4356) (and the ECHO_VARIABLE which has no dedicated type
 * here). getElementByCode returns null for their codes. (ReferenceVariable is now ported.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/VariableTypes.as
 */
export class VariableTypes implements IWiredTypeHolder
{
    // AS3: VariableTypes.as::_types
    private _types: IWiredElement[] = [
        new FurniVariable(),
        new UserVariable(),
        new GlobalVariable(),
        new ContextVariable(),
        new QuestVariable(),
        new QuestChainVariable(),
        new DailyTaskVariable(),
        new ReferenceVariable(),
        new EchoVariable()
    ];

    // AS3: VariableTypes.as::getByCode()
    getByCode(code: number): IWiredElement | null
    {
        for(const type of this._types)
        {
            // AS3 getByCode matches either the positive code or the negativeCode.
            if(type.code === code || type.negativeCode === code)
            {
                return type;
            }
        }

        return null;
    }

    // AS3: VariableTypes.as::getElementByCode()
    getElementByCode(code: number): IWiredElement
    {
        return this.getByCode(code) as IWiredElement;
    }

    // AS3: VariableTypes.as::getKey()
    getKey(): string
    {
        return 'variable';
    }

    // AS3: VariableTypes.as::acceptTriggerable()
    acceptTriggerable(triggerable: Triggerable): boolean
    {
        return triggerable instanceof VariableDefinition;
    }
}
