import type {IFriend} from '@habbo/friendlist/IFriend';

/**
 * DummyFriend
 *
 * A stand-in friend for a conversation with somebody who is not on the friend list —
 * a staff member, or a chat opened from a profile. It answers the `IFriend` contract
 * from three known values and hard-codes the rest optimistically: online, followable,
 * message-persisting.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/DummyFriend.as
 */
export class DummyFriend implements IFriend
{
    // AS3: .../messenger/DummyFriend.as::DummyFriend()
    constructor(id: number, userName: string, figure: string)
    {
        this._id = id;
        this._userName = userName;
        this._figure = figure;
    }

    // AS3: .../messenger/DummyFriend.as::_SafeStr_5971
    private _id: number;

    // AS3: .../messenger/DummyFriend.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../messenger/DummyFriend.as::_userName
    private _userName: string;

    // AS3: .../messenger/DummyFriend.as::get name()
    get name(): string
    {
        return this._userName;
    }

    // AS3: .../messenger/DummyFriend.as::_SafeStr_5551
    private _figure: string;

    // AS3: .../messenger/DummyFriend.as::get figure()
    get figure(): string
    {
        return this._figure;
    }

    // AS3: .../messenger/DummyFriend.as::get gender()
    get gender(): number
    {
        return 0;
    }

    // AS3: .../messenger/DummyFriend.as::get online()
    get online(): boolean
    {
        return true;
    }

    // AS3: .../messenger/DummyFriend.as::get followingAllowed()
    get followingAllowed(): boolean
    {
        return true;
    }

    // AS3: .../messenger/DummyFriend.as::get realName()
    get realName(): string
    {
        return '';
    }

    // AS3: .../messenger/DummyFriend.as::get persistedMessageUser()
    get persistedMessageUser(): boolean
    {
        return true;
    }

    // AS3: .../messenger/DummyFriend.as::get pocketHabboUser()
    get pocketHabboUser(): boolean
    {
        return false;
    }

    // AS3: .../messenger/DummyFriend.as::get relationshipStatus()
    get relationshipStatus(): number
    {
        return 0;
    }
}
