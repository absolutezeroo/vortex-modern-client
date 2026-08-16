/**
 * One habbicon the player holds, as the 3728 list carries it: an id and a state.
 *
 * The state is a `HabbiconState` value — 1 claimable, 2 owned, 3 owned-and-favourited are the only
 * three the server stores against a user, which is what `isStoredUserState()` tests.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1920/_SafeCls_1919.as
 */
export class OwnedHabbiconData
{
    // AS3: _SafeCls_1919.as::habbiconId
    habbiconId: number = 0;

    // AS3: _SafeCls_1919.as::habbiconState
    habbiconState: number = 0;
}
