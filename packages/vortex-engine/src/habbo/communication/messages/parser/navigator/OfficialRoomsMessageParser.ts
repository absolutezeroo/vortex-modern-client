import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {OfficialRoomEntryData, OfficialRoomsData, PromotedRoomsData} from '../../incoming/navigator';

/**
 * Parser for official rooms message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/OfficialRoomsEventParser.as
 */
export class OfficialRoomsMessageParser implements IMessageParser
{
    private _data: OfficialRoomsData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/OfficialRoomsEventParser.as::get data()
    get data(): OfficialRoomsData | null
    {
        return this._data;
    }

    private _adRoom: OfficialRoomEntryData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/OfficialRoomsEventParser.as::get adRoom()
    get adRoom(): OfficialRoomEntryData | null
    {
        return this._adRoom;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/OfficialRoomsEventParser.as::_promotedRooms
    private _promotedRooms: PromotedRoomsData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/OfficialRoomsEventParser.as::get promotedRooms()
    get promotedRooms(): PromotedRoomsData | null
    {
        return this._promotedRooms;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/OfficialRoomsEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        this._adRoom = null;
        this._promotedRooms = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/navigator/OfficialRoomsEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._data = new OfficialRoomsData(wrapper);

        const adRoomCount = wrapper.readInt();
        if(adRoomCount > 0)
        {
            this._adRoom = new OfficialRoomEntryData(wrapper);
        }

        this._promotedRooms = new PromotedRoomsData(wrapper);

        return true;
    }
}
