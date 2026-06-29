import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IItemListWindow } from '@core/window/components/IItemListWindow';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import type { IViewCtrl } from '../IViewCtrl';
import { TagRenderer } from '../TagRenderer';
import { Util } from '../Util';

/**
 * Displays popular room tags in a tag cloud layout.
 *
 * @see sources/win63_version/habbo/navigator/mainview/PopularTagsListCtrl.as
 */
export class PopularTagsListCtrl implements IViewCtrl
{
    private _navigator: IHabboTransitionalNavigator;
    private _content: IWindowContainer | null = null;
    private _itemList: IItemListWindow | null = null;
    private _tagRenderer: TagRenderer;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
        this._tagRenderer = new TagRenderer(navigator);
    }

    dispose(): void
    {
        if(this._tagRenderer)
        {
            this._tagRenderer.dispose();
            this._tagRenderer = null!;
        }
    }

    get content(): IWindowContainer | null
    {
        return this._content;
    }

    set content(value: IWindowContainer | null)
    {
        this._content = value;
        this._itemList = value ? value.findChildByName('item_list') as IItemListWindow : null;
    }

    refresh(): void
    {
        if(!this._itemList || !this._content) return;

        this._tagRenderer.useHashTags = true;

        const tags = this._navigator.data.popularTags?.tags ?? [];
        let row = this._itemList.getListItemAt(0) as IWindowContainer | null;

        if(row === null)
        {
            row = this._navigator.getXmlWindow('grs_popular_tag_row') as IWindowContainer;
            this._itemList.addListItem(row);
        }

        Util.hideChildren(row);

        for(let i = 0; i < tags.length; i++)
        {
            this._tagRenderer.refreshTag(row, i, tags[i].tagName);
        }

        Util.layoutChildrenInArea(row, row.width, 18, 3);
        row.height = Util.getLowestPoint(row);

        const noTagsFound = this._content.findChildByName('no_tags_found');

        if(noTagsFound)
        {
            noTagsFound.visible = tags.length < 1;
        }
    }
}
