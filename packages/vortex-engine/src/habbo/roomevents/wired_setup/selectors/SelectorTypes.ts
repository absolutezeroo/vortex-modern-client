import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {SelectorDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/SelectorDefinition';

import type {IWiredElement} from '../IWiredElement';
import type {IWiredTypeHolder} from '../IWiredTypeHolder';
import {FurniByType} from './FurniByType';
import {FurniFromSignal} from './FurniFromSignal';
import {FurniWithVariable} from './FurniWithVariable';
import {FurniOnFurni} from './FurniOnFurni';
import {FurniWithAltitude} from './FurniWithAltitude';
import {RemoteSelector} from './RemoteSelector';
import {SelectorCode1} from './SelectorCode1';
import {UsersByName} from './UsersByName';
import {UsersByType} from './UsersByType';
import {UsersFromSignal} from './UsersFromSignal';
import {UsersInTeam} from './UsersInTeam';
import {UsersOnFurni} from './UsersOnFurni';
import {UsersInGroup} from './UsersInGroup';
import {UsersPerformingAction} from './UsersPerformingAction';
import {UsersWithHanditem} from './UsersWithHanditem';
import {UsersWithVariable} from './UsersWithVariable';
import {UsersInArea} from './UsersInArea';
import {FurniInArea} from './FurniInArea';

/**
 * SelectorTypes — the wired selector registry (IWiredTypeHolder): instantiates every selector type and
 * resolves one by its server code.
 *
 * PORT GAP: AS3 registers the full set; this port omits the not-yet-ported InNeighborhood family
 * (_4420/_4450, need the applications Floor presets). getElementByCode returns null for their codes.
 * (The area selectors UsersInArea/FurniInArea are now ported — area selection itself is inert until the
 * room-engine RoomAreaSelectionManager lands, see its TODO(AS3); the VariableSelector family
 * UsersWithVariable/FurniWithVariable, UsersPerformingAction, UsersWithHanditem, UsersInGroup are ported.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/SelectorTypes.as
 */
export class SelectorTypes implements IWiredTypeHolder
{
    // AS3: SelectorTypes.as::_types
    private _types: IWiredElement[] = [
        new FurniByType(),
        new SelectorCode1(),
        new UsersByType(),
        new UsersInTeam(),
        new FurniOnFurni(),
        new FurniFromSignal(),
        new UsersOnFurni(),
        new UsersFromSignal(),
        new UsersByName(),
        new FurniWithAltitude(),
        new RemoteSelector(),
        new UsersPerformingAction(),
        new UsersWithHanditem(),
        new UsersInGroup(),
        new UsersWithVariable(),
        new FurniWithVariable(),
        new UsersInArea(),
        new FurniInArea()
    ];

    // AS3: SelectorTypes.as::getByCode()
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

    // AS3: SelectorTypes.as::getElementByCode()
    getElementByCode(code: number): IWiredElement
    {
        return this.getByCode(code) as IWiredElement;
    }

    // AS3: SelectorTypes.as::getKey()
    getKey(): string
    {
        return 'selector';
    }

    // AS3: SelectorTypes.as::acceptTriggerable()
    acceptTriggerable(triggerable: Triggerable): boolean
    {
        return triggerable instanceof SelectorDefinition;
    }
}
