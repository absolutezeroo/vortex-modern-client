import type {IFriendNotification} from './IFriendNotification';

/**
 * FriendNotification
 *
 * A badge on a friend's slot. `typeCode` doubles as the asset key through
 * `typeCodeToString()`, which is why the codes start at -1: the messenger badge
 * predates the others and kept its slot when the enum was extended.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/data/FriendNotification.as
 */
export class FriendNotification implements IFriendNotification
{
    // AS3: .../data/FriendNotification.as::TYPE_MESSENGER
    static readonly TYPE_MESSENGER: number = -1;

    /**
     * **Name derived**: obfuscated in every tree, but the class's own
     * `typeCodeToString()` maps this code to `"room_event"`.
     */
    // AS3: .../data/FriendNotification.as::TYPE_ROOM_EVENT
    static readonly TYPE_ROOM_EVENT: number = 0;

    /**
     * **Name derived** the same way: `typeCodeToString()` maps this code to
     * `"achievement"`.
     */
    // AS3: .../data/FriendNotification.as::TYPE_ACHIEVEMENT
    static readonly TYPE_ACHIEVEMENT: number = 1;

    // AS3: .../data/FriendNotification.as::TYPE_QUEST
    static readonly TYPE_QUEST: number = 2;

    // AS3: .../data/FriendNotification.as::TYPE_PLAYING_GAME
    static readonly TYPE_PLAYING_GAME: number = 3;

    // AS3: .../data/FriendNotification.as::TYPE_FINISHED_GAME
    static readonly TYPE_FINISHED_GAME: number = 4;

    // AS3: .../data/FriendNotification.as::FriendNotification()
    constructor(typeCode: number, message: string, viewOnce: boolean)
    {
        this._typeCode = typeCode;
        this._message = message;
        this._viewOnce = viewOnce;
    }

    /**
     * AS3 switches on `param1 - -1`, i.e. shifts the code into a zero-based table.
     */
    // AS3: .../data/FriendNotification.as::typeCodeToString()
    static typeCodeToString(typeCode: number): string
    {
        switch(typeCode)
        {
            case FriendNotification.TYPE_MESSENGER:
                return 'instant_message';
            case FriendNotification.TYPE_ROOM_EVENT:
                return 'room_event';
            case FriendNotification.TYPE_ACHIEVEMENT:
                return 'achievement';
            case FriendNotification.TYPE_QUEST:
                return 'quest';
            case FriendNotification.TYPE_PLAYING_GAME:
                return 'playing_game';
            case FriendNotification.TYPE_FINISHED_GAME:
                return 'finished_game';
            default:
                return 'unknown';
        }
    }

    // AS3: .../data/FriendNotification.as::_typeCode
    private _typeCode: number = FriendNotification.TYPE_MESSENGER;

    // AS3: .../data/FriendNotification.as::get typeCode()
    get typeCode(): number
    {
        return this._typeCode;
    }

    // AS3: .../data/FriendNotification.as::set typeCode()
    set typeCode(value: number)
    {
        this._typeCode = value;
    }

    // AS3: .../data/FriendNotification.as::_SafeStr_5626
    private _message: string;

    // AS3: .../data/FriendNotification.as::get message()
    get message(): string
    {
        return this._message;
    }

    // AS3: .../data/FriendNotification.as::set message()
    set message(value: string)
    {
        this._message = value;
    }

    // AS3: .../data/FriendNotification.as::_viewOnce
    private _viewOnce: boolean;

    // AS3: .../data/FriendNotification.as::get viewOnce()
    get viewOnce(): boolean
    {
        return this._viewOnce;
    }

    // AS3: .../data/FriendNotification.as::set viewOnce()
    set viewOnce(value: boolean)
    {
        this._viewOnce = value;
    }
}
