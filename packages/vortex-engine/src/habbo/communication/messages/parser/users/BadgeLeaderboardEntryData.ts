import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One row of the badge leaderboard.
 *
 * **The name is DERIVED.** No tree names this class and the emulator has no header for either of
 * the two leaderboard messages, so there is nothing to corroborate against — it is named for the
 * five members it exposes, which are unobfuscated in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3225.as
 */
export class BadgeLeaderboardEntryData
{
    // AS3: _SafeCls_3225.as::get userId()
    public readonly userId: number;

    // AS3: _SafeCls_3225.as::get userName()
    public readonly userName: string;

    // AS3: _SafeCls_3225.as::get figureString()
    public readonly figureString: string;

    // AS3: _SafeCls_3225.as::get rank()
    public readonly rank: number;

    // AS3: _SafeCls_3225.as::get score()
    public readonly score: number;

    // AS3: _SafeCls_3225.as::_SafeCls_3225()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.userId = wrapper.readInt();
        this.userName = wrapper.readString();
        this.figureString = wrapper.readString();
        this.rank = wrapper.readInt();
        this.score = wrapper.readInt();
    }
}
