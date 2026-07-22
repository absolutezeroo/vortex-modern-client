import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {ConditionDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/ConditionDefinition';

import type {IWiredElement} from '../IWiredElement';
import type {IWiredTypeHolder} from '../IWiredTypeHolder';
import {ActorIsInTeam} from './ActorIsInTeam';
import {ActorIsWearingBadge} from './ActorIsWearingBadge';
import {ActorIsWearingEffect} from './ActorIsWearingEffect';
import {CanPerformMove} from './CanPerformMove';
import {ClockTimeMatches} from './ClockTimeMatches';
import {DateRangeActive} from './DateRangeActive';
import {DontHaveStackedFurnis} from './DontHaveStackedFurnis';
import {FurniHasAltitude} from './FurniHasAltitude';
import {FurnisHaveAvatars} from './FurnisHaveAvatars';
import {FurnisHaveNoAvatars} from './FurnisHaveNoAvatars';
import {HasStackedFurnis} from './HasStackedFurnis';
import {InputSourceQuantity} from './InputSourceQuantity';
import {ActorHasHanditem} from './ActorHasHanditem';
import {LevelMatches} from './LevelMatches';
import {PerformingAction} from './PerformingAction';
import {StatesMatch} from './StatesMatch';
import {StuffTypeMatches} from './StuffTypeMatches';
import {TeamHasScore} from './TeamHasScore';
import {TeamIsWinning} from './TeamIsWinning';
import {TimeElapsedLess} from './TimeElapsedLess';
import {TimeElapsedMore} from './TimeElapsedMore';
import {TriggererIsOnFurni} from './TriggererIsOnFurni';
import {TriggererMatches} from './TriggererMatches';
import {UserCountIn} from './UserCountIn';
import {UserDirection} from './UserDirection';

/**
 * ConditionTypes — the wired condition registry (IWiredTypeHolder): instantiates every condition type
 * and resolves one by its server code.
 *
 * PORT GAP: AS3 registers the full set; this port omits the not-yet-ported types — TODO(AS3) the
 * Dropdown-blocked (_4103 ActorIsGroupMember), the timezone-base conditions (_4314 DateMatches/
 * TimeMatches base), varpicker-blocked (_4119, _4236, _4192 VariableAge), and _4271/ChestHasAmount.
 * getElementByCode returns null for their codes. (_4326 PerformingAction, _4118 ActorHasHanditem are
 * now ported.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/ConditionTypes.as
 */
export class ConditionTypes implements IWiredTypeHolder
{
    // AS3: ConditionTypes.as::_types
    private _types: IWiredElement[] = [
        new TriggererIsOnFurni(),
        new FurnisHaveAvatars(),
        new FurnisHaveNoAvatars(),
        new StatesMatch(),
        new TimeElapsedMore(),
        new TimeElapsedLess(),
        new UserCountIn(),
        new ActorIsInTeam(),
        new HasStackedFurnis(),
        new StuffTypeMatches(),
        new ActorIsWearingBadge(),
        new ActorIsWearingEffect(),
        new DontHaveStackedFurnis(),
        new TriggererMatches(),
        new TeamIsWinning(),
        new TeamHasScore(),
        new ClockTimeMatches(),
        new FurniHasAltitude(),
        new UserDirection(),
        new InputSourceQuantity(),
        new CanPerformMove(),
        new LevelMatches(),
        new DateRangeActive(),
        new PerformingAction(),
        new ActorHasHanditem()
    ];

    // AS3: ConditionTypes.as::getByCode()
    getByCode(code: number): IWiredElement | null
    {
        for(const type of this._types)
        {
            if(type.code === code)
            {
                return type;
            }
        }

        return null;
    }

    // AS3: ConditionTypes.as::getElementByCode()
    getElementByCode(code: number): IWiredElement
    {
        return this.getByCode(code) as IWiredElement;
    }

    // AS3: ConditionTypes.as::getKey()
    getKey(): string
    {
        return 'condition';
    }

    // AS3: ConditionTypes.as::acceptTriggerable()
    acceptTriggerable(triggerable: Triggerable): boolean
    {
        return triggerable instanceof ConditionDefinition;
    }
}
