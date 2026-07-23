import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {ActionDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/ActionDefinition';

import type {IWiredElement} from '../IWiredElement';
import type {IWiredTypeHolder} from '../IWiredTypeHolder';
import {ActionCode3} from './ActionCode3';
import {ActionCode8} from './ActionCode8';
import {AdjustClock} from './AdjustClock';
import {BotChangeFigure} from './BotChangeFigure';
import {BotFollowAvatar} from './BotFollowAvatar';
import {BotGiveHandItem} from './BotGiveHandItem';
import {BotMove} from './BotMove';
import {BotTalk} from './BotTalk';
import {BotTalkDirectToAvatar} from './BotTalkDirectToAvatar';
import {BotTeleport} from './BotTeleport';
import {CallAnotherStack} from './CallAnotherStack';
import {ChangeVariable} from './ChangeVariable';
import {Chase} from './Chase';
import {Chat} from './Chat';
import {ClickSettings} from './ClickSettings';
import {ControlClock} from './ControlClock';
import {Flee} from './Flee';
import {FreezeUser} from './FreezeUser';
import {GiveEffect} from './GiveEffect';
import {GiveReward} from './GiveReward';
import {GiveVariable} from './GiveVariable';
import {GiveScore} from './GiveScore';
import {GiveScoreToPredefinedTeam} from './GiveScoreToPredefinedTeam';
import {JoinTeam} from './JoinTeam';
import {KickFromRoom} from './KickFromRoom';
import {LeaveTeam} from './LeaveTeam';
import {MoveAsGroup} from './MoveAsGroup';
import {MoveFurni} from './MoveFurni';
import {MoveFurniTo} from './MoveFurniTo';
import {MoveFurniToFurni} from './MoveFurniToFurni';
import {MoveFurniToUser} from './MoveFurniToUser';
import {MoveToDirection} from './MoveToDirection';
import {MoveUser} from './MoveUser';
import {MoveUserToFurni} from './MoveUserToFurni';
import {MuteUser} from './MuteUser';
import {OverrideHeight} from './OverrideHeight';
import {ProgressAchievement} from './ProgressAchievement';
import {ProgressRewardTrack} from './ProgressRewardTrack';
import {RelativeFurniMove} from './RelativeFurniMove';
import {RemoveFurni} from './RemoveFurni';
import {RemoveVariable} from './RemoveVariable';
import {Reset} from './Reset';
import {ResetRewardTrack} from './ResetRewardTrack';
import {SendSignal} from './SendSignal';
import {SetFurniAltitude} from './SetFurniAltitude';
import {TeleportToRoom} from './TeleportToRoom';
import {ToggleFurniState} from './ToggleFurniState';
import {ToggleToRandomState} from './ToggleToRandomState';
import {UnfreezeUser} from './UnfreezeUser';
import {WriteToLog} from './WriteToLog';

/**
 * ActionTypes — the wired action registry (IWiredTypeHolder): instantiates every action type and
 * resolves one by its server code.
 *
 * PORT GAP: AS3 registers the full set; this port omits the not-yet-ported (Dropdown/varpicker/
 * combinations-blocked) action types. getElementByCode returns null for their codes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/ActionTypes.as
 */
export class ActionTypes implements IWiredTypeHolder
{
    // AS3: ActionTypes.as::_types
    private _types: IWiredElement[] = [
        new ToggleFurniState(),
        new Reset(),
        new ActionCode3(),
        new MoveFurni(),
        new GiveScore(),
        new ActionCode8(),
        new JoinTeam(),
        new LeaveTeam(),
        new Chase(),
        new Flee(),
        new MoveToDirection(),
        new GiveScoreToPredefinedTeam(),
        new ToggleToRandomState(),
        new MoveFurniTo(),
        new GiveReward(),
        new CallAnotherStack(),
        new KickFromRoom(),
        new MuteUser(),
        new BotTeleport(),
        new BotMove(),
        new BotTalk(),
        new BotFollowAvatar(),
        new BotChangeFigure(),
        new BotTalkDirectToAvatar(),
        new BotGiveHandItem(),
        new ControlClock(),
        new SetFurniAltitude(),
        new SendSignal(),
        new MoveAsGroup(),
        new RelativeFurniMove(),
        new MoveFurniToFurni(),
        new MoveFurniToUser(),
        new AdjustClock(),
        new MoveUser(),
        new MoveUserToFurni(),
        new TeleportToRoom(),
        new ResetRewardTrack(),
        new GiveEffect(),
        new OverrideHeight(),
        new RemoveFurni(),
        new UnfreezeUser(),
        new Chat(),
        new FreezeUser(),
        new ClickSettings(),
        new WriteToLog(),
        new RemoveVariable(),
        new GiveVariable(),
        new ChangeVariable(),
        new ProgressAchievement(),
        new ProgressRewardTrack()
    ];

    // AS3: ActionTypes.as::getByCode()
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

    // AS3: ActionTypes.as::getElementByCode()
    getElementByCode(code: number): IWiredElement
    {
        return this.getByCode(code) as IWiredElement;
    }

    // AS3: ActionTypes.as::getKey()
    getKey(): string
    {
        return 'action';
    }

    // AS3: ActionTypes.as::acceptTriggerable()
    acceptTriggerable(triggerable: Triggerable): boolean
    {
        return triggerable instanceof ActionDefinition;
    }
}
