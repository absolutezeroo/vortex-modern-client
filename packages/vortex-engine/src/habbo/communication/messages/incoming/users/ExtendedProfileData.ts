import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {HabboGroupEntryData} from './HabboGroupEntryData';
import {BadgeRarityCount} from './BadgeRarityCount';

/**
 * ExtendedProfileData
 *
 * The full 23 fields the 2026 client reads. This stopped at 19 until 2026-08-11, when the last
 * four — `totalBadges`, `achievementLevel`, the `badgeRarityCounts` list and `totalBadgesRank` —
 * were added on both sides in one change: reading them before `vortex-emulator`'s composer wrote
 * them would have run off the end of the packet, so neither side could move alone.
 *
 * `IntegerField24`, `BooleanField26` and `BooleanField27` have no getter in AS3 either: they are
 * read and discarded there too. The names are the emulator's, kept so the two sides can be lined
 * up by eye.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as
 * (obfuscated; the getters keep their real names, which is what identifies it. The per-field
 * traces below point at sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as
 * because the private backing fields are obfuscated in the primary tree and readable only there.)
 */
export class ExtendedProfileData
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::_SafeStr_11534
    // Name derived — the constant is obfuscated in every tree. The value, and the meaning, come
    // from `ExtendedProfileWindowCtrl.as:296`, which shows `offline_icon` when onlineStatus is 0.
    public static readonly ONLINE_STATUS_OFFLINE: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::_SafeStr_10778
    // Derived, as above; `ExtendedProfileWindowCtrl.as:295` shows `online_icon` at 1.
    public static readonly ONLINE_STATUS_ONLINE: number = 1;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::_SafeStr_10654
    // Derived, as above; `ExtendedProfileWindowCtrl.as:297` shows `hidden_icon` at 2.
    public static readonly ONLINE_STATUS_HIDDEN: number = 2;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_userId
    private _userId: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_userName
    private _userName: string;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_figure
    private _figure: string;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_motto
    private _motto: string;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_creationDate
    private _creationDate: string;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_achievementScore
    private _achievementScore: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_friendCount
    private _friendCount: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_isFriend
    private _isFriend: boolean;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_isFriendRequestSent
    private _isFriendRequestSent: boolean;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get onlineStatus()
    // A tri-state byte, not the boolean this port read it as. AS3 declares the three values as
    // constants whose identifiers are obfuscated in every tree, so `ONLINE_STATUS_*` below are
    // derived names; the values are the source's.
    private _onlineStatus: number = ExtendedProfileData.ONLINE_STATUS_OFFLINE;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_guilds
    private _guilds: HabboGroupEntryData[] = [];
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_lastAccessSinceInSeconds
    private _lastAccessSinceInSeconds: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_openProfileWindow
    private _openProfileWindow: boolean;
    private _accountLevel: number = 0;
    private _starGemCount: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get isHidden()
    // Was `_unknownBoolean1`. It is the "hidden" online status: AS3 reads it here, one field after
    // `openProfileWindow`, and exposes it as `isHidden()`; the emulator writes the same slot as
    // `[Id(13)] IsHidden`. Both sides already carried it — only this port's name did not.
    private _isHidden: boolean = false;
    // Unnamed in AS3 too (read and discarded, no getter); `IntegerField24` in the emulator.
    private _unknownInt1: number = 0;
    // Unnamed in AS3 too; `BooleanField26` in the emulator.
    private _unknownBoolean2: boolean = false;
    // Unnamed in AS3 too; `BooleanField27` in the emulator.
    private _unknownBoolean3: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get totalBadges()
    private _totalBadges: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get achievementLevel()
    private _achievementLevel: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get badgeRarityCounts()
    private _badgeRarityCounts: BadgeRarityCount[] = [];
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get totalBadgesRank()
    private _totalBadgesRank: number = 0;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._userId = wrapper.readInt();
        this._userName = wrapper.readString();
        this._figure = wrapper.readString();
        this._motto = wrapper.readString();
        this._creationDate = wrapper.readString();
        this._achievementScore = wrapper.readInt();
        this._friendCount = wrapper.readInt();
        this._isFriend = wrapper.readBoolean();
        this._isFriendRequestSent = wrapper.readBoolean();
        // A tri-state byte: 0 offline, 1 online, 2 online-but-hidden. The emulator writes all
        // three since its `IsOnline` bool became `OnlineStatus`.
        this._onlineStatus = wrapper.readByte();

        const guildCount = wrapper.readInt();

        for(let i = 0; i < guildCount; i++)
        {
            this._guilds.push(new HabboGroupEntryData(wrapper));
        }

        this._lastAccessSinceInSeconds = wrapper.readInt();
        this._openProfileWindow = wrapper.readBoolean();

        // AS3 reads these unconditionally; the guard is this port's, and is what lets an older
        // server that stops after `openProfileWindow` still parse.
        if(wrapper.bytesAvailable > 0)
        {
            this._isHidden = wrapper.readBoolean();
            this._accountLevel = wrapper.readInt();
            this._unknownInt1 = wrapper.readInt();
            this._starGemCount = wrapper.readInt();
            this._unknownBoolean2 = wrapper.readBoolean();
            this._unknownBoolean3 = wrapper.readBoolean();

            this._totalBadges = wrapper.readInt();
            this._achievementLevel = wrapper.readInt();

            const rarityCount = wrapper.readInt();

            for(let i = 0; i < rarityCount; i++)
            {
                // The tier is a byte and the count an int — not two ints. Reading the tier wide
                // would swallow three bytes of the count and desync everything after it.
                this._badgeRarityCounts.push(new BadgeRarityCount(wrapper.readByte(), wrapper.readInt()));
            }

            this._totalBadgesRank = wrapper.readInt();
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get totalBadges()
    get totalBadges(): number
    {
        return this._totalBadges;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get achievementLevel()
    get achievementLevel(): number
    {
        return this._achievementLevel;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get badgeRarityCounts()
    get badgeRarityCounts(): BadgeRarityCount[]
    {
        return this._badgeRarityCounts;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get totalBadgesRank()
    get totalBadgesRank(): number
    {
        return this._totalBadgesRank;
    }

    /**
     * How many badges the player holds at one rarity tier, or 0 for a tier the server did not
     * mention. AS3 walks the same list rather than indexing it — the tiers arrive sparse.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::getBadgeCountByRarityId()
    getBadgeCountByRarityId(rarityId: number): number
    {
        for(const entry of this._badgeRarityCounts)
        {
            if(entry.rarityId === rarityId) return entry.count;
        }

        return 0;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get figure()
    get figure(): string
    {
        return this._figure;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get motto()
    get motto(): string
    {
        return this._motto;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get creationDate()
    get creationDate(): string
    {
        return this._creationDate;
    }

    get achievementScore(): number
    {
        return this._achievementScore;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get friendCount()
    get friendCount(): number
    {
        return this._friendCount;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get isFriend()
    get isFriend(): boolean
    {
        return this._isFriend;
    }

    get isFriendRequestSent(): boolean
    {
        return this._isFriendRequestSent;
    }

    set isFriendRequestSent(value: boolean)
    {
        this._isFriendRequestSent = value;
    }

    /**
	 * Online status: offline (0), online (1) or online-but-hidden (2)
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get onlineStatus()
    get onlineStatus(): number
    {
        return this._onlineStatus;
    }

    // TS-only: no AS3 counterpart — AS3 reads the tri-state and compares it at each use site.
    // Kept because this port's callers were written against a boolean.
    get isOnline(): boolean
    {
        return this._onlineStatus === ExtendedProfileData.ONLINE_STATUS_ONLINE;
    }

    /**
	 * Whether this user's online status is hidden from other players
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2228.as::get isHidden()
    get isHidden(): boolean
    {
        return this._isHidden;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get guilds()
    get guilds(): HabboGroupEntryData[]
    {
        return this._guilds;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get lastAccessSinceInSeconds()
    get lastAccessSinceInSeconds(): number
    {
        return this._lastAccessSinceInSeconds;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::get openProfileWindow()
    get openProfileWindow(): boolean
    {
        return this._openProfileWindow;
    }

    get accountLevel(): number
    {
        return this._accountLevel;
    }

    get starGemCount(): number
    {
        return this._starGemCount;
    }
}
