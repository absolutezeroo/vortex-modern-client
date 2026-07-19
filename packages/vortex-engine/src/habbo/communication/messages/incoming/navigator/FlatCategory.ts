import type {IMessageDataWrapper} from '@core/communication';

/**
 * Room category (flat category)
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1735
 */
export class FlatCategory
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._nodeId = wrapper.readInt();
        this._nodeName = wrapper.readString();
        this._visible = wrapper.readBoolean();
        this._automatic = wrapper.readBoolean();
        this._automaticCategoryKey = wrapper.readString();
        this._globalCategoryKey = wrapper.readString();
        this._staffOnly = wrapper.readBoolean();
    }

    private _nodeId: number = 0;

    get nodeId(): number
    {
        return this._nodeId;
    }

    private _nodeName: string = '';

    get nodeName(): string
    {
        return this._nodeName;
    }

    private _visible: boolean = false;

    get visible(): boolean
    {
        return this._visible;
    }

    private _automatic: boolean = false;

    get automatic(): boolean
    {
        return this._automatic;
    }

    private _automaticCategoryKey: string = '';

    get automaticCategoryKey(): string
    {
        return this._automaticCategoryKey;
    }

    private _globalCategoryKey: string = '';

    get globalCategoryKey(): string
    {
        return this._globalCategoryKey;
    }

    private _staffOnly: boolean = false;

    get staffOnly(): boolean
    {
        return this._staffOnly;
    }

    get visibleName(): string
    {
        return this._globalCategoryKey === ''
            ? this._nodeName
            : '${navigator.flatcategory.global.' + this._globalCategoryKey + '}';
    }
}
