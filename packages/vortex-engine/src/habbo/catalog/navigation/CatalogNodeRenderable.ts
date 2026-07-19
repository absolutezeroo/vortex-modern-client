import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {NodeData} from '../../communication/messages/incoming/catalog/NodeData';
import type {ICatalogNavigator} from './ICatalogNavigator';
import type {ICatalogNode} from './ICatalogNode';
import {CatalogNode} from './CatalogNode';

/**
 * A rendering catalog tree node (visible category, per `NodeData.visible === true`).
 *
 * @see sources/win63_version/habbo/catalog/navigation/CatalogNodeRenderable.as
 */
export class CatalogNodeRenderable extends CatalogNode
{
    private _window: IWindowContainer | null = null;

    private _childList: IItemListWindow | null = null;

    private _isOpen: boolean = false;

    private _active: boolean = false;

    private _itemNormalColor: number = 0;

    private _itemSelectedEtchingColor: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/navigation/CatalogNodeRenderable.as::_renderDepth
    private _renderDepth: number = -1;

    constructor(navigator: ICatalogNavigator, data: NodeData, depth: number, parent: ICatalogNode | null)
    {
        super(navigator, data, depth, parent);
    }

    get window(): IWindowContainer | null
    {
        return this._window;
    }

    override get isOpen(): boolean
    {
        return this._isOpen;
    }

    override get visible(): boolean
    {
        return true;
    }

    override dispose(): void
    {
        if(this._isOpen)
        {
            this.close();
            this.deactivate();
        }

        this._window = null;
        this._childList = null;
        super.dispose();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/navigation/CatalogNodeRenderable.as::addToList()
    // AS3's 2nd parameter (`param2:Boolean = true`) is never read anywhere in its body - kept here,
    // unused, for signature fidelity only.
    addToList(list: IItemListWindow, _activate: boolean = true): void
    {
        if(this._window == null || this._renderDepth !== this.depth)
        {
            this.createWindow(this.depth);
            this.setInactiveLook();
        }

        list.addListItem(this._window!);

        if(this.isBranch)
        {
            if(this._childList == null)
            {
                this.createChildList();
            }

            list.addListItem(this._childList!);
            this.refreshChildren();
        }

        list.arrangeListItems();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/navigation/CatalogNodeRenderable.as::addSearchResultToList()
    addSearchResultToList(list: IItemListWindow, depth: number): void
    {
        if(this._window == null || this._renderDepth !== depth)
        {
            this.createWindow(depth);
            this.setInactiveLook();
        }

        list.addListItem(this._window!);
        list.arrangeListItems();
    }

    removeFromList(list: IItemListWindow): void
    {
        list.removeListItem(this._window!);

        if(this.isBranch)
        {
            list.removeListItem(this._childList!);
        }
    }

    override activate(): void
    {
        this.setActiveLook();
        this._active = true;
    }

    override deactivate(): void
    {
        this.setInactiveLook();
        this._active = false;
    }

    override open(): void
    {
        this.showChildren();
        this._isOpen = true;
    }

    override close(): void
    {
        this.removeChildren();
        this._isOpen = false;
    }

    private refreshChildren(): void
    {
        if(this._childList == null) return;

        for(const child of this.children)
        {
            const renderable = child as CatalogNodeRenderable;

            if(renderable)
            {
                if(renderable.visible)
                {
                    renderable.addToList(this._childList);
                    renderable.setInactiveLook();
                }
                else
                {
                    renderable.removeFromList(this._childList);
                }
            }
        }

        this._childList.arrangeListItems();
    }

    private showChildren(): void
    {
        if(this._childList == null)
        {
            this.createChildList();
        }

        for(const child of this.children)
        {
            if(child.visible)
            {
                (child as CatalogNodeRenderable).addToList(this._childList!);
            }
        }

        if(this._childList != null)
        {
            this._childList.visible = true;

            let visibleCount = 0;

            for(let i = 0; i < this._childList.numListItems; i++)
            {
                if(this._childList.getListItemAt(i)!.visible)
                {
                    visibleCount++;
                }
            }

            this._childList.height = visibleCount * 21;
        }
    }

    private removeChildren(): void
    {
        for(const child of this.children)
        {
            if(child.visible)
            {
                (child as CatalogNodeRenderable).removeFromList(this._childList!);
            }
        }

        if(this._childList != null)
        {
            this._childList.height = 0;
            this._childList.visible = false;
            this._childList.x = 0;
        }
    }

    private createChildList(): void
    {
        this._childList = this.navigator!.listTemplate.clone() as IItemListWindow;
        this.removeChildren();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/navigation/CatalogNodeRenderable.as::createWindow()
    private createWindow(depth: number): void
    {
        if(this._window != null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._renderDepth = depth;
        this._window = this.navigator!.getItemTemplate(depth).clone() as IWindowContainer;

        const title = this._window.findChildByTag('ITEM_TITLE') as ITextWindow | null;
        const downButton = this._window.findChildByTag('DOWNBTN');

        if(title != null)
        {
            title.caption = this.localization;
            this._itemNormalColor = title.textColor;
            this._itemSelectedEtchingColor = title.etchingColor;
        }

        const selectionHighlight = this._window.findChildByTag('SELECTION_HILIGHT');

        if(selectionHighlight)
        {
            selectionHighlight.visible = false;
        }

        if(downButton != null)
        {
            downButton.visible = !this.isLeaf;
        }

        (this._window.findChildByName('icon') as IStaticBitmapWrapperWindow).assetUri =
            this.navigator!.catalog.imageGalleryHost + this.iconName + '.png';

        if(this.navigator!.isDeepHierarchy)
        {
            if(depth === 1)
            {
                this._window.findChildByName('icon')!.visible = false;
                this._window.findChildByTag('ITEM_TITLE')!.x = 0;
            }

            if(depth > 3)
            {
                this._window.findChildByName('icon')!.visible = true;
                this._window.findChildByName('icon')!.x = 15 + 6 * (depth - 3);
                this._window.findChildByTag('ITEM_TITLE')!.x = 42 + 6 * (depth - 3);
            }
        }

        this._window.addEventListener('WME_CLICK', this.onButtonClicked.bind(this));
        this._window.addEventListener('WME_OVER', this.onOver.bind(this));
        this._window.addEventListener('WME_OUT', this.onOut.bind(this));

        if(downButton != null)
        {
            downButton.addEventListener('WME_CLICK', this.onButtonClicked.bind(this));
        }
    }

    private onOut(_event: WindowMouseEvent): void
    {
        if(!this._active)
        {
            this.setInactiveLook();
        }
    }

    private onOver(_event: WindowMouseEvent): void
    {
        if(!this._active)
        {
            this.setActiveLook();
        }
    }

    private setInactiveLook(): void
    {
        if(this._window != null)
        {
            const selectionColor = this._window.findChildByTag('SELECTION_COLOR') as ITextWindow | null;

            if(selectionColor != null)
            {
                selectionColor.textColor = this._itemNormalColor;
                selectionColor.etchingColor = 0;
            }

            const highlight = this._window.findChildByTag('SELECTION_HILIGHT');

            if(highlight != null)
            {
                highlight.visible = false;
            }
        }
    }

    private setActiveLook(): void
    {
        if(this._window != null)
        {
            const selectionColor = this._window.findChildByTag('SELECTION_COLOR') as ITextWindow | null;

            if(selectionColor != null)
            {
                selectionColor.textColor = 0xFFFFFFFF;
                selectionColor.etchingColor = this._itemSelectedEtchingColor;
            }

            const highlight = this._window.findChildByTag('SELECTION_HILIGHT') as IWindowContainer | null;

            if(highlight != null)
            {
                highlight.visible = true;
            }
        }
    }

    private onButtonClicked(_event: WindowMouseEvent): void
    {
        this.navigator!.activateNode(this);
    }

    updateChildListHeight(): void
    {
        if(this._childList == null) return;

        this._childList.height = 0;

        for(let i = 0; i < this._childList.numListItems; i++)
        {
            if(this._childList.getListItemAt(i)!.visible)
            {
                this._childList.height = this._childList.height + this._childList.getListItemAt(i)!.height;
            }
        }

        const parentRenderable = this.parent as CatalogNodeRenderable;

        if(parentRenderable)
        {
            parentRenderable.updateChildListHeight();
        }
    }

    override get offsetV(): number
    {
        return this._window!.y + 21;
    }
}
