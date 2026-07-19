import {IssueInfoData} from '@habbo/communication/messages/parser/moderation/IssueInfoData';
import {IssueBundle} from './IssueBundle';
import {Logger} from '@core/utils/Logger';
import type {ModerationManager} from './ModerationManager';
import {PickIssuesMessageComposer} from '@habbo/communication/messages/outgoing/moderation/PickIssuesMessageComposer';
import {
    ReleaseIssuesMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/ReleaseIssuesMessageComposer';
import {CloseIssuesMessageComposer} from '@habbo/communication/messages/outgoing/moderation/CloseIssuesMessageComposer';
import {
    CloseIssueDefaultActionMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/CloseIssueDefaultActionMessageComposer';
import {ModToolSanctionComposer} from '@habbo/communication/messages/outgoing/moderation/ModToolSanctionComposer';

const log = Logger.getLogger('Moderation');

/**
 * Core issue/report management.
 *
 * Maintains issue state, bundles related reports by grouping ID and
 * reported user, and handles pick/release/close operations.
 *
 * @see source_as_win63/habbo/moderation/IssueManager.as
 */
export class IssueManager
{
    public static readonly BUNDLE_OPEN: string = 'issue_bundle_open';
    public static readonly BUNDLE_MY: string = 'issue_bundle_my';
    public static readonly BUNDLE_PICKED: string = 'issue_bundle_picked';
    public static readonly PRIORITY_UPDATE_INTERVAL_MS: number = 15000;
    public static readonly RESOLUTION_USELESS: number = 1;
    public static readonly RESOLUTION_RESOLVED: number = 3;

    private _manager: ModerationManager;
    private _issues: Map<number, IssueInfoData> = new Map();
    private _bundles: Map<number, IssueBundle> = new Map();
    private _issueToBundleMap: Map<number, number> = new Map();
    private _pendingPickIssueIds: number[] = [];
    private _pendingReleaseIssueIds: number[] = [];
    private _nextBundleId: number = 1;
    private _windowX: number = 0;
    private _windowY: number = 0;
    private _windowWidth: number = 0;
    private _windowHeight: number = 0;

    constructor(manager: ModerationManager)
    {
        this._manager = manager;
    }

    private _autoPickEnabled: boolean = false;

    /**
	 * Whether auto-pick mode is enabled.
	 */
    get autoPickEnabled(): boolean
    {
        return this._autoPickEnabled;
    }

    set autoPickEnabled(value: boolean)
    {
        this._autoPickEnabled = value;
    }

    /**
	 * Update or add an issue. If the issue is closed (state 3), it is removed.
	 * Automatically groups issues into bundles by groupingId + reportedUserId.
	 *
	 * @param issue - The issue data to process
	 */
    updateIssue(issue: IssueInfoData): void
    {
        if(issue === null)
        {
            return;
        }

        // Update the master issue map
        this._issues.delete(issue.issueId);
        this._issues.set(issue.issueId, issue);

        // Check if the issue already belongs to a bundle
        let bundle: IssueBundle | null = null;
        const existingBundleId = this._issueToBundleMap.get(issue.issueId);

        if(existingBundleId !== undefined && existingBundleId !== 0)
        {
            const existingBundle = this._bundles.get(existingBundleId) ?? null;

            if(existingBundle !== null)
            {
                if(existingBundle.matches(issue))
                {
                    existingBundle.updateIssue(issue);
                    bundle = existingBundle;
                }
                else
                {
                    existingBundle.removeIssue(issue.issueId);

                    if(existingBundle.getIssueCount() === 0)
                    {
                        this._bundles.delete(existingBundle.id);
                    }

                    this._issueToBundleMap.delete(issue.issueId);
                }
            }
        }

        // If the issue is closed, remove it entirely
        if(issue.state === IssueInfoData.STATE_CLOSED)
        {
            this._issues.delete(issue.issueId);
            return;
        }

        // Try to find a matching bundle if not yet assigned
        if(bundle === null)
        {
            for(const candidateBundle of this._bundles.values())
            {
                if(candidateBundle.matches(issue))
                {
                    bundle = candidateBundle;
                    bundle.updateIssue(issue);
                    this._issueToBundleMap.set(issue.issueId, bundle.id);
                    break;
                }
            }
        }

        // Create a new bundle if no match found
        if(bundle === null)
        {
            const bundleId = this._nextBundleId++;
            bundle = new IssueBundle(bundleId, issue);
            this._issueToBundleMap.set(issue.issueId, bundleId);
            this._bundles.set(bundleId, bundle);
        }

        if(bundle === null)
        {
            return;
        }

        // Handle pending pick confirmations
        if(this._pendingPickIssueIds.indexOf(issue.issueId) !== -1)
        {
            this.handleBundle(bundle.id);

            const userId = this._manager.sessionDataManager?.userId ?? 0;

            if(userId !== issue.pickerUserId)
            {
                if(issue.state === IssueInfoData.STATE_PICKED)
                {
                    this.unhandleBundle(bundle.id);
                }
            }
        }

        // Auto-pick matching open issues
        if(issue.state === IssueInfoData.STATE_OPEN)
        {
            const myBundles = this.getBundles(IssueManager.BUNDLE_MY);
            let matchesMyBundle = false;

            for(const myBundle of myBundles)
            {
                if(myBundle.matches(issue, true))
                {
                    matchesMyBundle = true;
                    break;
                }
            }

            const releaseIdx = this._pendingReleaseIssueIds.indexOf(issue.issueId);

            if(releaseIdx === -1 && matchesMyBundle)
            {
                this.sendPick([issue.issueId], false, 0, 'matches bundle with issue');
            }
            else if(releaseIdx !== -1)
            {
                this._pendingReleaseIssueIds.splice(releaseIdx, 1);
            }
        }

        this.updateIssueBrowser();
    }

    /**
	 * Remove an issue from tracking entirely.
	 *
	 * @param issueId - The ID of the issue to remove
	 */
    removeIssue(issueId: number): void
    {
        if(this._issues === null)
        {
            return;
        }

        const bundleId = this._issueToBundleMap.get(issueId);

        if(bundleId !== undefined && bundleId !== 0)
        {
            const bundle = this._bundles.get(bundleId) ?? null;

            if(bundle !== null)
            {
                bundle.removeIssue(issueId);

                if(bundle.getIssueCount() === 0)
                {
                    this._bundles.delete(bundle.id);
                }
            }
        }

        this._issues.delete(issueId);
        this.updateIssueBrowser();
    }

    /**
	 * Trigger an update of the issue browser display.
	 */
    updateIssueBrowser(): void
    {
        if(this._manager === null)
        {
            return;
        }

        // UI update is handled by SolidJS stores - emit event
        log.debug('Issue browser updated');
    }

    /**
	 * Pick all issues in a bundle for handling.
	 *
	 * @param bundleId - The bundle to pick
	 * @param reason - Reason for picking
	 * @param autoRetry - Whether to auto-retry on failure
	 * @param retryCount - Current retry count
	 */
    pickBundle(bundleId: number, reason: string, autoRetry: boolean = false, retryCount: number = 0): void
    {
        const bundle = this._bundles.get(bundleId) ?? null;

        if(bundle === null)
        {
            return;
        }

        const issueIds = bundle.getIssueIds();
        this.sendPick(issueIds, autoRetry, retryCount, reason);
        this._pendingPickIssueIds.push(...issueIds);
    }

    /**
	 * Auto-pick the highest priority open bundle.
	 *
	 * @param reason - Reason for picking
	 * @param retry - Whether this is a retry attempt
	 * @param retryCount - Current retry count
	 */
    autoPick(reason: string, retry: boolean = false, retryCount: number = 0): void
    {
        let bestBundle: IssueBundle | null = null;

        for(const bundle of this._bundles.values())
        {
            if(bundle.state === IssueBundle.STATE_OPEN)
            {
                if(bestBundle === null || this.isBundleHigherPriorityOrOlder(bundle, bestBundle))
                {
                    bestBundle = bundle;
                }
            }
        }

        if(bestBundle === null)
        {
            return;
        }

        this.pickBundle(bestBundle.id, reason, retry, retryCount);
    }

    /**
	 * Release all issues picked by the current user.
	 */
    releaseAll(): void
    {
        if(this._bundles === null)
        {
            return;
        }

        const userId = this._manager.sessionDataManager?.userId ?? 0;
        const issueIds: number[] = [];

        for(const bundle of this._bundles.values())
        {
            if(bundle.state === IssueBundle.STATE_PICKED && bundle.pickerUserId === userId)
            {
                issueIds.push(...bundle.getIssueIds());
            }
        }

        this.sendRelease(issueIds);
    }

    /**
	 * Release all issues in a specific bundle.
	 *
	 * @param bundleId - The bundle to release
	 */
    releaseBundle(bundleId: number): void
    {
        if(this._bundles === null)
        {
            return;
        }

        const bundle = this._bundles.get(bundleId) ?? null;

        if(bundle === null)
        {
            return;
        }

        this.sendRelease(bundle.getIssueIds());
    }

    /**
	 * Close all issues in a bundle with a given resolution.
	 *
	 * @param bundleId - The bundle to close
	 * @param resolution - Resolution type (RESOLUTION_USELESS or RESOLUTION_RESOLVED)
	 */
    closeBundle(bundleId: number, resolution: number): void
    {
        const bundle = this._bundles.get(bundleId) ?? null;

        if(bundle === null)
        {
            return;
        }

        this.sendClose(bundle.getIssueIds(), resolution);
    }

    /**
	 * Close a bundle using the default action (sanction) for the highest priority issue.
	 *
	 * @param bundleId - The bundle to close
	 * @param resolution - Resolution type
	 */
    closeDefaultAction(bundleId: number, resolution: number): void
    {
        const bundle = this._bundles.get(bundleId) ?? null;

        if(bundle === null)
        {
            return;
        }

        const highestPriorityIssue = bundle.getHighestPriorityIssue();

        if(highestPriorityIssue === null)
        {
            return;
        }

        const mainIssueId = highestPriorityIssue.issueId;
        const otherIssueIds: number[] = [];

        for(const id of bundle.getIssueIds())
        {
            if(id !== mainIssueId)
            {
                otherIssueIds.push(id);
            }
        }

        this.sendCloseDefaultAction(mainIssueId, otherIssueIds, resolution);
    }

    /**
	 * Open a handler for the given bundle (for UI display).
	 *
	 * @param bundleId - The bundle to handle
	 */
    handleBundle(bundleId: number): void
    {
        const bundle = this._bundles.get(bundleId) ?? null;

        if(bundle === null)
        {
            return;
        }

        // Clean up pending pick IDs
        const newPending: number[] = [];

        for(const id of this._pendingPickIssueIds)
        {
            if(!bundle.contains(id))
            {
                newPending.push(id);
            }
        }

        this._pendingPickIssueIds = newPending;

        log.debug('Handle bundle:', bundleId);
    }

    /**
	 * Close a handler for the given bundle.
	 *
	 * @param bundleId - The bundle to unhandle
	 */
    unhandleBundle(bundleId: number): void
    {
        const bundle = this._bundles.get(bundleId) ?? null;

        if(bundle === null)
        {
            return;
        }

        log.debug('Unhandle bundle:', bundleId);
    }

    /**
	 * Request sanction data for a bundle's highest priority issue.
	 *
	 * @param bundleId - The bundle to request sanction data for
	 * @param modActionId - The moderation action ID
	 */
    requestSanctionData(bundleId: number, modActionId: number): void
    {
        const bundle = this._bundles.get(bundleId) ?? null;

        if(bundle === null)
        {
            return;
        }

        const highestPriorityIssue = bundle.getHighestPriorityIssue();

        if(highestPriorityIssue !== null)
        {
            this._manager.connection?.send(new ModToolSanctionComposer(highestPriorityIssue.issueId, -1, modActionId));
        }
    }

    /**
	 * Update sanction data for an issue.
	 *
	 * @param issueId - The issue ID
	 * @param accountId - The account ID
	 * @param sanctionData - The sanction data object
	 */
    updateSanctionData(issueId: number, accountId: number, sanctionData: unknown): void
    {
        log.debug('Update sanction data:', issueId, accountId, sanctionData);
    }

    /**
	 * Handle pick failure for a set of issues.
	 *
	 * @param issues - Array of issue info data that failed to pick
	 * @returns True if any issue was already picked by another moderator
	 */
    issuePickFailed(issues: IssueInfoData[]): boolean
    {
        if(!issues)
        {
            return false;
        }

        let pickedByOther = false;
        const myUserId = this._manager.sessionDataManager?.userId ?? 0;

        for(const issue of issues)
        {
            const issueId = issue.issueId;
            const pickerUserId = issue.pickerUserId;

            if(pickerUserId !== -1 && pickerUserId !== myUserId)
            {
                pickedByOther = true;
            }

            // Find the bundle containing this issue and release it
            let matchingBundle: IssueBundle | null = null;

            for(const bundle of this._bundles.values())
            {
                const bundleIssueIds = bundle.getIssueIds();

                for(const bundleIssueId of bundleIssueIds)
                {
                    if(issueId === bundleIssueId)
                    {
                        matchingBundle = bundle;
                        break;
                    }
                }

                if(matchingBundle !== null)
                {
                    break;
                }
            }

            if(matchingBundle !== null)
            {
                this.releaseBundle(matchingBundle.id);
            }
        }

        return pickedByOther;
    }

    /**
	 * Save tool window preferences.
	 *
	 * @param x - Window X position
	 * @param y - Window Y position
	 * @param h - Window height
	 * @param w - Window width
	 */
    setToolPreferences(x: number, y: number, h: number, w: number): void
    {
        this._windowX = x;
        this._windowY = y;
        this._windowHeight = h;
        this._windowWidth = w;
    }

    /**
	 * Set CFH topics data.
	 *
	 * @param topics - Array of CFH topic data
	 */
    setCfhTopics(topics: unknown[]): void
    {
        log.debug('CFH topics set:', topics.length);
    }

    /**
	 * Get bundles filtered by type.
	 *
	 * @param type - One of BUNDLE_OPEN, BUNDLE_MY, or BUNDLE_PICKED
	 * @returns Array of matching bundles
	 */
    getBundles(type: string): IssueBundle[]
    {
        if(this._bundles === null)
        {
            return [];
        }

        const result: IssueBundle[] = [];
        const userId = this._manager.sessionDataManager?.userId ?? 0;

        for(const bundle of this._bundles.values())
        {
            switch(type)
            {
                case IssueManager.BUNDLE_OPEN:
                    if(bundle.state === IssueBundle.STATE_OPEN)
                    {
                        result.push(bundle);
                    }
                    break;
                case IssueManager.BUNDLE_MY:
                    if(bundle.state === IssueBundle.STATE_PICKED && bundle.pickerUserId === userId)
                    {
                        result.push(bundle);
                    }
                    break;
                case IssueManager.BUNDLE_PICKED:
                    if(bundle.state === IssueBundle.STATE_PICKED && bundle.pickerUserId !== userId)
                    {
                        result.push(bundle);
                    }
                    break;
            }
        }

        return result;
    }

    /**
	 * Play the issue notification sound (if browser is not visible).
	 *
	 * @param issue - The issue that triggered the sound
	 */
    playSound(issue: IssueInfoData): void
    {
        if(this._issues.has(issue.issueId))
        {
            return;
        }

        log.debug('Play CFH sound for issue:', issue.issueId);
    }

    /**
	 * Dispose of the issue manager and clean up resources.
	 */
    dispose(): void
    {
        this._issues.clear();
        this._bundles.clear();
        this._issueToBundleMap.clear();
        this._pendingPickIssueIds = [];
        this._pendingReleaseIssueIds = [];
    }

    /**
	 * Check if a bundle has higher priority or is older than another.
	 */
    private isBundleHigherPriorityOrOlder(a: IssueBundle, b: IssueBundle): boolean
    {
        if(a.highestPriority < b.highestPriority)
        {
            return true;
        }

        return a.highestPriority === b.highestPriority && a.issueAgeInMilliseconds < b.issueAgeInMilliseconds;
    }

    /**
	 * Send a pick request to the server.
	 */
    private sendPick(issueIds: number[], autoRetry: boolean, retryCount: number, reason: string): void
    {
        if(issueIds === null || issueIds.length === 0 || this._manager === null || this._manager.connection === null)
        {
            return;
        }

        this._manager.connection.send(new PickIssuesMessageComposer(issueIds, autoRetry, retryCount, reason));
    }

    /**
	 * Send a release request to the server.
	 */
    private sendRelease(issueIds: number[]): void
    {
        if(issueIds === null || issueIds.length === 0 || this._manager === null || this._manager.connection === null)
        {
            return;
        }

        this._manager.connection.send(new ReleaseIssuesMessageComposer(issueIds));
        this._pendingReleaseIssueIds.push(...issueIds);
    }

    /**
	 * Send a close request to the server.
	 */
    private sendClose(issueIds: number[], resolution: number): void
    {
        if(issueIds === null || this._manager === null || this._manager.connection === null)
        {
            return;
        }

        this._manager.connection.send(new CloseIssuesMessageComposer(issueIds, resolution));
    }

    /**
	 * Send a close with default action request to the server.
	 */
    private sendCloseDefaultAction(mainIssueId: number, otherIssueIds: number[], resolution: number): void
    {
        if(this._manager === null || this._manager.connection === null)
        {
            return;
        }

        this._manager.connection.send(new CloseIssueDefaultActionMessageComposer(mainIssueId, otherIssueIds, resolution));
    }
}
