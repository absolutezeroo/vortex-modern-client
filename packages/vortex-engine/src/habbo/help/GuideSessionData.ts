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
    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::ROLE_UNDECIDED
    public static readonly ROLE_UNDECIDED: number = 0;
    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::ROLE_GUIDE
    public static readonly ROLE_GUIDE: number = 1;
    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::ROLE_USER
    public static readonly ROLE_USER: number = 2;

    public static readonly REQUEST_TYPE_HELP: number = 0;
    public static readonly REQUEST_TYPE_TOUR: number = 1;
    public static readonly REQUEST_TYPE_BULLY: number = 2;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_role
    private _role: number = 0;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set role()
    set role(value: number)
    {
        this._role = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_activeWindow
    private _activeWindow: string = '';

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get activeWindow()
    get activeWindow(): string
    {
        return this._activeWindow;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set activeWindow()
    set activeWindow(value: string)
    {
        this._activeWindow = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_requestType
    private _requestType: number = 0;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get requestType()
    get requestType(): number
    {
        return this._requestType;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set requestType()
    set requestType(value: number)
    {
        this._requestType = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_requestDescription
    private _requestDescription: string = '';

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get requestDescription()
    get requestDescription(): string
    {
        return this._requestDescription;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set requestDescription()
    set requestDescription(value: string)
    {
        this._requestDescription = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_userId
    private _userId: number = 0;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set userId()
    set userId(value: number)
    {
        this._userId = value;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_userName
    private _userName: string = '';

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set userName()
    set userName(value: string)
    {
        this._userName = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_userFigure
    private _userFigure: string = '';

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get userFigure()
    get userFigure(): string
    {
        return this._userFigure;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set userFigure()
    set userFigure(value: string)
    {
        this._userFigure = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_guideId
    private _guideId: number = 0;

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get guideId()
    get guideId(): number
    {
        return this._guideId;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set guideId()
    set guideId(value: number)
    {
        this._guideId = value;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_guideName
    private _guideName: string = '';

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get guideName()
    get guideName(): string
    {
        return this._guideName;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set guideName()
    set guideName(value: string)
    {
        this._guideName = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::_guideFigure
    private _guideFigure: string = '';

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::get guideFigure()
    get guideFigure(): string
    {
        return this._guideFigure;
    }

    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::set guideFigure()
    set guideFigure(value: string)
    {
        this._guideFigure = value;
    }

    /**
	 * Whether there is an active session (user or guide)
	 */
    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::isActiveSession()
    isActiveSession(): boolean
    {
        return this.isActiveUserSession() || this.isActiveGuideSession();
    }

    /**
	 * Whether the current session is an active user session
	 */
    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::isActiveUserSession()
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
    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::isActiveGuideSession()
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
    // AS3: .../src/com/sulake/habbo/help/guidehelp/GuideSessionData.as::isOnGoingSession()
    isOnGoingSession(): boolean
    {
        return this._activeWindow === GuideSessionStateEnum.GUIDE_ONGOING ||
			this._activeWindow === GuideSessionStateEnum.USER_ONGOING;
    }
}
