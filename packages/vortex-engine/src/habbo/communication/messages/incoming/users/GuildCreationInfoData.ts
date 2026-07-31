import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IGuildManagementData} from './IGuildManagementData';
import {GuildOwnedRoomData} from './GuildOwnedRoomData';
import {GuildBadgePartSetting} from './GuildBadgePartSetting';

/**
 * GuildCreationInfoData
 *
 * Payload of the server's answer to GetGuildCreationInfo: what a group costs, which of
 * the player's rooms may serve as its base, and the default badge layers to start from.
 *
 * The constant getters below are not stubs — the AS3 class answers the shared
 * `IGuildManagementData` shape with neutral values because no group exists yet, and
 * `GuildManagementWindowCtrl` reads exactly that to know it is in creation mode
 * (`exists === false`) and that the player owns what they are about to create
 * (`isOwner === true`).
 *
 * The AS3 class is obfuscated in every available tree (`_SafeCls_2053` in WIN63) and it
 * did not exist in the 2016 PRODUCTION build, so the class name here is DERIVED from
 * the handler it feeds (`HabboGroupsManager::onGuildCreationInfo()`); every member name
 * is recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2053.as
 */
export class GuildCreationInfoData implements IGuildManagementData
{
    private _costInCredits: number;
    private _ownedRooms: GuildOwnedRoomData[];
    private _badgeSettings: GuildBadgePartSetting[];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2053.as::_SafeCls_2053()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._costInCredits = wrapper.readInt();

        this._ownedRooms = [];

        let count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._ownedRooms.push(new GuildOwnedRoomData(wrapper.readInt(), wrapper.readString(), wrapper.readBoolean()));
        }

        count = wrapper.readInt();
        this._badgeSettings = [];

        for(let i = 0; i < count; i++)
        {
            this._badgeSettings.push(new GuildBadgePartSetting(wrapper));
        }
    }

    // AS3: .../_SafeCls_2053.as::get costInCredits()
    get costInCredits(): number
    {
        return this._costInCredits;
    }

    // AS3: .../_SafeCls_2053.as::get ownedRooms()
    get ownedRooms(): GuildOwnedRoomData[]
    {
        return this._ownedRooms;
    }

    // AS3: .../_SafeCls_2053.as::get exists()
    get exists(): boolean
    {
        return false;
    }

    // AS3: .../_SafeCls_2053.as::get isOwner()
    get isOwner(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_2053.as::get groupId()
    get groupId(): number
    {
        return 0;
    }

    // AS3: .../_SafeCls_2053.as::get groupName()
    get groupName(): string
    {
        return '';
    }

    // AS3: .../_SafeCls_2053.as::get groupDesc()
    get groupDesc(): string
    {
        return '';
    }

    // AS3: .../_SafeCls_2053.as::get baseRoomId()
    get baseRoomId(): number
    {
        return 0;
    }

    // AS3: .../_SafeCls_2053.as::get primaryColorId()
    get primaryColorId(): number
    {
        return 0;
    }

    // AS3: .../_SafeCls_2053.as::get secondaryColorId()
    get secondaryColorId(): number
    {
        return 0;
    }

    // AS3: .../_SafeCls_2053.as::get badgeSettings()
    get badgeSettings(): GuildBadgePartSetting[]
    {
        return this._badgeSettings;
    }

    // AS3: .../_SafeCls_2053.as::get locked()
    get locked(): boolean
    {
        return false;
    }

    // AS3: .../_SafeCls_2053.as::get url()
    get url(): string
    {
        return '';
    }

    // AS3: .../_SafeCls_2053.as::get guildType()
    get guildType(): number
    {
        return 0;
    }

    // AS3: .../_SafeCls_2053.as::get guildRightsLevel()
    get guildRightsLevel(): number
    {
        return 0;
    }

    // AS3: .../_SafeCls_2053.as::get badgeCode()
    get badgeCode(): string
    {
        return '';
    }

    // AS3: .../_SafeCls_2053.as::get membershipCount()
    get membershipCount(): number
    {
        return 0;
    }
}
