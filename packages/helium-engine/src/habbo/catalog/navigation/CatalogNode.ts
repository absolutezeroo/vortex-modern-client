import type {NodeData} from '../../communication/messages/incoming/catalog/NodeData';
import type {ICatalogNavigator} from './ICatalogNavigator';
import type {ICatalogNode} from './ICatalogNode';

/**
 * A non-rendering catalog tree node (invisible category, per `NodeData.visible === false`).
 *
 * @see sources/win63_version/habbo/catalog/navigation/CatalogNode.as
 */
export class CatalogNode implements ICatalogNode
{
    private _depth: number = 0;

    private _localization: string = '';

    private _pageId: number = -1;

    private _pageName: string = '';

    private _iconId: number = 0;

    private _children: ICatalogNode[] = [];

    private _offerIds: number[] = [];

    private _navigator: ICatalogNavigator | null;

    private _parent: ICatalogNode | null;

    constructor(navigator: ICatalogNavigator, data: NodeData, depth: number, parent: ICatalogNode | null)
    {
        this._depth = depth;
        this._parent = parent;
        this._navigator = navigator;
        this._localization = data.localization;
        this._pageId = data.pageId;
        this._pageName = data.pageName;
        this._iconId = data.icon;
        this._children = [];
        this._offerIds = data.offerIds;
    }

    get isOpen(): boolean
    {
        return false;
    }

    get depth(): number
    {
        return this._depth;
    }

    get isBranch(): boolean
    {
        return this._children.length > 0;
    }

    get isLeaf(): boolean
    {
        return this._children.length === 0;
    }

    get visible(): boolean
    {
        return false;
    }

    get localization(): string
    {
        return this._localization;
    }

    get pageId(): number
    {
        return this._pageId;
    }

    get pageName(): string
    {
        return this._pageName;
    }

    get children(): ICatalogNode[]
    {
        return this._children;
    }

    get offerIds(): number[]
    {
        return this._offerIds;
    }

    get navigator(): ICatalogNavigator | null
    {
        return this._navigator;
    }

    get parent(): ICatalogNode | null
    {
        return this._parent;
    }

    dispose(): void
    {
        for(const child of this._children)
        {
            child.dispose();
        }

        this._children = [];
        this._offerIds = [];
        this._navigator = null;
        this._parent = null;
        this._pageName = '';
        this._localization = '';
    }

    addChild(child: ICatalogNode): void
    {
        if(child == null) return;

        this._children.push(child);
    }

    activate(): void
    {
    }

    deactivate(): void
    {
    }

    open(): void
    {
    }

    close(): void
    {
    }

    get iconName(): string
    {
        if(this._iconId < 1) return '';

        return 'icon_' + this._iconId.toString();
    }

    get offsetV(): number
    {
        return 0;
    }
}
