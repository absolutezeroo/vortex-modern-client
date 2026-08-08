import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * The three sound sliders, carried for both "store this" and "let me hear it" — `PREVIEW_SOUND`
 * plays at the new levels without committing them.
 *
 * The three volumes are plain read/write properties with no constructor arguments: AS3 builds the
 * message and then assigns them one at a time.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetStoreSettingsMessage.as
 */
export class RoomWidgetStoreSettingsMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::STORE_ALL_SETTINGS
    // Declared and sent by nothing — `MeMenuWidgetHandler` has no case for it, so it falls to the
    // "unhandled message" default.
    public static readonly STORE_ALL_SETTINGS: string = 'RWSSM_STORE_SETTINGS';

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::STORE_SOUND_SETTING
    public static readonly STORE_SOUND_SETTING: string = 'RWSSM_STORE_SOUND';

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::PREVIEW_SOUND_SETTING
    public static readonly PREVIEW_SOUND_SETTING: string = 'RWSSM_PREVIEW_SOUND';

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::_traxVolume
    private _traxVolume: number = 0;

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::_furniVolume
    private _furniVolume: number = 0;

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::_genericVolume
    private _genericVolume: number = 0;

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::RoomWidgetStoreSettingsMessage()
    constructor(type: string)
    {
        super(type);
    }

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::get traxVolume()
    public get traxVolume(): number
    {
        return this._traxVolume;
    }

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::set traxVolume()
    public set traxVolume(value: number)
    {
        this._traxVolume = value;
    }

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::get furniVolume()
    public get furniVolume(): number
    {
        return this._furniVolume;
    }

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::set furniVolume()
    public set furniVolume(value: number)
    {
        this._furniVolume = value;
    }

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::get genericVolume()
    public get genericVolume(): number
    {
        return this._genericVolume;
    }

    // AS3: .../widget/messages/RoomWidgetStoreSettingsMessage.as::set genericVolume()
    public set genericVolume(value: number)
    {
        this._genericVolume = value;
    }
}
