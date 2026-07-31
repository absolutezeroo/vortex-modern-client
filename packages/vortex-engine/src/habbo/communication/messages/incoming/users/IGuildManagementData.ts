import type {GuildOwnedRoomData} from './GuildOwnedRoomData';
import type {GuildBadgePartSetting} from './GuildBadgePartSetting';

/**
 * IGuildManagementData
 *
 * The single shape GuildManagementWindowCtrl reads, whether it is driving the
 * five-step *creation* wizard (`GuildCreationInfoData`, `exists === false`) or the
 * tabbed *edit* window (`GuildEditInfoData`, `exists === true`). Everything the
 * creation payload does not carry is answered with a neutral constant on that side,
 * which is why the controller can treat both identically and branch only on `exists`.
 *
 * The AS3 interface is obfuscated in every available tree (`_SafeCls_1830` in WIN63)
 * and did not exist in the 2016 PRODUCTION build, so the interface name here is
 * DERIVED from its only consumer; every member name is recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_1830.as
 */
export interface IGuildManagementData
{
    // AS3: .../_SafeCls_1830.as::get ownedRooms()
    readonly ownedRooms: GuildOwnedRoomData[];
    // AS3: .../_SafeCls_1830.as::get exists()
    readonly exists: boolean;
    // AS3: .../_SafeCls_1830.as::get isOwner()
    readonly isOwner: boolean;
    // AS3: .../_SafeCls_1830.as::get groupId()
    readonly groupId: number;
    // AS3: .../_SafeCls_1830.as::get groupName()
    readonly groupName: string;
    // AS3: .../_SafeCls_1830.as::get groupDesc()
    readonly groupDesc: string;
    // AS3: .../_SafeCls_1830.as::get baseRoomId()
    readonly baseRoomId: number;
    // AS3: .../_SafeCls_1830.as::get primaryColorId()
    readonly primaryColorId: number;
    // AS3: .../_SafeCls_1830.as::get secondaryColorId()
    readonly secondaryColorId: number;
    // AS3: .../_SafeCls_1830.as::get badgeSettings()
    readonly badgeSettings: GuildBadgePartSetting[];
    // AS3: .../_SafeCls_1830.as::get locked()
    readonly locked: boolean;
    // AS3: .../_SafeCls_1830.as::get url()
    readonly url: string;
    // AS3: .../_SafeCls_1830.as::get guildType()
    readonly guildType: number;
    // AS3: .../_SafeCls_1830.as::get guildRightsLevel()
    readonly guildRightsLevel: number;
    // AS3: .../_SafeCls_1830.as::get badgeCode()
    readonly badgeCode: string;
    // AS3: .../_SafeCls_1830.as::get membershipCount()
    readonly membershipCount: number;
}
