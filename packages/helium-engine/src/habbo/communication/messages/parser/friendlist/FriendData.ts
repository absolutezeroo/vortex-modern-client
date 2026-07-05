import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class representing a friend entry from the server.
 * Used by FriendListFragmentMessageParser and FriendListUpdateMessageParser.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/FriendData.as
 */
export class FriendData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readInt();
        this._name = wrapper.readString();
        this._gender = wrapper.readInt();
        this._online = wrapper.readBoolean();
        this._followingAllowed = wrapper.readBoolean();
        this._figure = wrapper.readString();
        this._categoryId = wrapper.readInt();
        this._motto = wrapper.readString();
        this._realName = wrapper.readString();
        this._facebookId = wrapper.readString();
        this._persistedMessageUser = wrapper.readBoolean();
        this._vipMember = wrapper.readBoolean();
        this._pocketHabboUser = wrapper.readBoolean();
        this._relationshipStatus = wrapper.readShort();
    }

    private _id: number;

    get id(): number
    {
        return this._id;
    }

    private _name: string;

    get name(): string
    {
        return this._name;
    }

    private _gender: number;

    get gender(): number
    {
        return this._gender;
    }

    private _online: boolean;

    get online(): boolean
    {
        return this._online;
    }

    private _followingAllowed: boolean;

    get followingAllowed(): boolean
    {
        return this._followingAllowed;
    }

    private _figure: string;

    get figure(): string
    {
        return this._figure;
    }

    private _categoryId: number;

    get categoryId(): number
    {
        return this._categoryId;
    }

    private _motto: string;

    get motto(): string
    {
        return this._motto;
    }

    private _realName: string;

    get realName(): string
    {
        return this._realName;
    }

    private _facebookId: string;

    get facebookId(): string
    {
        return this._facebookId;
    }

    private _persistedMessageUser: boolean;

    get persistedMessageUser(): boolean
    {
        return this._persistedMessageUser;
    }

    private _vipMember: boolean;

    get vipMember(): boolean
    {
        return this._vipMember;
    }

    private _pocketHabboUser: boolean;

    get pocketHabboUser(): boolean
    {
        return this._pocketHabboUser;
    }

    private _relationshipStatus: number;

    get relationshipStatus(): number
    {
        return this._relationshipStatus;
    }
}
