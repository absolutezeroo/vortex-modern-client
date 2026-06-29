import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IItemListWindow } from '@core/window/components/IItemListWindow';
import type { IScrollbarWindow } from '@core/window/components/IScrollbarWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { IWindow } from '@core/window/IWindow';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import type { IViewCtrl } from '../IViewCtrl';
import { UserCountRenderer } from '../UserCountRenderer';
import { Util } from '../Util';

/**
 * Displays a list of flat categories with user-count badges.
 *
 * @see sources/win63_version/habbo/navigator/mainview/CategoryListCtrl.as
 */
export class CategoryListCtrl implements IViewCtrl
{
    private static readonly CATEGORY_SPACING = 5;

    private _navigator: IHabboTransitionalNavigator;
    private _content: IWindowContainer | null = null;
    private _itemList: IItemListWindow | null = null;
    private _scrollbar: IScrollbarWindow | null = null;
    private _userCountRenderer: UserCountRenderer;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
        this._userCountRenderer = new UserCountRenderer(navigator);
    }

    dispose(): void
    {
        if(this._userCountRenderer)
        {
            this._userCountRenderer.dispose();
            this._userCountRenderer = null!;
        }
    }

    get content(): IWindowContainer | null
    {
        return this._content;
    }

    set content(value: IWindowContainer | null)
    {
        this._content = value;
        this._itemList = value ? value.findChildByName('item_list_category') as IItemListWindow : null;
        this._scrollbar = value ? value.findChildByName('scroller') as IScrollbarWindow : null;
    }

    refresh(): void
    {
        if(!this._itemList) return;

        const categories = this._navigator.data.allCategories;
        const visitorData = this._navigator.data.categoriesWithVisitorData;
        const rowContainer = this._itemList.getListItemAt(0) as IWindowContainer | null;

        if(!rowContainer) return;

        let y = 0;

        for(let i = 0; i < categories.length; i++)
        {
            const cat = categories[i];

            if(!cat.visible) continue;

            let entry = this.getCategoryContainer(rowContainer, i);

            if(entry === null)
            {
                entry = this.createEntry(i);
                entry.id = i;
                rowContainer.addChild(entry);
            }

            const currentCount = visitorData?.categoryToCurrentUserCountMap?.get(cat.nodeId) ?? 0;
            const maxCount = visitorData?.categoryToMaxUserCountMap?.get(cat.nodeId) ?? 0;

            this.refreshEntry(entry, cat, currentCount, maxCount);
            entry.y = y;
            y += entry.height + CategoryListCtrl.CATEGORY_SPACING;
            entry.visible = true;
        }

        rowContainer.height = Util.getLowestPoint(rowContainer) > 0
            ? Util.getLowestPoint(rowContainer) + CategoryListCtrl.CATEGORY_SPACING
            : 0;

        if(this._scrollbar !== null)
        {
            this._scrollbar.scrollV = 0;
            this._scrollbar.visible = true;
        }
    }

    refreshEntry(container: IWindowContainer, cat: { nodeName: string; nodeId: number }, _currentCount: number, _maxCount: number): void
    {
        const nameText = container.findChildByName('category_name_txt');

        if(nameText) nameText.caption = cat.nodeName;

        const arrowRight = container.findChildByName('arrow_right_icon');

        if(arrowRight) arrowRight.visible = true;

        const enterButton = container.findChildByName('enter_category_button') as IWindowContainer | null;

        if(enterButton)
        {
            this._userCountRenderer.refreshUserCount(
                _maxCount,
                enterButton,
                _currentCount,
                '${navigator.usercounttooltip.users}',
                297,
                35
            );
        }
    }

    createEntry(index: number): IWindowContainer
    {
        const entry = this._navigator.getXmlWindow('grs_category_selector') as IWindowContainer;

        this.setProcedureAndId(entry, index, 'enter_category_button', this.onSelectCategory);
        this._navigator.refreshButton(entry, 'navi_room_icon', true, null!, 0);

        return entry;
    }

    private onSelectCategory = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const cat = this._navigator.data.allCategories[window.id];

        if(cat)
        {
            this._navigator.mainViewCtrl?.startSearch(2, 1, '' + cat.nodeId);
        }
    };

    private getCategoryContainer(parent: IWindowContainer, id: number): IWindowContainer | null
    {
        return parent.getChildByID(id) as IWindowContainer | null;
    }

    private setProcedureAndId(
        container: IWindowContainer,
        id: number,
        childName: string,
        procedure: (event: WindowEvent, window: IWindow) => void
    ): void
    {
        const child = container.findChildByName(childName);

        if(child)
        {
            child.procedure = procedure;
            child.id = id;
        }
    }
}
