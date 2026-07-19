/**
 * HabboWebApiError
 *
 * @see sources/win63_2021_version/com/sulake/habbo/communication/HabboWebApiError.as
 *
 * Error string constants for Web API responses.
 */
export class HabboWebApiError
{
    public static readonly INVALID_CAPTCHA = 'invalid-captcha';
    public static readonly ACCOUNT_ISSUE = 'account_issue';
    public static readonly LOGIN_BLOCKED = 'login.blocked';
    public static readonly LOGIN_USER_BANNED = 'login.user_banned';
    public static readonly UNAUTHORIZED_STAFF_LOGIN = 'unauthorized-staff-login';
    public static readonly LOGIN_FAILED = 'pocket.auth.login_failed';
    public static readonly LOGIN_NO_AVATARS = 'pocket.auth.no_avatars';
    public static readonly VALID_EMAIL_REQUIRED = 'pocket.auth.valid_email_required';
    public static readonly PASSWORD_REQUIRED = 'pocket.auth.password_required';
    public static readonly FACEBOOK_DISABLED = 'pocket.auth.facebook_disabled';
    public static readonly FACEBOOK_NOT_CONNECTED = 'pocket.auth.facebook_not_connected';
    public static readonly ACCESS_TOKEN_REQUIRED = 'pocket.auth.access_token_required';
    public static readonly REGISTRATION_CAPTCHA_EMPTY = 'registration.captcha_is_empty';
    public static readonly REGISTRATION_CAPTCHA_INVALID = 'registration.invalid_captcha';
    public static readonly REGISTRATION_DISABLED = 'registration.error.registration_disabled';
    public static readonly REGISTRATION_PASSWORD = 'registration_password';
    public static readonly REGISTRATION_BIRTHDAY_FORMAT = 'registration.birthdate_format';
    public static readonly REGISTRATION_INVALID_BIRTHDAY = 'registration.invalid_birthdate';
    public static readonly REGISTRATION_INVALID_PASSWORD = 'registration.invalid_password';
    public static readonly REGISTRATION_INVALID_EMAIL = 'registration.invalid_email';
    public static readonly REGISTRATION_AGE_LIMIT = 'registration.age_limit';
    public static readonly REGISTRATION_EMAIL = 'registration_email';
    public static readonly REGISTRATION_EMAIL_IN_USE = 'registration_email_in_use';
    public static readonly REGISTRATION_EMAIL_UNAUTHORIZED = 'registration_email_unauthorized';
    public static readonly REGISTRATION_PARENT_EMAIL = 'registration_parent_email';
    public static readonly REGISTRATION_ERROR_SPAM = 'registration_error.spam';
    public static readonly REGISTRATION_ERROR_AGE_BAN = 'registration.error.age_ban';
    public static readonly REGISTRATION_ERROR_IDENTITY_CREATION_FAILED = 'registration.error.identity_creation_failed';
}
