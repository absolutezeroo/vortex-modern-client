import type {IDisposable} from '@core/runtime/IDisposable';
import type {IGameObject} from '../arena/IGameObject';
import type {Direction8} from './Direction8';

/**
 * One square of the pathfinding graph.
 *
 * Note that the node carries the search's *working state* — `parentNode`, `nodeCostFromStart`,
 * `nodeCostToGoal`, `nodeDirection` — rather than the search keeping it in a side map. That is
 * Flash-era practice and it means a node cannot be in two searches at once: the arena's grid is
 * reused between searches and reset each time.
 *
 * `directionIsBlocked()` and `getPathCost()` both take the *moving object*, because whether a
 * square is passable depends on who is asking — a snowball crosses what a player cannot.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/IAStarNode.as
 */
export interface IAStarNode extends IDisposable
{
    // AS3: IAStarNode.as::distanceTo()
    distanceTo(node: IAStarNode): number;

    // AS3: IAStarNode.as::directionTo()
    directionTo(node: IAStarNode): Direction8 | null;

    // AS3: IAStarNode.as::getNodeAt()
    getNodeAt(direction: Direction8): IAStarNode | null;

    // AS3: IAStarNode.as::directionIsBlocked()
    directionIsBlocked(direction: Direction8, mover: IGameObject): boolean;

    // AS3: IAStarNode.as::getPathCost()
    getPathCost(direction: Direction8, mover: IGameObject): number;

    // AS3: IAStarNode.as::get nodeDirection() / set nodeDirection()
    nodeDirection: Direction8 | null;

    // AS3: IAStarNode.as::get parentNode() / set parentNode()
    parentNode: IAStarNode | null;

    // AS3: IAStarNode.as::get nodeCostFromStart() / set nodeCostFromStart()
    nodeCostFromStart: number;

    // AS3: IAStarNode.as::get nodeCostToGoal() / set nodeCostToGoal()
    nodeCostToGoal: number;
}
