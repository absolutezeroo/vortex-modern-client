import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboFriendList} from '../HabboFriendList';
import type {ITabView} from '../ITabView';

/**
 * FriendListTab
 *
 * One tab of the friend list window: its id, the localization key on its button, the
 * layout names of its footer and header picture, and the view that fills it.
 *
 * The view is initialised here, in the constructor — a tab is built once, when
 * `FriendListTabs` is, and survives every open/close of the window.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendListTab.as
 */
export class FriendListTab
{
    // AS3: .../domain/FriendListTab.as::FriendListTab()
    constructor(friendList: HabboFriendList, id: number, tabView: ITabView, name: string, footerName: string, headerPicName: string)
    {
        this._id = id;
        this._name = name;
        this._tabView = tabView;
        this._footerName = footerName;
        this._headerPicName = headerPicName;

        this._tabView.init(friendList);
    }

    // AS3: .../domain/FriendListTab.as::_SafeStr_4872
    private _id: number;

    // AS3: .../domain/FriendListTab.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../domain/FriendListTab.as::_name
    private _name: string;

    // AS3: .../domain/FriendListTab.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../domain/FriendListTab.as::_footerName
    private _footerName: string;

    // AS3: .../domain/FriendListTab.as::get footerName()
    get footerName(): string
    {
        return this._footerName;
    }

    // AS3: .../domain/FriendListTab.as::_headerPicName
    private _headerPicName: string;

    // AS3: .../domain/FriendListTab.as::get headerPicName()
    get headerPicName(): string
    {
        return this._headerPicName;
    }

    // AS3: .../domain/FriendListTab.as::_SafeStr_6487
    private _tabView: ITabView;

    // AS3: .../domain/FriendListTab.as::get tabView()
    get tabView(): ITabView
    {
        return this._tabView;
    }

    // AS3: .../domain/FriendListTab.as::_selected
    private _selected: boolean = false;

    // AS3: .../domain/FriendListTab.as::get selected()
    get selected(): boolean
    {
        return this._selected;
    }

    // AS3: .../domain/FriendListTab.as::_SafeStr_6831
    private _newMessageArrived: boolean = false;

    // AS3: .../domain/FriendListTab.as::get newMessageArrived()
    get newMessageArrived(): boolean
    {
        return this._newMessageArrived;
    }

    // AS3: .../domain/FriendListTab.as::_SafeStr_4550
    private _view: IWindowContainer | null = null;

    // AS3: .../domain/FriendListTab.as::get view()
    get view(): IWindowContainer | null
    {
        return this._view;
    }

    // AS3: .../domain/FriendListTab.as::set view()
    set view(value: IWindowContainer | null)
    {
        this._view = value;
    }

    /**
     * Selecting a tab clears its unread marker — the user is looking at it.
     */
    // AS3: .../domain/FriendListTab.as::setSelected()
    setSelected(selected: boolean): void
    {
        if(selected)
        {
            this._newMessageArrived = false;
        }

        this._selected = selected;
    }

    // AS3: .../domain/FriendListTab.as::setNewMessageArrived()
    setNewMessageArrived(arrived: boolean): void
    {
        if(this.selected)
        {
            this._newMessageArrived = false;
        }
        else
        {
            this._newMessageArrived = arrived;
        }
    }
}
