import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {HabboFriendList} from './HabboFriendList';

/**
 * ITabView
 *
 * What the friend list window asks of whichever tab is open. The window owns the
 * chrome — header, footer container, item list — and hands each of them to the tab
 * to fill; the tab owns nothing above its own rows.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/ITabView.as
 */
export interface ITabView
{
    // AS3: .../ITabView.as::init()
    init(friendList: HabboFriendList): void;

    // AS3: .../ITabView.as::fillFooter()
    fillFooter(footer: IWindowContainer): void;

    // AS3: .../ITabView.as::fillList()
    fillList(list: IItemListWindow): void;

    // AS3: .../ITabView.as::getEntryCount()
    getEntryCount(): number;

    // AS3: .../ITabView.as::tabClicked()
    tabClicked(tabId: number): void;
}
