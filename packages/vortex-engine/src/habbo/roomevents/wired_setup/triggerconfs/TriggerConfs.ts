import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {TriggerDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/TriggerDefinition';

import type {IWiredElement} from '../IWiredElement';
import type {IWiredTypeHolder} from '../IWiredTypeHolder';
import {AvatarCaught} from './AvatarCaught';
import {AvatarCaught2} from './AvatarCaught2';
import {AvatarClicksFurni} from './AvatarClicksFurni';
import {AvatarEntersRoom} from './AvatarEntersRoom';
import {AvatarLeavesRoom} from './AvatarLeavesRoom';
import {AvatarSaysSomething} from './AvatarSaysSomething';
import {AvatarWalksOffFurni} from './AvatarWalksOffFurni';
import {AvatarWalksOnFurni} from './AvatarWalksOnFurni';
import {BotAvatarReached} from './BotAvatarReached';
import {BotDestinationReached} from './BotDestinationReached';
import {ClockReachTime} from './ClockReachTime';
import {GameEnds} from './GameEnds';
import {GameStarts} from './GameStarts';
import {PeriodicShort} from './PeriodicShort';
import {ReceiveSignal} from './ReceiveSignal';
import {ScoreAchieved} from './ScoreAchieved';
import {StateChange} from './StateChange';
import {TransactionCompleted} from './TransactionCompleted';
import {TransactionFailed} from './TransactionFailed';
import {TriggerCode21} from './TriggerCode21';
import {TriggerOnce} from './TriggerOnce';
import {TriggerPeriodically} from './TriggerPeriodically';
import {TriggerPeriodicallyLong} from './TriggerPeriodicallyLong';
import {UseStuff} from './UseStuff';
import {UserClicksUser} from './UserClicksUser';

/**
 * TriggerConfs — the wired trigger registry (IWiredTypeHolder): instantiates every trigger config and
 * resolves one by its server code.
 *
 * PORT GAP: AS3 registers the full set; this port omits the not-yet-ported types — TODO(AS3)
 * _SafeCls_4035 (Dropdown TRIGGER_CODE_16) and VariableUpdate (varpicker). getElementByCode returns
 * null for their codes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/TriggerConfs.as
 */
export class TriggerConfs implements IWiredTypeHolder
{
    // AS3: TriggerConfs.as::_confs
    private _types: IWiredElement[] = [
        new AvatarSaysSomething(),
        new AvatarWalksOnFurni(),
        new AvatarWalksOffFurni(),
        new TriggerOnce(),
        new UseStuff(),
        new TriggerPeriodically(),
        new AvatarEntersRoom(),
        new GameStarts(),
        new GameEnds(),
        new ScoreAchieved(),
        new AvatarCaught(),
        new AvatarCaught2(),
        new TriggerPeriodicallyLong(),
        new BotDestinationReached(),
        new BotAvatarReached(),
        new ClockReachTime(),
        new ReceiveSignal(),
        new AvatarClicksFurni(),
        new PeriodicShort(),
        new StateChange(),
        new TriggerCode21(),
        new AvatarLeavesRoom(),
        new UserClicksUser(),
        new TransactionCompleted(),
        new TransactionFailed()
    ];

    // AS3: TriggerConfs.as::getByCode()
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

    // AS3: TriggerConfs.as::getElementByCode()
    getElementByCode(code: number): IWiredElement
    {
        return this.getByCode(code) as IWiredElement;
    }

    // AS3: TriggerConfs.as::getKey()
    getKey(): string
    {
        return 'trigger';
    }

    // AS3: TriggerConfs.as::acceptTriggerable()
    acceptTriggerable(triggerable: Triggerable): boolean
    {
        return triggerable instanceof TriggerDefinition;
    }
}
