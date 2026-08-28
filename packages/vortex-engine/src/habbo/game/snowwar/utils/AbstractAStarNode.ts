import type {IGameObject} from '../arena/IGameObject';
import type {Direction8} from './Direction8';
import type {IAStarNode} from './IAStarNode';

/**
 * The state half of an A* node, with the graph half stubbed.
 *
 * Every geometry method here answers a null result on purpose — 0 distance, no direction, no
 * neighbour, never blocked, no cost. The subclass that knows the arena supplies all five; this
 * class exists to hold the four search fields and `compareTo()` so a node type does not have to
 * reimplement them.
 *
 * **`_referenceNumber` is declared and never touched** — not here, not by any other class in the
 * AS3 tree, and `dispose()` leaves it alone where it clears everything else. Transcribed with it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/AbstractAStarNode.as
 */
export class AbstractAStarNode implements IAStarNode
{
    // AS3: AbstractAStarNode.as::_referenceNumber
    private _referenceNumber: number = -1;

    // AS3: AbstractAStarNode.as::_nodeDirection8
    private _nodeDirection8: Direction8 | null = null;

    // AS3: AbstractAStarNode.as::_parentNode
    private _parentNode: IAStarNode | null = null;

    /** Derived name — `_SafeStr_7434`: A-star's `h`, the heuristic estimate to the goal. */
    // AS3: AbstractAStarNode.as::_SafeStr_7434
    private _nodeCostToGoal: number = 0;

    /** Derived name — `_SafeStr_7385`: A-star's `g`, the cost already paid to reach this node. */
    // AS3: AbstractAStarNode.as::_SafeStr_7385
    private _nodeCostFromStart: number = 0;

    /** Derived name — `_SafeStr_5769`. */
    // AS3: AbstractAStarNode.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: AbstractAStarNode.as::get nodeDirection()
    public get nodeDirection(): Direction8 | null
    {
        return this._nodeDirection8;
    }

    // AS3: AbstractAStarNode.as::set nodeDirection()
    public set nodeDirection(value: Direction8 | null)
    {
        this._nodeDirection8 = value;
    }

    // AS3: AbstractAStarNode.as::get parentNode()
    public get parentNode(): IAStarNode | null
    {
        return this._parentNode;
    }

    // AS3: AbstractAStarNode.as::set parentNode()
    public set parentNode(value: IAStarNode | null)
    {
        this._parentNode = value;
    }

    // AS3: AbstractAStarNode.as::get nodeCostToGoal()
    public get nodeCostToGoal(): number
    {
        return this._nodeCostToGoal;
    }

    // AS3: AbstractAStarNode.as::set nodeCostToGoal()
    public set nodeCostToGoal(value: number)
    {
        this._nodeCostToGoal = value;
    }

    // AS3: AbstractAStarNode.as::get nodeCostFromStart()
    public get nodeCostFromStart(): number
    {
        return this._nodeCostFromStart;
    }

    // AS3: AbstractAStarNode.as::set nodeCostFromStart()
    public set nodeCostFromStart(value: number)
    {
        this._nodeCostFromStart = value;
    }

    /** A-star's `f = g + h`, as a three-way comparison for the open list's ordering. */
    // AS3: AbstractAStarNode.as::compareTo()
    public compareTo(other: AbstractAStarNode): number
    {
        const mine = this._nodeCostFromStart + this._nodeCostToGoal;
        const theirs = other._nodeCostFromStart + other._nodeCostToGoal;

        if(mine < theirs) return -1;
        if(mine > theirs) return 1;

        return 0;
    }

    // AS3: AbstractAStarNode.as::distanceTo()
    public distanceTo(_node: IAStarNode): number
    {
        return 0;
    }

    // AS3: AbstractAStarNode.as::directionTo()
    public directionTo(_node: IAStarNode): Direction8 | null
    {
        return null;
    }

    // AS3: AbstractAStarNode.as::getNodeAt()
    public getNodeAt(_direction: Direction8): IAStarNode | null
    {
        return null;
    }

    // AS3: AbstractAStarNode.as::directionIsBlocked()
    public directionIsBlocked(_direction: Direction8, _mover: IGameObject): boolean
    {
        return false;
    }

    // AS3: AbstractAStarNode.as::getPathCost()
    public getPathCost(_direction: Direction8, _mover: IGameObject): number
    {
        return 0;
    }

    /** `_referenceNumber` is deliberately not cleared here — AS3 leaves it alone too. */
    // AS3: AbstractAStarNode.as::dispose()
    public dispose(): void
    {
        this._nodeDirection8 = null;
        this._parentNode = null;
        this._nodeCostToGoal = 0;
        this._nodeCostFromStart = 0;
        this._disposed = true;
    }

    // AS3: AbstractAStarNode.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }
}
