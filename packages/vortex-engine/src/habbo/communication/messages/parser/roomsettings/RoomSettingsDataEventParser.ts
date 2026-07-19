import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomSettingsData} from './RoomSettingsData';
import {RoomChatSettings} from './RoomChatSettings';
import {RoomModerationSettings} from './RoomModerationSettings';

export class RoomSettingsDataEventParser implements IMessageParser
{
    private _data: RoomSettingsData | null = null;

    flush(): boolean
    {
        this._data = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        const data = new RoomSettingsData();
        data.roomId = wrapper.readInt();
        data.name = wrapper.readString();
        data.description = wrapper.readString();
        data.doorMode = wrapper.readInt();
        data.categoryId = wrapper.readInt();
        data.maximumVisitors = wrapper.readInt();
        data.maximumVisitorsLimit = wrapper.readInt();

        data.tags = [];
        const tagCount = wrapper.readInt();

        for(let i = 0; i < tagCount; i++)
        {
            data.tags.push(wrapper.readString());
        }

        data.tradeMode = wrapper.readInt();
        data.allowPets = wrapper.readInt() === 1;
        data.allowFoodConsume = wrapper.readInt() === 1;
        data.allowWalkThrough = wrapper.readInt() === 1;
        data.hideWalls = wrapper.readInt() === 1;
        data.wallThickness = wrapper.readInt();
        data.floorThickness = wrapper.readInt();
        data.chatSettings = new RoomChatSettings(wrapper);
        data.allowNavigatorDynamicCats = wrapper.readBoolean();
        data.roomModerationSettings = new RoomModerationSettings(wrapper);
        data.hiddenByBc = wrapper.readBoolean();

        this._data = data;
        return true;
    }

    get data(): RoomSettingsData | null
    {
        return this._data;
    }
}
