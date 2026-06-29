/**
 * HabboWebApiMethod
 *
 * @see sources/win63_2021_version/com/sulake/habbo/communication/HabboWebApiMethod.as
 *
 * API endpoint path constants for the Habbo Web API.
 */
export class HabboWebApiMethod
{
	// ── Force actions ───────────────────────────────────────────────
	public static readonly FORCE_EMAIL_CHANGE = '/api/force/email-change';
	public static readonly FORCE_PASSWORD_CHANGE = '/api/force/password-change';
	public static readonly FORCE_TOS_ACCEPT = '/api/force/tos-accept';

	// ── Authentication ──────────────────────────────────────────────
	public static readonly LOGIN = '/api/public/authentication/login';
	public static readonly AUTHENTICATE_USER = '/api/public/authentication/user';
	public static readonly FACEBOOK = '/api/public/authentication/facebook';
	public static readonly RPX = '/api/public/authentication/rpx';
	public static readonly LOGOUT = '/api/public/authentication/logout';

	// ── Registration ────────────────────────────────────────────────
	public static readonly REGISTER = '/api/public/registration/new';
	public static readonly ACTIVATE = '/api/public/registration/activate';

	// ── Password reset ──────────────────────────────────────────────
	public static readonly FORGOT_PASSWORD = '/api/public/forgotPassword/send';
	public static readonly CHANGE_PASSWORD = '/api/public/forgotPassword/changePassword';

	// ── Public info ─────────────────────────────────────────────────
	public static readonly HELLO = '/api/public/info/hello';
	public static readonly TIME = '/api/public/info/time';
	public static readonly CAPTCHA = '/api/public/captcha';

	// ── Public data ─────────────────────────────────────────────────
	public static readonly ACHIEVEMENTS = '/api/public/achievements';
	public static readonly ACHIEVEMENTS_FOR_ID = '/api/public/achievements/:id';
	public static readonly GROUPS = '/api/public/groups/:id';
	public static readonly MEMBERS = '/api/public/groups/:id/members';
	public static readonly POPULAR_ROOMS = '/api/public/rooms/popular';
	public static readonly ROOM = '/api/public/rooms/:roomId';
	public static readonly HOTLOOKS = '/api/public/lists/hotlooks';

	// ── User ────────────────────────────────────────────────────────
	public static readonly SELF = '/api/user/self';
	public static readonly PROFILE = '/api/user/profile';
	public static readonly PING = '/api/user/ping';
	public static readonly PREFERENCES = '/api/user/preferences';
	public static readonly SAVE_USER = '/api/user/preferences/save';
	public static readonly SAVE_VISIBILITY = '/api/user/preferences/save/visibility';
	public static readonly CREDIT_BALANCE = '/api/user/credit_balance';
	public static readonly CHANGE_EMAIL = '/api/user/email/change';
	public static readonly SAVE_LOOKS = '/api/user/look/save';
	public static readonly COMMON_FRIENDS = '/api/user/:id/common_friends';

	// ── Avatars ─────────────────────────────────────────────────────
	public static readonly AVATARS = '/api/user/avatars';
	public static readonly SELECT_AVATAR = '/api/user/avatars/select';
	public static readonly CREATE_AVATAR = '/api/user/avatars';

	// ── New user ────────────────────────────────────────────────────
	public static readonly NAME_CHECK = '/api/newuser/name/check';
	public static readonly SELECT_USER = '/api/newuser/name/select';
	public static readonly SELECT_ROOM = '/api/newuser/room/select';

	// ── Friends ─────────────────────────────────────────────────────
	public static readonly FRIEND_REQUESTS_SENT = '/api/user/friendrequests/sent';
	public static readonly FRIEND_REQUESTS_RECEIVED = '/api/user/friendrequests/received';

	// ── Campaign ────────────────────────────────────────────────────
	public static readonly CAMPAIGN_MESSAGES = '/api/user/campaign_messages';
	public static readonly CAMPAIGN_MESSAGES_ALL = '/api/user/campaign_messages/all';
	public static readonly CAMPAIGN_MESSAGES_SEEN = '/api/user/campaign_messages/seen';

	// ── Discussions ─────────────────────────────────────────────────
	public static readonly DISCUSSIONS = '/api/user/discussions';

	// ── Safety lock ─────────────────────────────────────────────────
	public static readonly SAFETY_LOCK_STATUS = '/api/safetylock/featureStatus';
	public static readonly SAFETY_LOCK_DISABLE = '/api/safetylock/disable';
	public static readonly SAFETY_LOCK_SAVE = '/api/safetylock/save';
	public static readonly SAFETY_LOCK_QUESTIONS = '/api/safetylock/questions';
	public static readonly SAFETY_LOCK_UNLOCK = '/api/safetylock/unlock';
	public static readonly RESET_TRUSTED_LOGINS = '/api/safetylock/resetTrustedLogins';

	// ── Logging ─────────────────────────────────────────────────────
	public static readonly LOG_CRASH = '/api/log/crash';
	public static readonly LOG_ERROR = '/api/log/error';
	public static readonly LOG_LOGIN_STEP = '/api/log/loginstep';

	// ── Client ──────────────────────────────────────────────────────
	public static readonly CLIENT_URL = '/api/client/clienturl';
	public static readonly SSO_TOKEN = '/api/ssotoken';

	// ── IAP ─────────────────────────────────────────────────────────
	public static readonly IAP_VALIDATE_ITUNES_RECEIPT = '/shopapi/iap/itunes/validate';
	public static readonly IAP_VALIDATE_PLAYSTORE_RECEIPT = '/shopapi/iap/playstore/validate';

	// ── Push notifications ──────────────────────────────────────────
	public static readonly DEVICE_TOKEN = '/api/pushwoosh/devicetoken';
}
