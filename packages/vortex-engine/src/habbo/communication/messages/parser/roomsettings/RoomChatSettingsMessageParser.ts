import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {RoomChatSettings} from './RoomChatSettings';

/**
 * The room's chat flood sensitivity, pushed on its own.
 *
 * One int on the wire, and `fromFloodSensitivity()` fills the other three settings with AS3's
 * defaults — this message carries nothing but the sensitivity, which is why the settings object it
 * hands back has a free-flow mode and normal width/speed that no one should read.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2918/_SafeCls_3195.as
 */
export class RoomChatSettingsMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_3195.as::_SafeStr_7705 (name from `get chatSettings()`)
    private _chatSettings: RoomChatSettings | null = null;

    // AS3: .../_SafeCls_3195.as::flush()
    flush(): boolean
    {
        this._chatSettings = null;

        return true;
    }

    // AS3: .../_SafeCls_3195.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._chatSettings = RoomChatSettings.fromFloodSensitivity(wrapper.readInt());

        return true;
    }

    // AS3: .../_SafeCls_3195.as::get chatSettings()
    get chatSettings(): RoomChatSettings | null
    {
        return this._chatSettings;
    }
}
