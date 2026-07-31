/**
 * RoomWidgetOpenPetPackageMessage
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetOpenPetPackageMessage.as
 *
 * Sent by PetPackageFurniWidget with the name the user typed; the handler forwards it to the room
 * session, and the server answers with a validation result.
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetOpenPetPackageMessage extends RoomWidgetMessage
{
    // AS3: RoomWidgetOpenPetPackageMessage.as::WIDGET_MESSAGE_OPEN_PET_PACKAGE
    public static readonly WIDGET_MESSAGE_OPEN_PET_PACKAGE: string = 'RWOPPM_OPEN_PET_PACKAGE';

    // AS3: RoomWidgetOpenPetPackageMessage.as::_SafeStr_4841
    private _objectId: number;

    // AS3: RoomWidgetOpenPetPackageMessage.as::_name
    private _name: string;

    // AS3: RoomWidgetOpenPetPackageMessage.as::RoomWidgetOpenPetPackageMessage()
    constructor(type: string, objectId: number, name: string)
    {
        super(type);

        this._objectId = objectId;
        this._name = name;
    }

    // AS3: RoomWidgetOpenPetPackageMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: RoomWidgetOpenPetPackageMessage.as::get name()
    public get name(): string
    {
        return this._name;
    }
}
