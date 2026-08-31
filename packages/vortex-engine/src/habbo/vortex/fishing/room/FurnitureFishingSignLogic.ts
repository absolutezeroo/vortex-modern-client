import {FurnitureLogic} from '@habbo/room/object/logic/furniture/FurnitureLogic';

/**
 * Room-object logic for the wooden fishing sign.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §1 and §15.
 *
 * The sign is a furni of its own, not part of the spot: Origins draws `s_fish_sign_a_0_1_1_0_0`
 * separately from the water tiles, and a zone is made by the water with or without one. What it
 * does is open the Fish-O-Pedia — §1, "a wooden fish sign in the room opens the skill interface".
 *
 * Like `FurnitureFishingSpotLogic`, `get widget()` is the whole class and it is one of four wirings
 * that must all be present; three of the four fail silently. They are listed there.
 */
export class FurnitureFishingSignLogic extends FurnitureLogic
{
    // TS-only: Vortex-only system. Names the widget a click on this furni opens.
    public override get widget(): string | null
    {
        return 'RWE_FISHING_SIGN';
    }
}
