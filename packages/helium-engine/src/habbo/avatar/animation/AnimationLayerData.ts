import {ActiveActionData} from '../actions/ActiveActionData';
import type {IActionDefinition} from '../actions/IActionDefinition';
import type {IActiveActionData} from '../actions/IActiveActionData';
import type {IAnimationLayerData} from './IAnimationLayerData';

/**
 * Layer data for a single frame of an animation, containing offsets and action info.
 *
 * @see sources/win63_version/habbo/avatar/animation/AnimationLayerData.as
 */
export class AnimationLayerData implements IAnimationLayerData
{
    public static readonly BODYPART: string = 'bodypart';
    public static readonly FX: string = 'fx';

    constructor(data: any, type: string, actionDefinition: IActionDefinition | null)
    {
        this._items = new Map();
        this._id = String(data.id || '');
        this._animationFrame = parseInt(data.frame) || 0;
        this._dx = parseInt(data.dx) || 0;
        this._dy = parseInt(data.dy) || 0;
        this._dz = parseInt(data.dz) || 0;
        this._dd = parseInt(data.dd) || 0;
        this._type = type;
        this._base = String(data.base || '');

        if(data.items)
        {
            for(const item of data.items)
            {
                this._items.set(String(item.id), String(item.base));
            }
        }

        if(actionDefinition)
        {
            this._action = new ActiveActionData(actionDefinition.state, this._base);
            this._action.definition = actionDefinition;
        }
        else
        {
            this._action = null;
        }
    }

    private _id: string;

    public get id(): string
    {
        return this._id;
    }

    private _action: IActiveActionData | null;

    public get action(): IActiveActionData
    {
        return this._action!;
    }

    private _animationFrame: number;

    public get animationFrame(): number
    {
        return this._animationFrame;
    }

    private _dx: number;

    public get dx(): number
    {
        return this._dx;
    }

    private _dy: number;

    public get dy(): number
    {
        return this._dy;
    }

    private _dz: number;

    public get dz(): number
    {
        return this._dz;
    }

    private _dd: number;

    public get dd(): number
    {
        return this._dd;
    }

    private _type: string;

    public get type(): string
    {
        return this._type;
    }

    private _base: string;

    public get base(): string
    {
        return this._base;
    }

    private _items: Map<string, string>;

    public get items(): Map<string, string>
    {
        return this._items;
    }
}
