import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A single node in the catalog category tree (self-parses recursively).
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as
 */
export class NodeData
{
    private _visible: boolean = false;

    get visible(): boolean
    {
        return this._visible;
    }

    private _icon: number = 0;

    get icon(): number
    {
        return this._icon;
    }

    private _pageId: number = 0;

    get pageId(): number
    {
        return this._pageId;
    }

    private _pageName: string = '';

    get pageName(): string
    {
        return this._pageName;
    }

    private _localization: string = '';

    get localization(): string
    {
        return this._localization;
    }

    private _children: NodeData[] = [];

    get children(): NodeData[]
    {
        return this._children;
    }

    private _offerIds: number[] = [];

    get offerIds(): number[]
    {
        return this._offerIds;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._visible = wrapper.readBoolean();
        this._icon = wrapper.readInt();
        this._pageId = wrapper.readInt();
        this._pageName = wrapper.readString();
        this._localization = wrapper.readString();

        this._offerIds = [];

        const offerIdCount = wrapper.readInt();

        for(let i = 0; i < offerIdCount; i++)
        {
            this._offerIds.push(wrapper.readInt());
        }

        this._children = [];

        const childCount = wrapper.readInt();

        for(let i = 0; i < childCount; i++)
        {
            this._children.push(new NodeData(wrapper));
        }
    }
}
