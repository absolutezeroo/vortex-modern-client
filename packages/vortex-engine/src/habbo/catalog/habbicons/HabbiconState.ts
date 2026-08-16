/**
 * The six values the server puts in a habbicon's `state`.
 *
 * **Three of the six names are derived**, and say so below. The dump obfuscates all but `CLAIMABLE`
 * and `REWARD`; `OWNED` is recovered from `HabbiconTabMode`, which spells the same `_SafeStr_10350`
 * out as the literal `"owned"`. For the rest there is nothing to recover from — habbicons postdate
 * every unobfuscated tree — so they are named for what the code does with the number:
 * `HabbiconView.buildEntry()` reads `favorite = state == 3`, `owned = favorite || state == 2`,
 * `claimable = state == 1`, `purchasable = state == 0 && hasPrice`.
 *
 * The controller's `isStoredUserState()` is 1/2/3: those are the only three the server keeps against
 * a player, and a status message carrying anything else means the habbicon is gone.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconState.as
 */
export class HabbiconState
{
    // AS3: HabbiconState.as::_SafeStr_11321 (name derived: not held, and buyable if it has a price)
    static readonly AVAILABLE: number = 0;

    // AS3: HabbiconState.as::CLAIMABLE
    static readonly CLAIMABLE: number = 1;

    // AS3: HabbiconState.as::_SafeStr_10350 (name recovered from HabbiconTabMode's "owned")
    static readonly OWNED: number = 2;

    // AS3: HabbiconState.as::_SafeStr_11219 (name derived: owned *and* marked favourite)
    static readonly FAVOURITED: number = 3;

    /**
	 * Nothing in the ported subsystem reads 4. It is not `isStoredUserState`, so a habbicon arriving
	 * with it is dropped from the owned dictionary like any other unknown value — which is the whole
	 * of its observable behaviour. Named for its position between owned and reward rather than from
	 * any evidence.
	 */
    // AS3: HabbiconState.as::_SafeStr_11383 (name derived: no reader anywhere in the dump)
    static readonly UNAVAILABLE: number = 4;

    // AS3: HabbiconState.as::REWARD
    static readonly REWARD: number = 5;

    /**
	 * 1, 2 and 3 — the states the server persists against a user. Anything else means the player does
	 * not hold this habbicon.
	 */
    // AS3: HabbiconController.as::isStoredUserState()
    static isStoredUserState(state: number): boolean
    {
        return state === HabbiconState.CLAIMABLE
            || state === HabbiconState.OWNED
            || state === HabbiconState.FAVOURITED;
    }

    /**
	 * Claimable → owned is the one transition that means "the player just got this", and it is what
	 * raises the notification. Owned → favourited must not.
	 */
    // AS3: HabbiconController.as::isClaimedRewardTransition()
    static isClaimedRewardTransition(previous: number, next: number): boolean
    {
        return previous === HabbiconState.CLAIMABLE
            && (next === HabbiconState.OWNED || next === HabbiconState.FAVOURITED);
    }
}
