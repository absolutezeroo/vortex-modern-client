import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One row of any snow-war leaderboard: who, how much, and where they placed.
 *
 * The same six fields serve the group boards too — there `userId` is the group id and `figure` its
 * badge code, which is why `LeaderboardTable` tells the two apart by `gender === 'g'` rather than
 * by type.
 *
 * **The name is derived.** `_SafeCls_4320` in the primary tree, `class_3963` in `win63_version`,
 * and PRODUCTION obfuscates its whole `parser/game/score` package — the class is anonymous in every
 * tree. It is named for what it is: one entry of the array `Game2LeaderboardParser` builds.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4040/_SafeCls_4320.as
 */
export class Game2LeaderboardEntryData
{
    // AS3: _SafeCls_4320.as::_SafeStr_5971
    private readonly _userId: number;

    // AS3: _SafeCls_4320.as::_SafeStr_5404
    private readonly _score: number;

    // AS3: _SafeCls_4320.as::_SafeStr_9490
    private readonly _rank: number;

    // AS3: _SafeCls_4320.as::_name
    private readonly _name: string;

    // AS3: _SafeCls_4320.as::_SafeStr_5551
    private readonly _figure: string;

    // AS3: _SafeCls_4320.as::_SafeStr_4645
    private readonly _gender: string;

    // AS3: _SafeCls_4320.as::_SafeCls_4320()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._userId = wrapper.readInt();
        this._score = wrapper.readInt();
        this._rank = wrapper.readInt();
        this._name = wrapper.readString();
        this._figure = wrapper.readString();
        this._gender = wrapper.readString();
    }

    // AS3: _SafeCls_4320.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: _SafeCls_4320.as::get score()
    get score(): number
    {
        return this._score;
    }

    // AS3: _SafeCls_4320.as::get rank()
    get rank(): number
    {
        return this._rank;
    }

    // AS3: _SafeCls_4320.as::get figure()
    get figure(): string
    {
        return this._figure;
    }

    /** `'g'` marks a group row rather than a user one. */
    // AS3: _SafeCls_4320.as::get gender()
    get gender(): string
    {
        return this._gender;
    }

    // AS3: _SafeCls_4320.as::get name()
    get name(): string
    {
        return this._name;
    }
}
