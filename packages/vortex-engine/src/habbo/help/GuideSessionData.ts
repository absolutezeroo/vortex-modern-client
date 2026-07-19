import {GuideSessionStateEnum} from './enum';

/**
 * Guide session state model
 *
 * Tracks the current state of a guide help session, including
 * roles, request details, and user/guide identities.
 *
 * @see source_as_win63/habbo/help/guidehelp/GuideSessionData.as
 */
export class GuideSessionData
{
    public static readonly ROLE_UNDECIDED: number = 0;
    public static readonly ROLE_GUIDE: number = 1;
    public static readonly ROLE_USER: number = 2;

    public static readonly REQUEST_TYPE_HELP: number = 0;
    public static readonly REQUEST_TYPE_TOUR: number = 1;
    public static readonly REQUEST_TYPE_BULLY: number = 2;

    private _role: number = 0;

    set role(value: number)
    {
        this._role = value;
    }

    private _activeWindow: string = '';

    get activeWindow(): string
    {
        return this._activeWindow;
    }

    set activeWindow(value: string)
    {
        this._activeWindow = value;
    }

    private _requestType: number = 0;

    get requestType(): number
    {
        return this._requestType;
    }

    set requestType(value: number)
    {
        this._requestType = value;
    }

    private _requestDescription: string = '';

    get requestDescription(): string
    {
        return this._requestDescription;
    }

    set requestDescription(value: string)
    {
        this._requestDescription = value;
    }

    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    set userId(value: number)
    {
        this._userId = value;
    }

    private _userName: string = '';

    get userName(): string
    {
        return this._userName;
    }

    set userName(value: string)
    {
        this._userName = value;
    }

    private _userFigure: string = '';

    get userFigure(): string
    {
        return this._userFigure;
    }

    set userFigure(value: string)
    {
        this._userFigure = value;
    }

    private _guideId: number = 0;

    get guideId(): number
    {
        return this._guideId;
    }

    set guideId(value: number)
    {
        this._guideId = value;
    }

    private _guideName: string = '';

    get guideName(): string
    {
        return this._guideName;
    }

    set guideName(value: string)
    {
        this._guideName = value;
    }

    private _guideFigure: string = '';

    get guideFigure(): string
    {
        return this._guideFigure;
    }

    set guideFigure(value: string)
    {
        this._guideFigure = value;
    }

    /**
	 * Whether there is an active session (user or guide)
	 */
    isActiveSession(): boolean
    {
        return this.isActiveUserSession() || this.isActiveGuideSession();
    }

    /**
	 * Whether the current session is an active user session
	 */
    isActiveUserSession(): boolean
    {
        return this._role === GuideSessionData.ROLE_USER &&
			(this._activeWindow === GuideSessionStateEnum.USER_CREATE ||
				this._activeWindow === GuideSessionStateEnum.USER_PENDING ||
				this._activeWindow === GuideSessionStateEnum.USER_ONGOING ||
				this._activeWindow === GuideSessionStateEnum.USER_FEEDBACK);
    }

    /**
	 * Whether the current session is an active guide session
	 */
    isActiveGuideSession(): boolean
    {
        return this._role === GuideSessionData.ROLE_GUIDE &&
			(this._activeWindow === GuideSessionStateEnum.GUIDE_ACCEPT ||
				this._activeWindow === GuideSessionStateEnum.GUIDE_ONGOING ||
				this._activeWindow === GuideSessionStateEnum.GUIDE_CLOSED);
    }

    /**
	 * Whether an ongoing session is in progress (either guide or user)
	 */
    isOnGoingSession(): boolean
    {
        return this._activeWindow === GuideSessionStateEnum.GUIDE_ONGOING ||
			this._activeWindow === GuideSessionStateEnum.USER_ONGOING;
    }
}
