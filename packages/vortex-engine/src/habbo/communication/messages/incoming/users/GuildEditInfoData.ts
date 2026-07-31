import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IGuildManagementData} from './IGuildManagementData';
import {GuildOwnedRoomData} from './GuildOwnedRoomData';
import {GuildBadgePartSetting} from './GuildBadgePartSetting';

/**
 * GuildEditInfoData
 *
 * Payload of the server's answer to GetGuildEditInfo: the same shape
 * `GuildCreationInfoData` answers with constants, but filled in from an existing group.
 * `exists` is hard `true` here, which is what puts GuildManagementWindowCtrl in its
 * tabbed edit mode instead of the stepped creation wizard.
 *
 * The AS3 class is obfuscated in every available tree (`_SafeCls_1831` in WIN63) and it
 * did not exist in the 2016 PRODUCTION build, so the class name here is DERIVED from
 * the handler it feeds (`HabboGroupsManager::onGuildEditInfo()`); every member name is
 * recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_1831.as
 */
export class GuildEditInfoData implements IGuildManagementData
{
    private _ownedRooms: GuildOwnedRoomData[];
    private _isOwner: boolean;
    private _groupId: number;
    private _groupName: string;
    private _groupDesc: string;
    private _baseRoomId: number;
    private _primaryColorId: number;
    private _secondaryColorId: number;
    private _guildType: number;
    private _guildRightsLevel: number;
    private _locked: boolean;
    private _url: string;
    private _badgeSettings: GuildBadgePartSetting[];
    private _badgeCode: string;
    private _membershipCount: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_1831.as::_SafeCls_1831()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._ownedRooms = [];

        let count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._ownedRooms.push(new GuildOwnedRoomData(wrapper.readInt(), wrapper.readString(), wrapper.readBoolean()));
        }

        this._isOwner = wrapper.readBoolean();
        this._groupId = wrapper.readInt();
        this._groupName = wrapper.readString();
        this._groupDesc = wrapper.readString();
        this._baseRoomId = wrapper.readInt();
        this._primaryColorId = wrapper.readInt();
        this._secondaryColorId = wrapper.readInt();
        this._guildType = wrapper.readInt();
        this._guildRightsLevel = wrapper.readInt();
        this._locked = wrapper.readBoolean();
        this._url = wrapper.readString();

        this._badgeSettings = [];
        count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._badgeSettings.push(new GuildBadgePartSetting(wrapper));
        }

        this._badgeCode = wrapper.readString();
        this._membershipCount = wrapper.readInt();
    }

    // AS3: .../_SafeCls_1831.as::get ownedRooms()
    get ownedRooms(): GuildOwnedRoomData[]
    {
        return this._ownedRooms;
    }

    // AS3: .../_SafeCls_1831.as::get exists()
    get exists(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_1831.as::get isOwner()
    get isOwner(): boolean
    {
        return this._isOwner;
    }

    // AS3: .../_SafeCls_1831.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: .../_SafeCls_1831.as::get groupName()
    get groupName(): string
    {
        return this._groupName;
    }

    // AS3: .../_SafeCls_1831.as::get groupDesc()
    get groupDesc(): string
    {
        return this._groupDesc;
    }

    // AS3: .../_SafeCls_1831.as::get baseRoomId()
    get baseRoomId(): number
    {
        return this._baseRoomId;
    }

    // AS3: .../_SafeCls_1831.as::get primaryColorId()
    get primaryColorId(): number
    {
        return this._primaryColorId;
    }

    // AS3: .../_SafeCls_1831.as::get secondaryColorId()
    get secondaryColorId(): number
    {
        return this._secondaryColorId;
    }

    // AS3: .../_SafeCls_1831.as::get badgeSettings()
    get badgeSettings(): GuildBadgePartSetting[]
    {
        return this._badgeSettings;
    }

    // AS3: .../_SafeCls_1831.as::get locked()
    get locked(): boolean
    {
        return this._locked;
    }

    // AS3: .../_SafeCls_1831.as::get url()
    get url(): string
    {
        return this._url;
    }

    // AS3: .../_SafeCls_1831.as::get guildType()
    get guildType(): number
    {
        return this._guildType;
    }

    // AS3: .../_SafeCls_1831.as::get guildRightsLevel()
    get guildRightsLevel(): number
    {
        return this._guildRightsLevel;
    }

    // AS3: .../_SafeCls_1831.as::get badgeCode()
    get badgeCode(): string
    {
        return this._badgeCode;
    }

    // AS3: .../_SafeCls_1831.as::get membershipCount()
    get membershipCount(): number
    {
        return this._membershipCount;
    }
}
