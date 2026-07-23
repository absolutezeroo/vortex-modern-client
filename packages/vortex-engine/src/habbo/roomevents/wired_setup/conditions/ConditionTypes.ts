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
import {HasVariable} from './HasVariable';
import {InputSourceQuantity} from './InputSourceQuantity';
import {ActorHasHanditem} from './ActorHasHanditem';
import {ActorIsGroupMember} from './ActorIsGroupMember';
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
import {VariableAge} from './VariableAge';
import {VariableValue} from './VariableValue';
import {UserDirection} from './UserDirection';
import {ChestHasAmount} from './chests/ChestHasAmount';
import {ChestHasItemTypes} from './chests/ChestHasItemTypes';
import {DateMatches} from './DateMatches';
import {TimeMatches} from './TimeMatches';

/**
 * ConditionTypes — the wired condition registry (IWiredTypeHolder): instantiates every condition type
 * and resolves one by its server code.
 *
 * PORT GAP: AS3 registers the full set; this port omits the not-yet-ported ChooseVariable-blocked
 * conditions (_4119, _4236). getElementByCode returns null for their codes. (_4326 PerformingAction,
 * _4118 ActorHasHanditem, _4103 ActorIsGroupMember, _4192 VariableAge, the chest conditions
 * ChestHasAmount/ChestHasItemTypes, and the timezone-base TimeMatches/DateMatches are now ported.)
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
        new ActorHasHanditem(),
        new ActorIsGroupMember(),
        new VariableAge(),
        new HasVariable(),
        new VariableValue(),
        new ChestHasAmount(),
        new ChestHasItemTypes(),
        new TimeMatches(),
        new DateMatches()
    ];

    // AS3: ConditionTypes.as::getByCode()
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
