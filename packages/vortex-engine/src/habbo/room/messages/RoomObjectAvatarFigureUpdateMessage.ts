/**
 * RoomObjectAvatarFigureUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarFigureUpdateMessage
 *
 * Update message for avatar figure (look) and gender.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarFigureUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(figure: string, gender: string, race: string = '', isRiding: boolean = false)
    {
        super(null, null);
        this._figure = figure;
        this._gender = gender;
        this._race = race;
        this._isRiding = isRiding;
    }

    private _figure: string;

    get figure(): string
    {
        return this._figure;
    }

    private _gender: string;

    get gender(): string
    {
        return this._gender;
    }

    private _race: string;

    get race(): string
    {
        return this._race;
    }

    private _isRiding: boolean;

    get isRiding(): boolean
    {
        return this._isRiding;
    }
}
