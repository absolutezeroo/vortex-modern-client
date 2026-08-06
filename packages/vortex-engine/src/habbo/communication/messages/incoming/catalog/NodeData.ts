import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A single node in the catalog category tree (self-parses recursively).
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as
 */
export class NodeData
{
    private _visible: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::get visible()
    get visible(): boolean
    {
        return this._visible;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::_icon
    private _icon: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::get icon()
    get icon(): number
    {
        return this._icon;
    }

    private _pageId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::get pageId()
    get pageId(): number
    {
        return this._pageId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::_pageName
    private _pageName: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::get pageName()
    get pageName(): string
    {
        return this._pageName;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::_localization
    private _localization: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::get localization()
    get localization(): string
    {
        return this._localization;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::_children
    private _children: NodeData[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::get children()
    get children(): NodeData[]
    {
        return this._children;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::_offerIds
    private _offerIds: number[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2971.as::get offerIds()
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
