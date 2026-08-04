import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomSettingsData} from './RoomSettingsData';
import {RoomChatSettings} from './RoomChatSettings';
import {RoomModerationSettings} from './RoomModerationSettings';

/**
 * RoomSettingsDataEventParser
 *
 * The room-settings dialog's whole payload.
 *
 * Three traps in this revision's layout, all of them places where an earlier build differed:
 * the allow/hide flags travel as **4-byte integers compared against 1**, not booleans; the
 * chat block has collapsed to a lone flood-sensitivity integer, from which the client rebuilds
 * a settings object with mode/width/speed hardcoded to 0/1/1; and six idle, door-tile and
 * pet-mute fields sit between that integer and the moderation block.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2452/_SafeCls_3719.as
 */
export class RoomSettingsDataEventParser implements IMessageParser
{
    // AS3: .../_SafeCls_3719.as::_SafeStr_4664
    private _data: RoomSettingsData | null = null;

    // AS3: .../_SafeCls_3719.as::flush()
    flush(): boolean
    {
        this._data = null;

        return true;
    }

    // AS3: .../_SafeCls_3719.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

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
        data.chatSettings = RoomChatSettings.fromFloodSensitivity(wrapper.readInt());
        data.leaveOnDoorTileEnabled = wrapper.readBoolean();
        data.idleSleepEnabled = wrapper.readBoolean();
        data.idleSleepTimeoutSeconds = wrapper.readInt();
        data.idleAutokickEnabled = wrapper.readBoolean();
        data.idleAutokickTimeoutSeconds = wrapper.readInt();
        data.muteAllPets = wrapper.readBoolean();
        data.roomModerationSettings = new RoomModerationSettings(wrapper);
        data.hiddenByBc = wrapper.readBoolean();

        this._data = data;

        return true;
    }

    // AS3: .../_SafeCls_3719.as::get data()
    get data(): RoomSettingsData | null
    {
        return this._data;
    }
}
