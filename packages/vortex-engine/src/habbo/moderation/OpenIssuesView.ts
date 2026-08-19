/**
 * OpenIssuesView — the issue browser's "open issues" tab: everything nobody has picked yet.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/OpenIssuesView.as
 *
 * This is the tab `IssueBrowser` selects on first open. See `MyIssuesView` for the shared shape.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IIssueBrowserView} from './IIssueBrowserView';
import type {IssueBrowser} from './IssueBrowser';
import {IssueListView} from './IssueListView';
import {IssueManager} from './IssueManager';

export class OpenIssuesView implements IIssueBrowserView
{
    /** Derived name — `_SafeStr_6771`. */
    // AS3: OpenIssuesView.as::_SafeStr_6771
    private _issueManager: IssueManager;

    /** Derived name — `_SafeStr_6139`: held and never read, as in AS3. */
    // AS3: OpenIssuesView.as::_SafeStr_6139
    private _browser: IssueBrowser;

    // AS3: OpenIssuesView.as::_window
    private _window: IWindowContainer;

    /** Derived name — `_SafeStr_9351`. */
    // AS3: OpenIssuesView.as::_SafeStr_9351
    private _listView: IssueListView;

    // AS3: OpenIssuesView.as::OpenIssuesView()
    constructor(issueManager: IssueManager, browser: IssueBrowser, window: IWindowContainer)
    {
        this._issueManager = issueManager;
        this._browser = browser;
        this._window = window;

        (window as unknown as IWindow).visible = false;

        const list = window.findChildByName('issue_list') as unknown as IItemListWindow;

        this._listView = new IssueListView(issueManager, browser, list);
    }

    // AS3: OpenIssuesView.as::get view()
    public get view(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: OpenIssuesView.as::set visible()
    public get visible(): boolean
    {
        return (this._window as unknown as IWindow).visible;
    }

    // AS3: OpenIssuesView.as::set visible()
    public set visible(value: boolean)
    {
        (this._window as unknown as IWindow).visible = value;
    }

    // AS3: OpenIssuesView.as::update()
    public update(): void
    {
        this._listView.update(this._issueManager.getBundles(IssueManager.BUNDLE_OPEN));
    }
}
