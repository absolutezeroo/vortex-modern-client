import type {PatternMatchData} from './PatternMatchData';

/**
 * Data class representing a single moderation issue.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/class_1722.as
 */
export class IssueInfoData
{
    public static readonly STATE_OPEN: number = 1;
    public static readonly STATE_PICKED: number = 2;
    public static readonly STATE_CLOSED: number = 3;

    constructor(
        issueId: number,
        state: number,
        categoryId: number,
        reportedCategoryId: number,
        issueAgeInMilliseconds: number,
        priority: number,
        groupingId: number,
        reporterUserId: number,
        reporterUserName: string,
        reportedUserId: number,
        reportedUserName: string,
        pickerUserId: number,
        pickerUserName: string,
        message: string,
        chatRecordId: number,
        patterns: PatternMatchData[]
    )
    {
        this._issueId = issueId;
        this._state = state;
        this._categoryId = categoryId;
        this._reportedCategoryId = reportedCategoryId;
        this._issueAgeInMilliseconds = issueAgeInMilliseconds;
        this._priority = priority;
        this._groupingId = groupingId;
        this._reporterUserId = reporterUserId;
        this._reporterUserName = reporterUserName;
        this._reportedUserId = reportedUserId;
        this._reportedUserName = reportedUserName;
        this._pickerUserId = pickerUserId;
        this._pickerUserName = pickerUserName;
        this._message = message;
        this._chatRecordId = chatRecordId;
        this._patterns = patterns;
        this._creationTimeInMilliseconds = Date.now();
    }

    private _issueId: number;

    get issueId(): number
    {
        return this._issueId;
    }

    private _state: number;

    get state(): number
    {
        return this._state;
    }

    private _categoryId: number;

    get categoryId(): number
    {
        return this._categoryId;
    }

    private _reportedCategoryId: number;

    get reportedCategoryId(): number
    {
        return this._reportedCategoryId;
    }

    private _issueAgeInMilliseconds: number;

    get issueAgeInMilliseconds(): number
    {
        return this._issueAgeInMilliseconds;
    }

    private _priority: number;

    get priority(): number
    {
        return this._priority;
    }

    private _groupingId: number;

    get groupingId(): number
    {
        return this._groupingId;
    }

    private _reporterUserId: number;

    get reporterUserId(): number
    {
        return this._reporterUserId;
    }

    private _reporterUserName: string;

    get reporterUserName(): string
    {
        return this._reporterUserName;
    }

    private _reportedUserId: number;

    get reportedUserId(): number
    {
        return this._reportedUserId;
    }

    private _reportedUserName: string;

    get reportedUserName(): string
    {
        return this._reportedUserName;
    }

    private _pickerUserId: number;

    get pickerUserId(): number
    {
        return this._pickerUserId;
    }

    private _pickerUserName: string;

    get pickerUserName(): string
    {
        return this._pickerUserName;
    }

    private _message: string;

    get message(): string
    {
        return this._message;
    }

    private _chatRecordId: number;

    get chatRecordId(): number
    {
        return this._chatRecordId;
    }

    private _patterns: PatternMatchData[];

    get patterns(): PatternMatchData[]
    {
        return this._patterns;
    }

    private _creationTimeInMilliseconds: number;

    get creationTimeInMilliseconds(): number
    {
        return this._creationTimeInMilliseconds;
    }

    /**
	 * Returns a formatted string representing how long the issue has been open.
	 */
    getOpenTime(currentTime: number): string
    {
        const totalSeconds = (this._issueAgeInMilliseconds + currentTime - this._creationTimeInMilliseconds) / 1000;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutesStr = (minutes < 10 ? '0' : '') + minutes;
        const hoursStr = (hours < 10 ? '0' : '') + hours;
        return hoursStr + ':' + minutesStr;
    }
}
