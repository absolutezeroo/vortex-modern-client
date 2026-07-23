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
import {UsersInNeighborhood} from './UsersInNeighborhood';
import {FurniInNeighborhood} from './FurniInNeighborhood';

/**
 * SelectorTypes — the wired selector registry (IWiredTypeHolder): instantiates every selector type and
 * resolves one by its server code.
 *
 * All AS3 selector types are now ported and registered. Two visual editors remain inert pending
 * room-engine/rendering infra (their leaves still (de)serialize faithfully): area selection needs the
 * room-engine RoomAreaSelectionManager (UsersInArea/FurniInArea) and the neighborhood floor-drawing
 * canvas needs a bitmap pixel layer (UsersInNeighborhood/FurniInNeighborhood) — see their TODO(AS3)s.
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
        new FurniInArea(),
        new UsersInNeighborhood(),
        new FurniInNeighborhood()
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
