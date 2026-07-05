import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * HabboGroupDetailsData
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.incoming.users.class_1199
 * - com.sulake.habbo.communication.messages.incoming.users.HabboGroupDetailsData
 */
export class HabboGroupDetailsData
{
    public static readonly TYPE_REGULAR = 0;
    public static readonly TYPE_EXCLUSIVE = 1;
    public static readonly TYPE_CLOSED = 2;
    public static readonly TYPE_LARGE = 3;
    public static readonly TYPE_LARGE_CLOSED = 4;

    public static readonly STATUS_NOT_MEMBER = 0;
    public static readonly STATUS_MEMBER = 1;
    public static readonly STATUS_PENDING = 2;

    private _groupId: number;
    private _isGuild: boolean;
    private _type: number;
    private _groupName: string;
    private _description: string;
    private _badgeCode: string;
    private _roomId: number = -1;
    private _roomName: string = '';
    private _status: number;
    private _totalMembers: number;
    private _favourite: boolean;
    private _creationDate: string;
    private _isOwner: boolean;
    private _isAdmin: boolean;
    private _ownerName: string;
    private _openDetails: boolean;
    private _membersCanDecorate: boolean;
    private _pendingMemberCount: number;
    private _hasBoard: boolean;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._groupId = wrapper.readInt();
        this._isGuild = wrapper.readBoolean();
        this._type = wrapper.readInt();
        this._groupName = wrapper.readString();
        this._description = wrapper.readString();
        this._badgeCode = wrapper.readString();
        this._roomId = wrapper.readInt();
        this._roomName = wrapper.readString();
        this._status = wrapper.readInt();
        this._totalMembers = wrapper.readInt();
        this._favourite = wrapper.readBoolean();
        this._creationDate = wrapper.readString();
        this._isOwner = wrapper.readBoolean();
        this._isAdmin = wrapper.readBoolean();
        this._ownerName = wrapper.readString();
        this._openDetails = wrapper.readBoolean();
        this._membersCanDecorate = wrapper.readBoolean();
        this._pendingMemberCount = wrapper.readInt();
        this._hasBoard = wrapper.readBoolean();
    }

    get groupId(): number
    {
        return this._groupId;
    }

    get isGuild(): boolean
    {
        return this._isGuild;
    }

    get type(): number
    {
        return this._type;
    }

    get groupName(): string
    {
        return this._groupName;
    }

    get description(): string
    {
        return this._description;
    }

    get badgeCode(): string
    {
        return this._badgeCode;
    }

    get roomId(): number
    {
        return this._roomId;
    }

    get roomName(): string
    {
        return this._roomName;
    }

    get status(): number
    {
        return this._status;
    }

    get totalMembers(): number
    {
        return this._totalMembers;
    }

    get favourite(): boolean
    {
        return this._favourite;
    }

    get creationDate(): string
    {
        return this._creationDate;
    }

    get isOwner(): boolean
    {
        return this._isOwner;
    }

    get isAdmin(): boolean
    {
        return this._isAdmin;
    }

    get ownerName(): string
    {
        return this._ownerName;
    }

    get openDetails(): boolean
    {
        return this._openDetails;
    }

    get membersCanDecorate(): boolean
    {
        return this._membersCanDecorate;
    }

    get pendingMemberCount(): number
    {
        return this._pendingMemberCount;
    }

    get hasBoard(): boolean
    {
        return this._hasBoard;
    }

    get joiningAllowed(): boolean
    {
        return this._status === HabboGroupDetailsData.STATUS_NOT_MEMBER
			&& (this._type === HabboGroupDetailsData.TYPE_REGULAR || this._type === HabboGroupDetailsData.TYPE_LARGE_CLOSED);
    }

    get requestMembershipAllowed(): boolean
    {
        return this._status === HabboGroupDetailsData.STATUS_NOT_MEMBER
			&& this._type === HabboGroupDetailsData.TYPE_EXCLUSIVE;
    }

    get leaveAllowed(): boolean
    {
        return this._isGuild && !this._isOwner && this._status === HabboGroupDetailsData.STATUS_MEMBER;
    }
}
