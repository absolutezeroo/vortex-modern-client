import {ObjectLogicBase} from '@room/object/logic/ObjectLogicBase';

/**
 * The splash a snowball leaves where it landed. Empty in AS3 too — the object never moves and never
 * changes state; it exists for half a second and `GameArenaView` disposes it.
 *
 * **The name is derived.** `_SafeCls_2258` in the primary tree, `class_1882` in `win63_version`.
 * The 2016 tree has it as `GameSnowsplashLogic`, but that tree also calls the snowball
 * `GameSnowballLogic` where this build calls it plainly `SnowballLogic` — the `Game` prefix was
 * dropped between the two. The name follows this build's own convention and its sibling
 * visualization, `SnowSplashVisualization`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/game/_SafeCls_2258.as
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/logic/game/GameSnowsplashLogic.as
 */
export class SnowSplashLogic extends ObjectLogicBase
{
}
