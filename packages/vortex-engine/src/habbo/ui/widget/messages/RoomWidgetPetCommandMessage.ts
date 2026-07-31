/**
 * RoomWidgetPetCommandMessage
 *
 * Sent by PetCommandTool / OwnPetMenuView to ask for a pet's trained commands, or to issue one.
 *
 * There is no "issue pet command" packet: AS3 issues a command as ordinary room chat, and `value`
 * carries the whole line — the pet's name, a space, then the command's localised name. The handler
 * simply forwards it to roomSession.sendChatMessage().
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetPetCommandMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetPetCommandMessage extends RoomWidgetMessage
{
    // AS3: .../RoomWidgetPetCommandMessage.as::REQUEST_COMMANDS
    public static readonly REQUEST_COMMANDS: string = 'RWPCM_REQUEST_PET_COMMANDS';

    // AS3: .../RoomWidgetPetCommandMessage.as::PET_COMMAND
    public static readonly PET_COMMAND: string = 'RWPCM_PET_COMMAND';

    // AS3: .../RoomWidgetPetCommandMessage.as::BREED_TRAIN_COMMAND_ID
    public static readonly BREED_TRAIN_COMMAND_ID: number = 46;

    private _petId: number;

    private _value: string | null;

    // AS3: .../RoomWidgetPetCommandMessage.as::RoomWidgetPetCommandMessage()
    constructor(type: string, petId: number, value: string | null = null)
    {
        super(type);

        this._petId = petId;
        this._value = value;
    }

    // AS3: .../RoomWidgetPetCommandMessage.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: .../RoomWidgetPetCommandMessage.as::get value()
    get value(): string | null
    {
        return this._value;
    }
}
