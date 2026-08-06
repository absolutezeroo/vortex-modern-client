import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomSettingsBannedUser} from './RoomSettingsBannedUser';

export class BannedUsersFromRoomEventParser implements IMessageParser
{
    private _roomId: number = 0;
    private _bannedUsers: RoomSettingsBannedUser[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/BannedUsersFromRoomEventParser.as::flush()
    flush(): boolean
    {
        this._bannedUsers = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/BannedUsersFromRoomEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomId = wrapper.readInt();
        this._bannedUsers = [];
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._bannedUsers.push(new RoomSettingsBannedUser(wrapper));
        }

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/BannedUsersFromRoomEventParser.as::get roomId()
    get roomId(): number { return this._roomId; }
    // AS3: sources/win63_version/habbo/communication/messages/parser/roomsettings/BannedUsersFromRoomEventParser.as::get bannedUsers()
    get bannedUsers(): RoomSettingsBannedUser[] { return this._bannedUsers; }
}
