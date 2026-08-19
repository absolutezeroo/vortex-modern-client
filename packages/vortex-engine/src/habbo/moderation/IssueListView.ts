/**
 * IssueListView — the table of issue bundles shared by all three issue-browser tabs.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/IssueListView.as
 *
 * **The row list is resized, not rebuilt.** `update()` clones or destroys rows until the list holds
 * exactly as many as it needs, then refills every one in place. Rows are therefore reused across
 * refreshes — which is why each row's three buttons `removeEventListener` before adding: without it
 * a row that survives ten refreshes would fire its pick handler ten times.
 *
 * The button carries the bundle id in `IWindow.id`, so the handlers read it off the clicked window
 * rather than closing over the row.
 *
 * Rows alternate colour by *one-based* index, so the first row is the tinted one.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IssueBundle} from './IssueBundle';
import type {IssueBrowser} from './IssueBrowser';
import {IssueCategoryNames} from './IssueCategoryNames';
import type {IssueManager} from './IssueManager';

export class IssueListView
{
    /** `0xFFB2E6FA` — AS3 writes it as the decimal `4289914618`. */
    // AS3: IssueListView.as::update()
    private static readonly ROW_COLOR_ODD: number = 0xFFB2E6FA;

    /** `0xFFFFFFFF` — AS3 writes it as the decimal `4294967295`. */
    // AS3: IssueListView.as::update()
    private static readonly ROW_COLOR_EVEN: number = 0xFFFFFFFF;

    // AS3: IssueListView.as::update()
    private static readonly USER_ICON_ASSET: string = 'user_icon_png';

    // AS3: IssueListView.as::update()
    private static readonly ROOM_ICON_ASSET: string = 'room_icon_png';

    /** Derived name — `_SafeStr_6771`. */
    // AS3: IssueListView.as::_SafeStr_6771
    private _issueManager: IssueManager | null;

    /** Derived name — `_SafeStr_6139`. */
    // AS3: IssueListView.as::_SafeStr_6139
    private _browser: IssueBrowser | null;

    /** Derived name — `_SafeStr_4652`. */
    // AS3: IssueListView.as::_SafeStr_4652
    private _list: IItemListWindow | null;

    /** Derived name — `_SafeStr_6621`: the row the list ships with, cloned for every row. */
    // AS3: IssueListView.as::_SafeStr_6621
    private _rowTemplate: IWindowContainer | null;

    // AS3: IssueListView.as::_issueListLimit
    private _issueListLimit: number = 200;

    /**
     * The list's first item is the prototype: it is taken out and every row is cloned from it, so
     * the list starts empty.
     */
    // AS3: IssueListView.as::IssueListView()
    constructor(issueManager: IssueManager, browser: IssueBrowser, list: IItemListWindow)
    {
        this._issueManager = issueManager;
        this._browser = browser;
        this._list = list;

        this._rowTemplate = list.getListItemAt(0) as unknown as IWindowContainer | null;

        list.removeListItems();

        this._issueListLimit = issueManager.issueListLimit;
    }

    /**
     * AS3 sorts with `sortOn([...], [16, 16])` — flag 16 is `Array.NUMERIC` on both keys, with no
     * `DESCENDING` (2), so both are **ascending**. Kept as the source has it.
     */
    // AS3: IssueListView.as::update()
    public update(bundles: IssueBundle[] | null): void
    {
        const list = this._list;

        if(list === null) return;

        if(bundles === null || bundles.length === 0)
        {
            list.destroyListItems();

            return;
        }

        const sorted = bundles.slice().sort((a, b) =>
            (a.highestPriority - b.highestPriority)
            || (a.issueAgeInMilliseconds - b.issueAgeInMilliseconds));

        const existing = list.numListItems;
        const wanted = Math.min(sorted.length, this._issueListLimit);

        if(existing < wanted)
        {
            for(let index = 0; index < wanted - existing; index++)
            {
                const row = (this._rowTemplate as unknown as IWindow | null)?.clone() ?? null;

                if(row !== null) list.addListItem(row);
            }
        }
        else if(existing > wanted)
        {
            for(let index = 0; index < existing - wanted; index++)
            {
                list.removeListItemAt(0)?.dispose();
            }
        }

        const now = IssueListView.getTimer();

        let position = 1;

        for(const bundle of sorted)
        {
            if(position > this._issueListLimit) break;
            if(this._rowTemplate === null) return;

            const row = list.getListItemAt(position - 1) as unknown as IWindowContainer | null;

            if(row === null) return;

            const rowWindow = row as unknown as IWindow;

            rowWindow.width = (list as unknown as IWindow).width;
            rowWindow.color = position++ % 2 ? IssueListView.ROW_COLOR_ODD : IssueListView.ROW_COLOR_EVEN;

            IssueListView.setCaption(row, 'score', bundle.highestPriority.toString());

            const issue = bundle.getHighestPriorityIssue();

            if(issue === null) return;

            IssueListView.setCaption(row, 'source', IssueCategoryNames.getSourceName(issue.categoryId));
            IssueListView.setCaption(
                row, 'category', IssueCategoryNames.getCategoryName(issue.reportedCategoryId)
            );
            IssueListView.setCaption(
                row, 'target_name', issue.reportedUserId !== 0 ? issue.reportedUserName : ''
            );

            this.refreshTargetIcon(row, issue.reportedUserId);

            IssueListView.setCaption(row, 'time', bundle.getOpenTime(now));
            IssueListView.setCaption(row, 'msgs', bundle.getMessageCount().toString());
            IssueListView.setCaption(row, 'picker', bundle.pickerName);

            this.bindRowButton(row, 'pick_button', bundle.id, this.onPick);
            this.bindRowButton(row, 'handle_button', bundle.id, this.onHandle);
            this.bindRowButton(row, 'release_button', bundle.id, this.onRelease);
        }
    }

    /**
     * Two deviations, both forced by the port's image pipeline.
     *
     * AS3 reads a `BitmapData` out of the component asset library and hands the wrapper a
     * `.clone()`, because the wrapper owns and disposes what it is given. In this port images do not
     * live in a component asset library at all — they are in the `ResourceManager`, reached through
     * `IHabboWindowManager.getAsset()`, which is that lookup's documented stand-in. And the
     * `ImageBitmap` it returns is immutable and shared, so there is nothing to clone.
     */
    // AS3: IssueListView.as::update()
    private refreshTargetIcon(row: IWindowContainer, reportedUserId: number): void
    {
        const icon = row.findChildByName('target_icon') as unknown as IBitmapWrapperWindow | null;

        if(icon === null) return;

        const assetName = reportedUserId ? IssueListView.USER_ICON_ASSET : IssueListView.ROOM_ICON_ASSET;
        const bitmap = this._browser?.windowManager?.getAsset(assetName) ?? null;

        if(bitmap !== null) icon.bitmap = bitmap;
    }

    /** Removes before adding: rows survive refreshes, so the handler would otherwise stack up. */
    // AS3: IssueListView.as::update()
    private bindRowButton(
        row: IWindowContainer, name: string, bundleId: number, handler: (event: WindowMouseEvent) => void
    ): void
    {
        const button = row.findChildByName(name);

        if(button === null) return;

        button.id = bundleId;

        button.removeEventListener('WME_CLICK', handler);
        button.addEventListener('WME_CLICK', handler);
    }

    // TS-only: the null-guarded form of AS3's `row.findChildByName(name).caption = value`.
    private static setCaption(row: IWindowContainer, name: string, value: string): void
    {
        const child = row.findChildByName(name);

        if(child !== null) child.caption = value;
    }

    /** Stands in for AS3's `flash.utils.getTimer()`; `IssueBundle.getOpenTime()` only takes deltas. */
    // AS3: IssueListView.as::update()
    private static getTimer(): number
    {
        return Math.trunc(performance.now());
    }

    // AS3: IssueListView.as::onPick()
    private onPick = (event: WindowMouseEvent): void =>
    {
        this._issueManager?.pickBundle(event.window?.id ?? 0, 'pick button');
    };

    /** AS3 guards on the *browser* here and then uses the issue manager — kept as written. */
    // AS3: IssueListView.as::onHandle()
    private onHandle = (event: WindowMouseEvent): void =>
    {
        if(this._browser === null) return;

        this._issueManager?.handleBundle(event.window?.id ?? 0);
    };

    // AS3: IssueListView.as::onRelease()
    private onRelease = (event: WindowMouseEvent): void =>
    {
        this._issueManager?.releaseBundle(event.window?.id ?? 0);
    };
}
