import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomSettingsBannedUser} from './RoomSettingsBannedUser';

export class BannedUsersFromRoomEventParser implements IMessageParser
{
    private _roomId: number = 0;
    private _bannedUsers: RoomSettingsBannedUser[] = [];

    flush(): boolean
    {
        this._bannedUsers = [];
        return true;
    }

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

    get roomId(): number { return this._roomId; }
    get bannedUsers(): RoomSettingsBannedUser[] { return this._bannedUsers; }
}
