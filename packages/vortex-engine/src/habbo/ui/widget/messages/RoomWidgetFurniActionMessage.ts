/**
 * RoomWidgetFurniActionMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetFurniActionMessage extends RoomWidgetMessage
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::ROTATE
    public static readonly ROTATE: string = 'RWFUAM_ROTATE';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::MOVE
    public static readonly MOVE: string = 'RWFAM_MOVE';

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::const_1022
    public static readonly PICKUP: string = 'RWFAM_PICKUP';

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::const_640
    public static readonly EJECT: string = 'RWFAM_EJECT';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::USE
    public static readonly USE: string = 'RWFAM_USE';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::SAVE_STUFF_DATA
    public static readonly SAVE_STUFF_DATA: string = 'RWFAM_SAVE_STUFF_DATA';

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::const_112
    public static readonly WIRED_INSPECT: string = 'RWFAM_WIRED_INSPECT';

    private _furniId: number;
    private _furniCategory: number;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::_offerId
    private _offerId: number;
    private _objectData: string | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::RoomWidgetFurniActionMessage()
    constructor(type: string, furniId: number, furniCategory: number, offerId: number = -1, objectData: string | null = null)
    {
        super(type);
        this._furniId = furniId;
        this._furniCategory = furniCategory;
        this._offerId = offerId;
        this._objectData = objectData;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::get furniId()
    public get furniId(): number
    {
        return this._furniId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::get furniCategory()
    public get furniCategory(): number
    {
        return this._furniCategory;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::get objectData()
    public get objectData(): string | null
    {
        return this._objectData;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFurniActionMessage.as::get offerId()
    public get offerId(): number
    {
        return this._offerId;
    }
}
