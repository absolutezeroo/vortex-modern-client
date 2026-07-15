import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A single guild the current user is a member of (drives GuildSelectorCatalogWidget's drop-list).
 *
 * AS3 class name is unrecoverable in every available source tree (win63_version's `class_3489`,
 * win63_2023_version's `class_1633`, WIN63-202607011411-782849652's `_SafeCls_3623` are all the
 * same obfuscated shell, consistent with a `[SecureSWF(rename="true")]` tag) - `GuildMembership`
 * is a TS-derived name, not a recovered one.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as
 */
export class GuildMembership
{
    private _groupId: number = 0;

    private _groupName: string = '';

    private _badgeCode: string = '';

    private _primaryColor: string = '';

    private _secondaryColor: string = '';

    private _favourite: boolean = false;

    private _ownerId: number = 0;

    private _hasForum: boolean = false;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._groupId = wrapper.readInt();
        this._groupName = wrapper.readString();
        this._badgeCode = wrapper.readString();
        this._primaryColor = wrapper.readString();
        this._secondaryColor = wrapper.readString();
        this._favourite = wrapper.readBoolean();
        this._ownerId = wrapper.readInt();
        this._hasForum = wrapper.readBoolean();
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as::get groupName()
    get groupName(): string
    {
        return this._groupName;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as::get badgeCode()
    get badgeCode(): string
    {
        return this._badgeCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as::get primaryColor()
    get primaryColor(): string
    {
        return this._primaryColor;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as::get secondaryColor()
    get secondaryColor(): string
    {
        return this._secondaryColor;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as::get favourite()
    get favourite(): boolean
    {
        return this._favourite;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as::get ownerId()
    get ownerId(): number
    {
        return this._ownerId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/class_3489.as::get hasForum()
    get hasForum(): boolean
    {
        return this._hasForum;
    }
}
