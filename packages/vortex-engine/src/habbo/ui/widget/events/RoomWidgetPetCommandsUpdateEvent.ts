/**
 * RoomWidgetPetCommandsUpdateEvent
 *
 * The pet's trained-command list, on its way from RoomUsersHandler's RSPIUE_ENABLED_PET_COMMANDS to
 * InfoStandWidget's PetCommandTool.
 *
 * AS3's trailing `bubbles`/`cancelable` constructor params are dropped along with the rest of the
 * Flash Event base — see RoomWidgetUpdateEvent.ts.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPetCommandsUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetPetCommandsUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetPetCommandsUpdateEvent.as::PET_COMMANDS
    public static readonly PET_COMMANDS: string = 'RWPCUE_PET_COMMANDS';

    // AS3: .../RoomWidgetPetCommandsUpdateEvent.as::OPEN_PET_TRAINING
    public static readonly OPEN_PET_TRAINING: string = 'RWPCUE_OPEN_PET_TRAINING';

    // AS3: .../RoomWidgetPetCommandsUpdateEvent.as::CLOSE_PET_TRAINING
    public static readonly CLOSE_PET_TRAINING: string = 'RWPCUE_CLOSE_PET_TRAINING';

    private _id: number;

    private _allCommands: number[];

    private _enabledCommands: number[];

    // AS3: .../RoomWidgetPetCommandsUpdateEvent.as::RoomWidgetPetCommandsUpdateEvent()
    // AS3 hard-codes PET_COMMANDS as the dispatched type even though the class also declares the two
    // training types; those are used by callers that construct the event and then dispatch by name.
    constructor(id: number, allCommands: number[], enabledCommands: number[])
    {
        super(RoomWidgetPetCommandsUpdateEvent.PET_COMMANDS);

        this._id = id;
        this._allCommands = allCommands;
        this._enabledCommands = enabledCommands;
    }

    // AS3: .../RoomWidgetPetCommandsUpdateEvent.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../RoomWidgetPetCommandsUpdateEvent.as::get allCommands()
    get allCommands(): number[]
    {
        return this._allCommands;
    }

    // AS3: .../RoomWidgetPetCommandsUpdateEvent.as::get enabledCommands()
    get enabledCommands(): number[]
    {
        return this._enabledCommands;
    }
}
