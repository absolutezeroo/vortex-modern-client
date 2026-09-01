import {MovingObjectLogic} from '../MovingObjectLogic';

/**
 * A snowball in flight, as the room engine sees it.
 *
 * It is `MovingObjectLogic` and nothing else — AS3's body is empty. The trajectory is simulated by
 * `habbo/game/snowwar`, which pushes a new location into the room object every sub-turn; the logic
 * only has to interpolate between the pushes, which is what the base class does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/game/SnowballLogic.as
 */
export class SnowballLogic extends MovingObjectLogic
{
}
