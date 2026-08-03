import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * RoomWidgetClothingChangeMessage
 *
 * Asks for the clothing editor, carrying the gender the player just picked and the furni it
 * was picked at.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetClothingChangeMessage.as
 */
export class RoomWidgetClothingChangeMessage extends RoomWidgetMessage
{
    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::REQUEST_EDITOR
    public static readonly REQUEST_EDITOR: string = 'RWCCM_REQUEST_EDITOR';

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::RoomWidgetClothingChangeMessage()
    constructor(type: string, gender: string, objectId: number, objectCategory: number, roomId: number)
    {
        super(type);

        this._gender = gender;
        this._objectId = objectId;
        this._objectCategory = objectCategory;
        this._roomId = roomId;
    }

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::_SafeStr_4645
    private _gender: string = '';

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::get gender()
    public get gender(): string
    {
        return this._gender;
    }

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::_SafeStr_4841
    private _objectId: number = 0;

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::_SafeStr_8829
    private _objectCategory: number = 0;

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::get objectCategory()
    public get objectCategory(): number
    {
        return this._objectCategory;
    }

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::_SafeStr_6722
    private _roomId: number = 0;

    // AS3: .../messages/RoomWidgetClothingChangeMessage.as::get roomId()
    public get roomId(): number
    {
        return this._roomId;
    }
}
