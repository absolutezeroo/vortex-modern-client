import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {FriendData} from '@habbo/communication/messages/parser/friendlist/FriendData';
import {Logger} from '@core/utils/Logger';
import type {IFriend} from '../IFriend';

const logger = Logger.getLogger('habbo.friendlist.Friend');

/**
 * Friend
 *
 * One entry of the friend list, built straight off the wire DTO and then kept
 * mutable: the list updates `online`/`figure`/`motto` in place rather than
 * rebuilding the entry, and holds on to the row window (`view`) and the rendered
 * head (`face`) it owns.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/Friend.as
 */
export class Friend implements IFriend, IDisposable
{
    // AS3: .../domain/Friend.as::GENDER_FEMALE
    static readonly GENDER_FEMALE: number = 'F'.charCodeAt(0);

    // AS3: .../domain/Friend.as::GENDER_MALE
    static readonly GENDER_MALE: number = 'M'.charCodeAt(0);

    // AS3: .../domain/Friend.as::Friend()
    constructor(data: FriendData | null)
    {
        if(data === null)
        {
            return;
        }

        this._id = data.id;
        this._name = data.name;
        this._gender = data.gender;
        this._online = data.online;
        this._followingAllowed = data.followingAllowed && data.online;
        this._figure = data.figure;
        this._motto = data.motto;
        // AS3 reads `param1.lastAccess` here, but the DTO it reads from
        // (`_SafePkg_1764/_SafeCls_1774.as`) declares `lastAccess` and never assigns it —
        // its constructor reads 14 fields and that is not one of them, so the value is
        // always null on the wire. `FriendData` correspondingly has no such member.
        this._lastAccess = null;
        this._categoryId = 0;
        this._realName = data.realName;
        this._persistedMessageUser = data.persistedMessageUser;
        this._vipMember = data.vipMember;
        this._pocketHabboUser = data.pocketHabboUser;
        this._relationshipStatus = data.relationshipStatus;

        logger.trace(`Creating friend: ${this.id}, ${this.name}, ${this.gender}, ${this.online}, ${this.followingAllowed}, ${this.figure}, ${this.categoryId}`);
    }

    // AS3: .../domain/Friend.as::_SafeStr_4872
    private _id: number = 0;

    // AS3: .../domain/Friend.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../domain/Friend.as::set id()
    set id(value: number)
    {
        this._id = value;
    }

    // AS3: .../domain/Friend.as::_name
    private _name: string = '';

    // AS3: .../domain/Friend.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../domain/Friend.as::set name()
    set name(value: string)
    {
        this._name = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_4645
    private _gender: number = 0;

    // AS3: .../domain/Friend.as::get gender()
    get gender(): number
    {
        return this._gender;
    }

    // AS3: .../domain/Friend.as::set gender()
    set gender(value: number)
    {
        this._gender = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_7958
    private _online: boolean = false;

    // AS3: .../domain/Friend.as::get online()
    get online(): boolean
    {
        return this._online;
    }

    // AS3: .../domain/Friend.as::set online()
    set online(value: boolean)
    {
        this._online = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_7996
    private _followingAllowed: boolean = false;

    // AS3: .../domain/Friend.as::get followingAllowed()
    get followingAllowed(): boolean
    {
        return this._followingAllowed;
    }

    // AS3: .../domain/Friend.as::set followingAllowed()
    set followingAllowed(value: boolean)
    {
        this._followingAllowed = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_5551
    private _figure: string = '';

    // AS3: .../domain/Friend.as::get figure()
    get figure(): string
    {
        return this._figure;
    }

    // AS3: .../domain/Friend.as::set figure()
    set figure(value: string)
    {
        this._figure = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_7860
    private _motto: string = '';

    // AS3: .../domain/Friend.as::get motto()
    get motto(): string
    {
        return this._motto;
    }

    // AS3: .../domain/Friend.as::set motto()
    set motto(value: string)
    {
        this._motto = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_7699
    private _lastAccess: string | null = null;

    // AS3: .../domain/Friend.as::get lastAccess()
    get lastAccess(): string | null
    {
        return this._lastAccess;
    }

    // AS3: .../domain/Friend.as::set lastAccess()
    set lastAccess(value: string | null)
    {
        this._lastAccess = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_7619
    private _categoryId: number = 0;

    // AS3: .../domain/Friend.as::get categoryId()
    get categoryId(): number
    {
        return this._categoryId;
    }

    // AS3: .../domain/Friend.as::set categoryId()
    set categoryId(value: number)
    {
        this._categoryId = value;
    }

    // AS3: .../domain/Friend.as::_selected
    private _selected: boolean = false;

    // AS3: .../domain/Friend.as::get selected()
    get selected(): boolean
    {
        return this._selected;
    }

    // AS3: .../domain/Friend.as::set selected()
    set selected(value: boolean)
    {
        this._selected = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_4550
    private _view: IWindowContainer | null = null;

    // AS3: .../domain/Friend.as::get view()
    get view(): IWindowContainer | null
    {
        return this._view;
    }

    // AS3: .../domain/Friend.as::set view()
    set view(value: IWindowContainer | null)
    {
        this._view = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_4973
    private _face: ImageBitmap | null = null;

    // AS3: .../domain/Friend.as::get face()
    get face(): ImageBitmap | null
    {
        return this._face;
    }

    // AS3: .../domain/Friend.as::set face()
    set face(value: ImageBitmap | null)
    {
        this._face = value;
    }

    // AS3: .../domain/Friend.as::_realName
    private _realName: string = '';

    // AS3: .../domain/Friend.as::get realName()
    get realName(): string
    {
        return this._realName;
    }

    // AS3: .../domain/Friend.as::set realName()
    set realName(value: string)
    {
        this._realName = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_7767
    private _persistedMessageUser: boolean = false;

    // AS3: .../domain/Friend.as::get persistedMessageUser()
    get persistedMessageUser(): boolean
    {
        return this._persistedMessageUser;
    }

    // AS3: .../domain/Friend.as::set persistedMessageUser()
    set persistedMessageUser(value: boolean)
    {
        this._persistedMessageUser = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_8157
    private _pocketHabboUser: boolean = false;

    // AS3: .../domain/Friend.as::get pocketHabboUser()
    get pocketHabboUser(): boolean
    {
        return this._pocketHabboUser;
    }

    // AS3: .../domain/Friend.as::set pocketHabboUser()
    set pocketHabboUser(value: boolean)
    {
        this._pocketHabboUser = value;
    }

    // AS3: .../domain/Friend.as::_SafeStr_8326
    private _vipMember: boolean = false;

    // AS3: .../domain/Friend.as::get vipMember()
    get vipMember(): boolean
    {
        return this._vipMember;
    }

    // AS3: .../domain/Friend.as::set vipMember()
    set vipMember(value: boolean)
    {
        this._vipMember = value;
    }

    // AS3: .../domain/Friend.as::_relationshipStatus
    private _relationshipStatus: number = 0;

    /**
     * Read-only in AS3 as well — the status is changed through
     * `HabboFriendList.setRelationship()`, which round-trips it via the server and
     * rebuilds the entry, never by assigning here.
     */
    // AS3: .../domain/Friend.as::get relationshipStatus()
    get relationshipStatus(): number
    {
        return this._relationshipStatus;
    }

    // AS3: .../domain/Friend.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../domain/Friend.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Negative ids are not accounts: the friend list packs group entries into the same
     * list and gives them ids below zero.
     */
    // AS3: .../domain/Friend.as::isGroupFriend()
    isGroupFriend(): boolean
    {
        return this._id < 0;
    }

    // AS3: .../domain/Friend.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        if(this._face !== null)
        {
            this._face.close();
            this._face = null;
        }

        this._disposed = true;
        this._view = null;
    }
}
