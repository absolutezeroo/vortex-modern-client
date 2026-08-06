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
    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::_depth
    private _depth: number = 0;

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::_localization
    private _localization: string = '';

    private _pageId: number = -1;

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::_pageName
    private _pageName: string = '';

    private _iconId: number = 0;

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::_children
    private _children: ICatalogNode[] = [];

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::_offerIds
    private _offerIds: number[] = [];

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::_navigator
    private _navigator: ICatalogNavigator | null;

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::_parent
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

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get isOpen()
    get isOpen(): boolean
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get depth()
    get depth(): number
    {
        return this._depth;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get isBranch()
    get isBranch(): boolean
    {
        return this._children.length > 0;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get isLeaf()
    get isLeaf(): boolean
    {
        return this._children.length === 0;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get visible()
    get visible(): boolean
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get localization()
    get localization(): string
    {
        return this._localization;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get pageId()
    get pageId(): number
    {
        return this._pageId;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get pageName()
    get pageName(): string
    {
        return this._pageName;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get children()
    get children(): ICatalogNode[]
    {
        return this._children;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get offerIds()
    get offerIds(): number[]
    {
        return this._offerIds;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get navigator()
    get navigator(): ICatalogNavigator | null
    {
        return this._navigator;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get parent()
    get parent(): ICatalogNode | null
    {
        return this._parent;
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::dispose()
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

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::addChild()
    addChild(child: ICatalogNode): void
    {
        if(child == null) return;

        this._children.push(child);
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::activate()
    activate(): void
    {
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::deactivate()
    deactivate(): void
    {
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::open()
    open(): void
    {
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::close()
    close(): void
    {
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get iconName()
    get iconName(): string
    {
        if(this._iconId < 1) return '';

        return 'icon_' + this._iconId.toString();
    }

    // AS3: sources/win63_version/habbo/catalog/navigation/CatalogNode.as::get offsetV()
    get offsetV(): number
    {
        return 0;
    }
}
