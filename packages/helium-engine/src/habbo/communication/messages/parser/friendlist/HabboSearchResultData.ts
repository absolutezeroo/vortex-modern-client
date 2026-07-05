import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class representing a user search result entry.
 * Used by HabboSearchResultMessageParser for both friends and non-friends results.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/class_1712.as
 */
export class HabboSearchResultData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._avatarId = wrapper.readInt();
        this._avatarName = wrapper.readString();
        this._avatarMotto = wrapper.readString();
        this._isAvatarOnline = wrapper.readBoolean();
        this._canFollow = wrapper.readBoolean();
        wrapper.readString(); // lastOnlineDate (unused/discarded in AS3)
        this._avatarGender = wrapper.readInt();
        this._avatarFigure = wrapper.readString();
        this._realName = wrapper.readString();
    }

    private _avatarId: number;

    get avatarId(): number
    {
        return this._avatarId;
    }

    private _avatarName: string;

    get avatarName(): string
    {
        return this._avatarName;
    }

    private _avatarMotto: string;

    get avatarMotto(): string
    {
        return this._avatarMotto;
    }

    private _isAvatarOnline: boolean;

    get isAvatarOnline(): boolean
    {
        return this._isAvatarOnline;
    }

    private _canFollow: boolean;

    get canFollow(): boolean
    {
        return this._canFollow;
    }

    private _avatarGender: number;

    get avatarGender(): number
    {
        return this._avatarGender;
    }

    private _avatarFigure: string;

    get avatarFigure(): string
    {
        return this._avatarFigure;
    }

    private _realName: string;

    get realName(): string
    {
        return this._realName;
    }
}
