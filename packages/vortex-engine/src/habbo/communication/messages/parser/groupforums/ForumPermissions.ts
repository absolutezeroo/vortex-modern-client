import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ForumData} from './ForumData';

/**
 * A forum plus what this user may do in it — the payload of the single-forum request.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_3304.as
 * (readable as `class_3591` in win63_version)
 *
 * The four `*Permissions` ints say which group rank a right requires; the five `*Error` strings
 * are what the server says when this user does not have it. The `can*` answers are derived from
 * the strings, not from the ints: an empty error means allowed. `canReport` is hardcoded true in
 * AS3 — kept, since inventing a rule for it would be inventing behaviour.
 */
export class ForumPermissions extends ForumData
{
    // AS3: _SafeCls_3304.as::_readPermissions
    private _readPermissions: number = 0;

    // AS3: _SafeCls_3304.as::_postMessagePermissions
    private _postMessagePermissions: number = 0;

    // AS3: _SafeCls_3304.as::_postThreadPermissions
    private _postThreadPermissions: number = 0;

    // AS3: _SafeCls_3304.as::_moderatePermissions
    private _moderatePermissions: number = 0;

    // AS3: _SafeCls_3304.as::_readPermissionError
    private _readPermissionError: string = '';

    // AS3: _SafeCls_3304.as::_postMessagePermissionError
    private _postMessagePermissionError: string = '';

    // AS3: _SafeCls_3304.as::_postThreadPermissionError
    private _postThreadPermissionError: string = '';

    // AS3: _SafeCls_3304.as::_moderatePermissionError
    private _moderatePermissionError: string = '';

    // AS3: _SafeCls_3304.as::_reportPermissionError
    private _reportPermissionError: string = '';

    // AS3: _SafeCls_3304.as::_canChangeSettings
    private _canChangeSettings: boolean = false;

    // AS3: _SafeCls_3304.as::_isStaff
    private _isStaff: boolean = false;

    // AS3: _SafeCls_3304.as::readFromMessage()
    // The base half of the payload comes first — this is a forum record with extra fields, not a
    // separate message.
    static override readFromMessage(wrapper: IMessageDataWrapper): ForumPermissions
    {
        const permissions = ForumData.fillFromMessage(new ForumPermissions(), wrapper);

        permissions._readPermissions = wrapper.readInt();
        permissions._postMessagePermissions = wrapper.readInt();
        permissions._postThreadPermissions = wrapper.readInt();
        permissions._moderatePermissions = wrapper.readInt();
        permissions._readPermissionError = wrapper.readString();
        permissions._postMessagePermissionError = wrapper.readString();
        permissions._postThreadPermissionError = wrapper.readString();
        permissions._moderatePermissionError = wrapper.readString();
        permissions._reportPermissionError = wrapper.readString();
        permissions._canChangeSettings = wrapper.readBoolean();
        permissions._isStaff = wrapper.readBoolean();

        return permissions;
    }

    // AS3: _SafeCls_3304.as::get readPermissions()
    get readPermissions(): number
    {
        return this._readPermissions;
    }

    // AS3: _SafeCls_3304.as::get postMessagePermissions()
    get postMessagePermissions(): number
    {
        return this._postMessagePermissions;
    }

    // AS3: _SafeCls_3304.as::get postThreadPermissions()
    get postThreadPermissions(): number
    {
        return this._postThreadPermissions;
    }

    // AS3: _SafeCls_3304.as::get moderatePermissions()
    get moderatePermissions(): number
    {
        return this._moderatePermissions;
    }

    // AS3: _SafeCls_3304.as::get canRead()
    get canRead(): boolean
    {
        return this._readPermissionError.length === 0;
    }

    // AS3: _SafeCls_3304.as::get canReport()
    // Hardcoded true in AS3, despite `reportPermissionError` being parsed right next to it.
    get canReport(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_3304.as::get canPostMessage()
    get canPostMessage(): boolean
    {
        return this._postMessagePermissionError.length === 0;
    }

    // AS3: _SafeCls_3304.as::get canPostThread()
    get canPostThread(): boolean
    {
        return this._postThreadPermissionError.length === 0;
    }

    // AS3: _SafeCls_3304.as::get canModerate()
    get canModerate(): boolean
    {
        return this._moderatePermissionError.length === 0;
    }

    // AS3: _SafeCls_3304.as::get canChangeSettings()
    get canChangeSettings(): boolean
    {
        return this._canChangeSettings;
    }

    // AS3: _SafeCls_3304.as::get isStaff()
    get isStaff(): boolean
    {
        return this._isStaff;
    }

    // AS3: _SafeCls_3304.as::get readPermissionError()
    get readPermissionError(): string
    {
        return this._readPermissionError;
    }

    // AS3: _SafeCls_3304.as::get postMessagePermissionError()
    get postMessagePermissionError(): string
    {
        return this._postMessagePermissionError;
    }

    // AS3: _SafeCls_3304.as::get postThreadPermissionError()
    get postThreadPermissionError(): string
    {
        return this._postThreadPermissionError;
    }

    // AS3: _SafeCls_3304.as::get moderatePermissionError()
    get moderatePermissionError(): string
    {
        return this._moderatePermissionError;
    }

    // AS3: _SafeCls_3304.as::get reportPermissionError()
    get reportPermissionError(): string
    {
        return this._reportPermissionError;
    }
}
