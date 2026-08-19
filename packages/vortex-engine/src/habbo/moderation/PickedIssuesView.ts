/**
 * PickedIssuesView — the issue browser's "picked issues" tab: bundles another moderator holds.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/PickedIssuesView.as
 *
 * `IssueBrowser` holds this one by its concrete type rather than through `IIssueBrowserView`,
 * which the other two use — a quirk of the source with no behavioural effect.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IIssueBrowserView} from './IIssueBrowserView';
import type {IssueBrowser} from './IssueBrowser';
import {IssueListView} from './IssueListView';
import {IssueManager} from './IssueManager';

export class PickedIssuesView implements IIssueBrowserView
{
    /** Derived name — `_SafeStr_6771`. */
    // AS3: PickedIssuesView.as::_SafeStr_6771
    private _issueManager: IssueManager;

    /** Derived name — `_SafeStr_6139`: held and never read, as in AS3. */
    // AS3: PickedIssuesView.as::_SafeStr_6139
    private _browser: IssueBrowser;

    // AS3: PickedIssuesView.as::_window
    private _window: IWindowContainer;

    /** Derived name — `_SafeStr_9351`. */
    // AS3: PickedIssuesView.as::_SafeStr_9351
    private _listView: IssueListView;

    // AS3: PickedIssuesView.as::PickedIssuesView()
    constructor(issueManager: IssueManager, browser: IssueBrowser, window: IWindowContainer)
    {
        this._issueManager = issueManager;
        this._browser = browser;
        this._window = window;

        (window as unknown as IWindow).visible = false;

        const list = window.findChildByName('issue_list') as unknown as IItemListWindow;

        this._listView = new IssueListView(issueManager, browser, list);
    }

    // AS3: PickedIssuesView.as::get view()
    public get view(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: PickedIssuesView.as::set visible()
    public get visible(): boolean
    {
        return (this._window as unknown as IWindow).visible;
    }

    // AS3: PickedIssuesView.as::set visible()
    public set visible(value: boolean)
    {
        (this._window as unknown as IWindow).visible = value;
    }

    // AS3: PickedIssuesView.as::update()
    public update(): void
    {
        this._listView.update(this._issueManager.getBundles(IssueManager.BUNDLE_PICKED));
    }
}
