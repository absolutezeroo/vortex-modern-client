/**
 * IssueBrowser — the moderator's issue queue: three tabs over the same bundle table.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/IssueBrowser.as
 *
 * **The window is built once and then only hidden.** `show()` creates it on first call and
 * afterwards just makes it visible again, and closing sets `visible = false` rather than disposing —
 * so the three tab views, their row pools and their scroll positions survive being closed.
 *
 * The three tab bodies are prototypes already in the layout (`*_prototype`), handed to the views as
 * their own root; the tab strip drives which one is visible through `selectView()`. `update()` only
 * ever refreshes the *selected* view, and does nothing at all while the window is hidden, which is
 * what keeps the issue manager's 15-second refresh timer cheap.
 *
 * A `closed_issues` tab name is declared and never used — there is no fourth view.
 */
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IIssueBrowserView} from './IIssueBrowserView';
import type {IssueManager} from './IssueManager';
import {MyIssuesView} from './MyIssuesView';
import {OpenIssuesView} from './OpenIssuesView';
import {PickedIssuesView} from './PickedIssuesView';

export class IssueBrowser
{
    // AS3: IssueBrowser.as::MY_ISSUES
    private static readonly MY_ISSUES: string = 'my_issues';

    // AS3: IssueBrowser.as::OPEN_ISSUES
    private static readonly OPEN_ISSUES: string = 'open_issues';

    // AS3: IssueBrowser.as::PICKED_ISSUES
    private static readonly PICKED_ISSUES: string = 'picked_issues';

    /** Declared in AS3 and never referenced — there is no closed-issues view. */
    // AS3: IssueBrowser.as::CLOSED_ISSUES
    private static readonly CLOSED_ISSUES: string = 'closed_issues';

    /** Derived name — `_SafeStr_6771`. */
    // AS3: IssueBrowser.as::_SafeStr_6771
    private _issueManager: IssueManager;

    // AS3: IssueBrowser.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: IssueBrowser.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: IssueBrowser.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: IssueBrowser.as::_tabContext
    private _tabContext: ITabContextWindow | null = null;

    /** Derived name — `_SafeStr_5468`: the tab currently on screen. */
    // AS3: IssueBrowser.as::_SafeStr_5468
    private _selectedView: IIssueBrowserView | null = null;

    /** Derived name — `_SafeStr_9493`. */
    // AS3: IssueBrowser.as::_SafeStr_9493
    private _myIssuesView: IIssueBrowserView | null = null;

    /** Derived name — `_SafeStr_9877`. */
    // AS3: IssueBrowser.as::_SafeStr_9877
    private _openIssuesView: IIssueBrowserView | null = null;

    /** Derived name — `_SafeStr_8944`: typed concretely in AS3 where the other two are not. */
    // AS3: IssueBrowser.as::_SafeStr_8944
    private _pickedIssuesView: PickedIssuesView | null = null;

    // AS3: IssueBrowser.as::IssueBrowser()
    constructor(
        issueManager: IssueManager, windowManager: IHabboWindowManager | null, assets: IAssetLibrary | null
    )
    {
        this._issueManager = issueManager;
        this._windowManager = windowManager;
        this._assets = assets;
    }

    // AS3: IssueBrowser.as::get windowManager()
    public get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: IssueBrowser.as::get assets()
    public get assets(): IAssetLibrary | null
    {
        return this._assets;
    }

    // AS3: IssueBrowser.as::get issueManager()
    public get issueManager(): IssueManager
    {
        return this._issueManager;
    }

    // AS3: IssueBrowser.as::show()
    public show(): void
    {
        if(this._window === null) this.createMainFrame();

        const window = this._window as unknown as IWindow | null;

        if(window === null) return;

        window.visible = true;
        window.activate();

        this.update();
    }

    // AS3: IssueBrowser.as::isOpen()
    public isOpen(): boolean
    {
        return this._window !== null && (this._window as unknown as IWindow).visible;
    }

    /**
     * The tail of this method runs on *every* call, not just the first: AS3 re-reads `tab_context`
     * and re-selects `open_issues` outside the `_window == null` guard. Selecting the already
     * selected tab is a no-op, so re-opening the browser lands back on "open issues" only when the
     * selector actually changed.
     */
    // AS3: IssueBrowser.as::createMainFrame()
    private createMainFrame(): void
    {
        if(this._window === null)
        {
            this._window = this.createWindow('issue_browser_xml') as unknown as IFrameWindow | null;

            if(this._window === null) return;

            const window = this._window as unknown as IWindow;
            const desktop = window.desktop;

            window.x = (desktop?.width ?? 0) / 2 - window.width / 2;
            window.y = (desktop?.height ?? 0) / 2 - window.height / 2;

            this._window.findChildByTag('close')?.addEventListener('WME_CLICK', this.onClose);
            this._window.findChildByName('auto_pick')?.addEventListener('WME_CLICK', this.onAutoPick);

            this._tabContext = this._window.findChildByName('tab_context') as unknown as ITabContextWindow | null;

            const tabCount = this._tabContext?.numTabItems ?? 0;

            for(let index = 0; index < tabCount; index++)
            {
                const tab = this._tabContext?.getTabItemAt(index) ?? null;

                (tab as unknown as IWindow | null)?.addEventListener('WE_SELECTED', this.onTabSelected);
            }

            this._myIssuesView = new MyIssuesView(
                this.issueManager, this, this._window.findChildByName('my_issues_prototype') as unknown as IWindowContainer
            );
            this._openIssuesView = new OpenIssuesView(
                this.issueManager, this, this._window.findChildByName('open_issues_prototype') as unknown as IWindowContainer
            );
            this._pickedIssuesView = new PickedIssuesView(
                this.issueManager, this, this._window.findChildByName('picked_issues_prototype') as unknown as IWindowContainer
            );
        }

        this._tabContext = this._window.findChildByName('tab_context') as unknown as ITabContextWindow | null;

        if(this._tabContext === null || this._tabContext.container === null) return;

        const selectable = this._tabContext.selector?.getSelectableByName(IssueBrowser.OPEN_ISSUES) ?? null;

        if(selectable !== null) this._tabContext.selector?.setSelected(selectable);
    }

    /** The incoming view is sized to the tab container before it is shown, then refreshed once. */
    // AS3: IssueBrowser.as::selectView()
    private selectView(name: string): void
    {
        const view = this.getView(name);

        if(this._selectedView === view) return;

        if(this._selectedView !== null) this._selectedView.visible = false;

        this._selectedView = view;

        if(this._selectedView === null) return;

        const root = this._selectedView.view as unknown as IWindow | null;
        const container = this._tabContext?.container as unknown as IWindow | null;

        if(root !== null && container !== null)
        {
            root.width = container.width;
            root.height = container.height;
        }

        this._selectedView.visible = true;
        this._selectedView.update();
    }

    // AS3: IssueBrowser.as::getView()
    private getView(name: string): IIssueBrowserView | null
    {
        switch(name)
        {
            case IssueBrowser.MY_ISSUES:
                return this._myIssuesView;
            case IssueBrowser.OPEN_ISSUES:
                return this._openIssuesView;
            case IssueBrowser.PICKED_ISSUES:
                return this._pickedIssuesView;
            default:
                return null;
        }
    }

    /** The tab's own window name is the view key — `my_issues`, `open_issues`, `picked_issues`. */
    // AS3: IssueBrowser.as::onTabSelected()
    private onTabSelected = (event: WindowEvent): void =>
    {
        const window = event?.window ?? null;

        if(window === null) return;

        this.selectView(window.name);
    };

    // AS3: IssueBrowser.as::update()
    public update(): void
    {
        if(this._window === null || !(this._window as unknown as IWindow).visible) return;
        if(this._selectedView === null) return;

        this._selectedView.update();
    }

    // AS3: IssueBrowser.as::createWindow()
    public createWindow(name: string): IWindow | null
    {
        if(this._windowManager === null || this._assets === null) return null;

        const asset = this._assets.getAssetByName(name) as XmlAsset | null;
        const layout = asset?.content ?? null;

        if(layout === null) return null;

        return this._windowManager.buildFromXML(layout);
    }

    /** Hides rather than disposes — see the class note. */
    // AS3: IssueBrowser.as::onClose()
    private onClose = (): void =>
    {
        if(this._window !== null) (this._window as unknown as IWindow).visible = false;
    };

    // AS3: IssueBrowser.as::onAutoPick()
    private onAutoPick = (): void =>
    {
        this._issueManager.autoPick('issue browser pick next');
    };
}
