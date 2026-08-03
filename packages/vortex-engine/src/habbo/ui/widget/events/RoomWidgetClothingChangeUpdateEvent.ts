import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * RoomWidgetClothingChangeUpdateEvent
 *
 * Tells the clothing-change widget to open: either the boy/girl chooser
 * (`RWCCUE_SHOW_GENDER_SELECTION`) or, once a gender is known, the editor itself.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetClothingChangeUpdateEvent.as
 */
export class RoomWidgetClothingChangeUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::SHOW_GENDER_SELECTION
    public static readonly SHOW_GENDER_SELECTION: string = 'RWCCUE_SHOW_GENDER_SELECTION';

    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::SHOW_CLOTHING_EDITOR
    public static readonly SHOW_CLOTHING_EDITOR: string = 'RWCCUE_SHOW_CLOTHING_EDITOR';

    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::RoomWidgetClothingChangeUpdateEvent()
    constructor(type: string, objectId: number = 0, objectCategory: number = 0, roomId: number = 0)
    {
        super(type);

        this._objectId = objectId;
        this._objectCategory = objectCategory;
        this._roomId = roomId;
    }

    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::_SafeStr_8829
    private _objectCategory: number = -1;

    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::get objectCategory()
    public get objectCategory(): number
    {
        return this._objectCategory;
    }

    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::_SafeStr_6722
    private _roomId: number = -1;

    // AS3: .../events/RoomWidgetClothingChangeUpdateEvent.as::get roomId()
    public get roomId(): number
    {
        return this._roomId;
    }
}
