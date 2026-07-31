import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {FriendListTabEnum} from './FriendListTabEnum';
import type {FriendListTab} from './domain/FriendListTab';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.FriendListTabsView');

/**
 * FriendListTabsView
 *
 * The accordion inside the friend list window: three stacked tab headers, at most one
 * of them expanded, each laid out immediately below the last.
 *
 * A tab's content is built lazily on first expansion and then kept — collapsing only
 * detaches it from the display list, so scroll position and rows survive a
 * collapse/expand cycle.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/FriendListTabsView.as
 */
export class FriendListTabsView
{
    // AS3: .../FriendListTabsView.as::FriendListTabsView()
    constructor(friendList: HabboFriendList)
    {
        this._friendList = friendList;
    }

    // AS3: .../FriendListTabsView.as::_friendList
    private _friendList: HabboFriendList;

    // AS3: .../FriendListTabsView.as::_content
    private _content: IWindowContainer | null = null;

    // AS3: .../FriendListTabsView.as::prepare()
    prepare(content: IWindowContainer): void
    {
        this._content = content;
        this.refresh('prepare');
    }

    /**
     * Relays out the whole accordion. Every tab is measured from its header height
     * plus, if it is the open one, the shared tab content height; the running `y`
     * starts at 1 so the top border shows.
     */
    // AS3: .../FriendListTabsView.as::refresh()
    refresh(reason: string): void
    {
        logger.trace(`TABS: REFRESH: ${reason}`);

        const tabs = this._friendList.tabs;

        if(this._content === null || tabs === null)
        {
            return;
        }

        this._content.width = tabs.tabContentWidth;

        const background = this._content.findChildByName('bg');

        if(background !== null)
        {
            background.width = tabs.tabContentWidth;
        }

        let y = 1;

        for(const tab of tabs.getTabs())
        {
            const tabWindow = this._content.getChildByName(`flt_${tab.id}`) as IWindowContainer | null;

            if(tabWindow === null)
            {
                continue;
            }

            if(!this.isTabVisible(tab.id))
            {
                tabWindow.visible = false;
            }
            else
            {
                tabWindow.visible = true;
                tabWindow.width = tabs.tabContentWidth;
                tabWindow.y = y;

                const headerHeight = this.refreshHeader(tab, tabWindow);

                this.refreshTabContent(tab, tabWindow);

                tabWindow.height = headerHeight + (tab.selected ? tabs.tabContentHeight : 0);
                y += tabWindow.height;
            }
        }

        this._content.height = y + 1;

        if(background !== null)
        {
            background.height = this._content.height;
        }

        logger.trace('TABS: REFRESH END');
    }

    /** The requests tab only exists while there is at least one request. */
    // AS3: .../FriendListTabsView.as::isTabVisible()
    private isTabVisible(tabId: number): boolean
    {
        if(tabId !== FriendListTabEnum.TABID_FRIEND_REQUESTS)
        {
            return true;
        }

        return (this._friendList.friendRequests?.requests.length ?? 0) > 0;
    }

    // AS3: .../FriendListTabsView.as::refreshTabContent()
    private refreshTabContent(tab: FriendListTab, tabWindow: IWindowContainer): void
    {
        if(tab.selected)
        {
            if(tab.view === null)
            {
                tab.view = this.getTabContent(tab);
            }

            if(tab.view !== null)
            {
                this.refreshTabContentDims(tab.view);
                this.refreshScrollBarVisibility(tab.view);
                tabWindow.addChild(tab.view);
            }
        }
        else if(tab.view !== null)
        {
            tabWindow.removeChild(tab.view);
        }
    }

    /**
     * Paints the header strip and returns its height. The unread state swaps the
     * background image for the highlight one, and the arrow icon is picked from four
     * variants — open/closed against black/white — because only the friends tab in its
     * normal state sits on a light background.
     */
    // AS3: .../FriendListTabsView.as::refreshHeader()
    private refreshHeader(tab: FriendListTab, tabWindow: IWindowContainer): number
    {
        const header = tabWindow.getChildByName('header') as IWindowContainer | null;

        if(header === null)
        {
            return 0;
        }

        const tabs = this._friendList.tabs;

        if(tabs !== null)
        {
            header.width = tabs.tabContentWidth;
        }

        this.showBgImage(header, tab.newMessageArrived, 'hdr_hilite');
        this.showBgImage(header, !tab.newMessageArrived, tab.headerPicName);

        const onLightBackground = tab.id === FriendListTabEnum.TABID_FRIENDS && !tab.newMessageArrived;

        logger.trace(`TAB ${tab.id}, ${tab.name}, ${onLightBackground}`);

        this.refreshArrowIcon(header, 'arrow_down_black', tab.selected && onLightBackground, 12);
        this.refreshArrowIcon(header, 'arrow_right_black', !tab.selected && onLightBackground, 15);
        this.refreshArrowIcon(header, 'arrow_down_white', tab.selected && !onLightBackground, 12);
        this.refreshArrowIcon(header, 'arrow_right_white', !tab.selected && !onLightBackground, 15);

        this.refreshTabText(tab, header);

        return header.height;
    }

    /**
     * Loads the header background on first show — and takes the header's height from
     * the bitmap, which is why the image has to be resolved before the accordion can
     * measure anything.
     */
    // AS3: .../FriendListTabsView.as::showBgImage()
    private showBgImage(header: IWindowContainer, show: boolean, imageName: string): void
    {
        logger.trace(`REFRESHING BG IMAGE: ${show}, ${imageName}`);

        const image = header.getChildByName(imageName) as IBitmapWrapperWindow | null;

        if(!show)
        {
            if(image !== null)
            {
                image.visible = false;
            }

            return;
        }

        if(image === null)
        {
            return;
        }

        if(image.bitmap === null)
        {
            image.bitmap = this._friendList.getButtonImage(imageName);

            if(image.bitmap !== null)
            {
                image.height = image.bitmap.height;
                header.height = image.bitmap.height;
            }

            image.procedure = this.onTabClick;
        }

        const tabs = this._friendList.tabs;

        if(tabs !== null)
        {
            image.width = tabs.tabContentWidth;
        }

        image.visible = true;
    }

    /** Parks the arrow just past the end of the caption, hence the text measurement. */
    // AS3: .../FriendListTabsView.as::refreshArrowIcon()
    private refreshArrowIcon(header: IWindowContainer, iconName: string, visible: boolean, offset: number): void
    {
        this._friendList.refreshButton(header, iconName, visible, null, 0);

        if(!visible)
        {
            return;
        }

        const caption = header.findChildByName('caption_text') as ITextWindow | null;
        const icon = header.findChildByName(iconName);

        if(caption !== null && icon !== null)
        {
            icon.x = caption.textWidth + offset;
        }
    }

    // AS3: .../FriendListTabsView.as::refreshTabText()
    private refreshTabText(tab: FriendListTab, header: IWindowContainer): void
    {
        const caption = header.findChildByName('caption_text') as ITextWindow | null;

        if(caption === null)
        {
            return;
        }

        caption.text = `${tab.name} (${tab.tabView.getEntryCount()})`;
        caption.textColor = this._friendList.laf.getTabTextColor(tab.newMessageArrived, tab.id);
    }

    /**
     * Every tab is told a tab was clicked — not just the one that was — so a tab can
     * drop state it only holds while it is open (the search tab clears its query this
     * way). Only then is the accordion toggled.
     */
    // AS3: .../FriendListTabsView.as::onTabClick()
    private onTabClick = (event: WindowEvent, window: IWindow): void =>
    {
        this._friendList.view?.showInfo(event, `\${friendlist.tip.tab.${window.id}}`);

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug('TAB CLICKED!');

        const tabs = this._friendList.tabs;

        if(tabs === null)
        {
            return;
        }

        const clicked = tabs.findTab(window.id);

        if(clicked === null)
        {
            return;
        }

        for(const tab of tabs.getTabs())
        {
            tab.tabView.tabClicked(clicked.id);
        }

        tabs.toggleSelected(clicked);
        this._friendList.view?.refresh('tabClick');

        if(clicked.selected)
        {
            switch(clicked.id)
            {
                case FriendListTabEnum.TABID_FRIENDS:
                    this._friendList.trackFriendListEvent('HABBO_FRIENDLIST_TRACKING_EVENT_FRIENDS');
                    break;
                case FriendListTabEnum.TABID_FRIEND_REQUESTS:
                    this._friendList.trackFriendListEvent('HABBO_FRIENDLIST_TRACKING_EVENT_REQUEST');
                    break;
                case FriendListTabEnum.TABID_SEARCH:
                    this._friendList.trackFriendListEvent('HABBO_FRIENDLIST_TRACKING_EVENT_SEARCH');
                    break;
            }
        }
        else
        {
            this._friendList.trackFriendListEvent('HABBO_FRIENDLIST_TRACKING_EVENT_MINIMZED');
        }
    };

    // AS3: .../FriendListTabsView.as::getTabContent()
    private getTabContent(tab: FriendListTab): IWindowContainer | null
    {
        const content = this._friendList.getXmlWindow('tab_content') as IWindowContainer | null;

        if(content === null)
        {
            logger.error('getTabContent: getXmlWindow("tab_content") returned null - layout not registered?');

            return null;
        }

        content.background = true;
        content.color = this._friendList.laf.getTabBgColor(tab.id);

        const footer = this.getTabContentFooter(tab);

        if(footer !== null)
        {
            content.addChild(footer);
        }

        const list = content.findChildByName('list_content') as IItemListWindow | null;

        if(list !== null)
        {
            list.color = this._friendList.laf.getTabBgColor(tab.id);
            tab.tabView.fillList(list);
        }

        return content;
    }

    /**
     * Fits the open tab into the shared content box: the list gets whatever height is
     * left once the footer is subtracted, and the footer is pinned to the bottom.
     */
    // AS3: .../FriendListTabsView.as::refreshTabContentDims()
    private refreshTabContentDims(tabContent: IWindowContainer): void
    {
        const tabs = this._friendList.tabs;

        if(tabs === null)
        {
            return;
        }

        const footer = tabContent.getChildByName('footer') as IWindowContainer | null;
        const list = tabContent.getChildByName('list') as IWindowContainer | null;

        if(footer === null || list === null)
        {
            return;
        }

        const scroller = list.getChildByName('scroller');
        const listContent = list.getChildByName('list_content') as IItemListWindow | null;
        const listParent = list.parent;

        const width = tabs.tabContentWidth;
        const height = tabs.tabContentHeight;

        if(listParent !== null)
        {
            listParent.height = Math.max(0, height);
            listParent.width = width;
        }

        const listHeight = Math.max(height - list.y - footer.height, 0);

        list.height = listHeight;
        list.width = width;

        if(scroller !== null)
        {
            scroller.height = listHeight;
            scroller.x = width - 27;
        }

        if(listContent !== null)
        {
            listContent.height = listHeight;
            listContent.width = width;
        }

        footer.y = height - footer.height;
        footer.width = width;
    }

    /**
     * Shows the scrollbar only when the rows overflow, and narrows the rows by its
     * width when it does — the rows are already built, so each one is resized in place.
     */
    // AS3: .../FriendListTabsView.as::refreshScrollBarVisibility()
    private refreshScrollBarVisibility(tabContent: IWindowContainer): void
    {
        const tabs = this._friendList.tabs;
        const list = tabContent.getChildByName('list') as IWindowContainer | null;

        if(tabs === null || list === null)
        {
            return;
        }

        const scroller = list.getChildByName('scroller');
        const listContent = list.getChildByName('list_content') as IItemListWindow | null;

        if(listContent === null)
        {
            return;
        }

        const overflows = listContent.scrollableRegion.height > listContent.height;
        const fullWidth = tabs.tabContentWidth - 10;
        const scrolledWidth = fullWidth - 22;
        const width = overflows ? scrolledWidth : fullWidth;

        if(scroller !== null)
        {
            scroller.visible = overflows;
        }

        listContent.width = width;
        this.change(listContent, width);
    }

    // AS3: .../FriendListTabsView.as::change()
    private change(list: IItemListWindow, width: number): void
    {
        for(let i = 0; i < list.numListItems; i++)
        {
            const item = list.getListItemAt(i);

            if(item !== null)
            {
                item.width = width;
            }
        }
    }

    // AS3: .../FriendListTabsView.as::getTabContentFooter()
    private getTabContentFooter(tab: FriendListTab): IWindowContainer | null
    {
        const footer = this._friendList.getXmlWindow(tab.footerName) as IWindowContainer | null;

        if(footer === null)
        {
            logger.error(`getTabContentFooter: getXmlWindow("${tab.footerName}") returned null - layout not registered?`);

            return null;
        }

        tab.tabView.fillFooter(footer);

        return footer;
    }
}
