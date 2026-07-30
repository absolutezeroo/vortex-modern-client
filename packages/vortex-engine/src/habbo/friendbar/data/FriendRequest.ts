import type {IFriendRequest} from './IFriendRequest';

/**
 * FriendRequest
 *
 * A pending request as the bar lists it. Immutable: answering one goes through
 * `IHabboFriendBarData`, which drops the entry rather than marking it.
 *
 * Not the same class as `habbo/friendlist/domain/FriendRequest`, which owns a row
 * window and an answered state — the two packages each have their own.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/data/FriendRequest.as
 */
export class FriendRequest implements IFriendRequest
{
    // AS3: .../data/FriendRequest.as::FriendRequest()
    constructor(id: number, name: string, figure: string)
    {
        this._id = id;
        this._name = name;
        this._figure = figure;
    }

    // AS3: .../data/FriendRequest.as::_SafeStr_4872
    private _id: number;

    // AS3: .../data/FriendRequest.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../data/FriendRequest.as::_name
    private _name: string;

    // AS3: .../data/FriendRequest.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../data/FriendRequest.as::_SafeStr_5551
    private _figure: string;

    // AS3: .../data/FriendRequest.as::get figure()
    get figure(): string
    {
        return this._figure;
    }
}
