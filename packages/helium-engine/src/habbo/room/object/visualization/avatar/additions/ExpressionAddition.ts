/**
 * ExpressionAddition
 *
 * Base class for expression-based avatar additions. Provides default
 * no-op implementations of update and animate that subclasses can override.
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/habbo/room/object/visualization/avatar/additions/ExpressionAddition.as
 */
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IExpressionAddition} from './IExpressionAddition';
import type {AvatarVisualization} from '../AvatarVisualization';

export class ExpressionAddition implements IExpressionAddition 
{
    protected _visualization: AvatarVisualization;

    constructor(id: number, type: number, visualization: AvatarVisualization) 
    {
        this._type = type;
        this._id = id;
        this._visualization = visualization;
    }

    protected _id: number;

    get id(): number 
    {
        return this._id;
    }

    private _type: number = -1;

    get type(): number 
    {
        return this._type;
    }

    get disposed(): boolean 
    {
        return this._visualization == null;
    }

    /**
     * Updates the expression addition (no-op in base class).
     *
     * @param sprite - The sprite to update
     * @param scale - The current visualization scale
     */
    update(sprite: IRoomObjectSprite | null, scale: number): void 
    {
        // Override in subclasses
    }

    /**
     * Animates the expression addition (no-op in base class).
     *
     * @param sprite - The sprite to animate
     * @returns Always false in base class
     */
    animate(sprite: IRoomObjectSprite | null): boolean 
    {
        return false;
    }

    /**
     * Disposes of this expression addition and releases references.
     */
    dispose(): void 
    {
        this._visualization = null!;
    }
}
