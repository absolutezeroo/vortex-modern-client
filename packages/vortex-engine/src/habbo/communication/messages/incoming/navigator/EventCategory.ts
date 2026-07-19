import type {IMessageDataWrapper} from '@core/communication';

/**
 * Event category
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1656
 */
export class EventCategory
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._categoryId = wrapper.readInt();
        this._categoryName = wrapper.readString();
        this._visible = wrapper.readBoolean();
    }

    private _categoryId: number = 0;

    get categoryId(): number
    {
        return this._categoryId;
    }

    private _categoryName: string = '';

    get categoryName(): string
    {
        return this._categoryName;
    }

    private _visible: boolean = false;

    get visible(): boolean
    {
        return this._visible;
    }
}
