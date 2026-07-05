import type {IssueInfoData} from '@habbo/communication/messages/parser/moderation/IssueInfoData';

/**
 * Groups related moderation issues into a bundle.
 *
 * Issues are grouped by groupingId and reportedUserId. Each bundle tracks
 * its state (open/picked/closed), the picker info, message counts, and
 * provides priority-based sorting for issue selection.
 *
 * @see source_as_win63/habbo/moderation/IssueBundle.as
 */
export class IssueBundle
{
    public static readonly STATE_OPEN: number = 1;
    public static readonly STATE_PICKED: number = 2;
    public static readonly STATE_CLOSED: number = 3;
    private _groupingId: number;
    private _messageCount: number = 0;
    private _oldestIssue: IssueInfoData | null = null;
    private _highestPriorityIssue: IssueInfoData | null = null;

    constructor(id: number, issue: IssueInfoData)
    {
        this._id = id;
        this._state = issue.state;
        this._pickerUserId = issue.pickerUserId;
        this._pickerName = issue.pickerUserName;
        this._reportedUserId = issue.reportedUserId;
        this._groupingId = issue.groupingId;
        this.addIssue(issue);
    }

    private _id: number;

    get id(): number
    {
        return this._id;
    }

    private _issues: Map<number, IssueInfoData> = new Map();

    /**
	 * Get all issues in this bundle as an array.
	 */
    get issues(): IssueInfoData[]
    {
        return Array.from(this._issues.values());
    }

    private _state: number;

    get state(): number
    {
        return this._state;
    }

    private _pickerUserId: number = 0;

    get pickerUserId(): number
    {
        return this._pickerUserId;
    }

    private _pickerName: string = '';

    get pickerName(): string
    {
        return this._pickerName;
    }

    private _reportedUserId: number;

    get reportedUserId(): number
    {
        return this._reportedUserId;
    }

    private _issueAgeInMilliseconds: number = 0;

    get issueAgeInMilliseconds(): number
    {
        return this._issueAgeInMilliseconds;
    }

    /**
	 * Get the highest priority value across all issues.
	 */
    get highestPriority(): number
    {
        if(this._highestPriorityIssue === null)
        {
            this.getHighestPriorityIssue();
        }

        if(this._highestPriorityIssue !== null)
        {
            return this._highestPriorityIssue.priority;
        }

        return 0;
    }

    /**
	 * Check if an issue matches this bundle's grouping criteria.
	 *
	 * @param issue - The issue to check
	 * @param ignoreState - If true, ignore state and picker matching
	 * @returns True if the issue belongs to this bundle
	 */
    matches(issue: IssueInfoData, ignoreState: boolean = false): boolean
    {
        if(this._groupingId === 0 || issue.groupingId === 0)
        {
            return false;
        }

        if(this._groupingId !== issue.groupingId || this._reportedUserId !== issue.reportedUserId)
        {
            return false;
        }

        if(!ignoreState)
        {
            if(this._state !== issue.state)
            {
                return false;
            }

            if(this._pickerUserId !== issue.pickerUserId)
            {
                return false;
            }
        }

        return true;
    }

    /**
	 * Check if this bundle contains an issue with the given ID.
	 *
	 * @param issueId - The issue ID to check
	 * @returns True if the issue is in this bundle
	 */
    contains(issueId: number): boolean
    {
        return this._issues.has(issueId);
    }

    /**
	 * Update an existing issue in this bundle.
	 * Removes the old version and adds the new one.
	 *
	 * @param issue - The updated issue data
	 */
    updateIssue(issue: IssueInfoData): void
    {
        this.removeIssue(issue.issueId);
        this.addIssue(issue);
    }

    /**
	 * Remove an issue from this bundle.
	 *
	 * @param issueId - The ID of the issue to remove
	 * @returns The removed issue, or null if not found
	 */
    removeIssue(issueId: number): IssueInfoData | null
    {
        const issue = this._issues.get(issueId) ?? null;

        if(issue !== null)
        {
            this._issues.delete(issueId);

            if(issue.message !== null && issue.message !== '')
            {
                this._messageCount--;
            }

            if(this._oldestIssue === issue)
            {
                this._oldestIssue = null;
            }

            if(this._highestPriorityIssue === issue)
            {
                this._highestPriorityIssue = null;
            }
        }

        return issue;
    }

    /**
	 * Get the highest priority issue in this bundle.
	 *
	 * Issues with reportedCategoryId between 1-99 (exclusive) are considered
	 * special priority and take precedence over normal issues.
	 *
	 * @returns The highest priority issue, or null if empty
	 */
    getHighestPriorityIssue(): IssueInfoData | null
    {
        if(this._highestPriorityIssue === null)
        {
            if(this._issues.size < 1)
            {
                return null;
            }

            let specialPriority: IssueInfoData | null = null;
            let normalPriority: IssueInfoData | null = null;

            for(const issue of this._issues.values())
            {
                const isSpecial = issue.reportedCategoryId > 0 && issue.reportedCategoryId < 100;

                if(isSpecial)
                {
                    if(specialPriority === null || specialPriority.priority > issue.priority)
                    {
                        specialPriority = issue;
                    }
                }
                else
                {
                    if(normalPriority === null || normalPriority.priority > issue.priority)
                    {
                        normalPriority = issue;
                    }
                }
            }

            if(specialPriority !== null)
            {
                this._highestPriorityIssue = specialPriority;
            }
            else
            {
                this._highestPriorityIssue = normalPriority;
            }
        }

        return this._highestPriorityIssue;
    }

    /**
	 * Get the number of issues in this bundle.
	 */
    getIssueCount(): number
    {
        return this._issues.size;
    }

    /**
	 * Get all issue IDs in this bundle.
	 */
    getIssueIds(): number[]
    {
        return Array.from(this._issues.keys());
    }

    /**
	 * Get the number of issues with non-empty messages.
	 */
    getMessageCount(): number
    {
        return this._messageCount;
    }

    /**
	 * Get a formatted string representing how long the oldest issue has been open.
	 *
	 * @param currentTime - The current timestamp in milliseconds
	 * @returns A formatted time string (e.g., "01:30")
	 */
    getOpenTime(currentTime: number): string
    {
        let oldest = this._oldestIssue;

        if(oldest === null)
        {
            for(const issue of this._issues.values())
            {
                if(oldest === null || issue.issueAgeInMilliseconds > oldest.issueAgeInMilliseconds)
                {
                    oldest = issue;
                }
            }

            this._oldestIssue = oldest;
        }

        if(oldest !== null)
        {
            return oldest.getOpenTime(currentTime);
        }

        return '';
    }

    /**
	 * Add an issue to this bundle.
	 */
    private addIssue(issue: IssueInfoData): void
    {
        this._issues.set(issue.issueId, issue);
        this._issueAgeInMilliseconds = issue.issueAgeInMilliseconds;

        if(issue.message !== null && issue.message !== '')
        {
            this._messageCount++;
        }

        if(this._oldestIssue === null || issue.issueAgeInMilliseconds > this._oldestIssue.issueAgeInMilliseconds)
        {
            this._oldestIssue = issue;
        }

        this._highestPriorityIssue = null;
        this.getHighestPriorityIssue();
    }
}
