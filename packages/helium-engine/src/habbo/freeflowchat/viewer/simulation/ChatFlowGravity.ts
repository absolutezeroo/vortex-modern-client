import type {ChatBubbleSimulationEntity} from './ChatBubbleSimulationEntity';

/**
 * ChatFlowGravity
 *
 * Horizontal-only attraction impulse between two bubble entities, based on
 * centerX distance - pulls a newly-inserted bubble toward its speaker's
 * other bubbles during insertBubble()'s placement relaxation, and gently
 * re-centers every bubble pair on each scrollUp() tick.
 *
 * Real class name recovered from the tertiary (PRODUCTION-201601012205-226667486) source tree -
 * it ships there as ChatFlowGravity, obfuscated to `_SafeCls_2911` ("_-oC")
 * in the primary win63_2026_crypted_version tree and to the generic,
 * unrecovered `class_3255` in the secondary win63_version tree (neither
 * retains the real identifier, so per project rules the tertiary tree is
 * used here to avoid inventing a name).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/_SafeCls_2911.as
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowGravity.as
 */
export class ChatFlowGravity 
{
    /** AS3: _SafeCls_2911.as::INPUT_GRAVITY_COEFFICIENT - declared but never referenced symbolically anywhere in the AS3 source; call sites hardcode the literal instead (ported as-is below). */
    static readonly INPUT_GRAVITY_COEFFICIENT = 60;

    /** AS3: _SafeCls_2911.as::INPUT_GRAVITY_USERPOS_MARGIN - same as above, unused symbolically in AS3. */
    static readonly INPUT_GRAVITY_USERPOS_MARGIN = 15;

    /** AS3: _SafeCls_2911.as::INPUT_GRAVITY_MAX_IMPULSE - same as above, unused symbolically in AS3. */
    static readonly INPUT_GRAVITY_MAX_IMPULSE = 40;

    private static readonly MAX_ATTRACTION_RANGE = 380;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/_SafeCls_2911.as::getAttraction()
    getAttraction(a: ChatBubbleSimulationEntity, b: ChatBubbleSimulationEntity, coefficient: number = 1, maxImpulse: number = 100): number 
    {
        const distance = Math.abs(b.centerX - a.centerX);

        if(distance > ChatFlowGravity.MAX_ATTRACTION_RANGE) return 0;
        if(distance < 1) return 0;

        const direction = a.centerX <= b.centerX ? 1 : -1;

        return direction * Math.min(Math.min(distance, coefficient / distance), maxImpulse);
    }
}
