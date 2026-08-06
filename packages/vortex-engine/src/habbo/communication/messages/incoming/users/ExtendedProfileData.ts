import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {HabboGroupEntryData} from './HabboGroupEntryData';

/**
 * ExtendedProfileData
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.incoming.users.class_1581
 * - com.sulake.habbo.communication.messages.incoming.users.ExtendedProfileData
 */
export class ExtendedProfileData
{
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
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_isOnline
    private _isOnline: boolean;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_guilds
    private _guilds: HabboGroupEntryData[] = [];
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_lastAccessSinceInSeconds
    private _lastAccessSinceInSeconds: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/ExtendedProfileData.as::_openProfileWindow
    private _openProfileWindow: boolean;
    private _accountLevel: number = 0;
    private _starGemCount: number = 0;
    private _unknownBoolean1: boolean = false;
    private _unknownInt1: number = 0;
    private _unknownBoolean2: boolean = false;
    private _unknownBoolean3: boolean = false;

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
        this._isOnline = wrapper.readBoolean();

        const guildCount = wrapper.readInt();

        for(let i = 0; i < guildCount; i++)
        {
            this._guilds.push(new HabboGroupEntryData(wrapper));
        }

        this._lastAccessSinceInSeconds = wrapper.readInt();
        this._openProfileWindow = wrapper.readBoolean();

        if(wrapper.bytesAvailable > 0)
        {
            this._unknownBoolean1 = wrapper.readBoolean();
            this._accountLevel = wrapper.readInt();
            this._unknownInt1 = wrapper.readInt();
            this._starGemCount = wrapper.readInt();
            this._unknownBoolean2 = wrapper.readBoolean();
            this._unknownBoolean3 = wrapper.readBoolean();
        }
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

    get isOnline(): boolean
    {
        return this._isOnline;
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
