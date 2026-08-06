/**
 * One row of the moderation tool's user-classification list: who the user is, and what the server
 * classified them as.
 *
 * Built by `ModerationMessageHandler` from the two parallel maps the classification message
 * carries (`classifiedUsernameMap` / `classifiedUserTypeMap`), keyed by user id, and rendered by
 * `UserClassificationCtrl`, which prints `classType` verbatim.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/userclassification/UserClassificationData.as
 */
export class UserClassificationData
{
    /**
     * AS3: .../userclassification/UserClassificationData.as::_SafeStr_11498
     *
     * **Derived name.** Obfuscated in every tree (`_Str_21259` in PRODUCTION) and referenced
     * nowhere in any of them, so there is nothing to recover its meaning from — only its value.
     * Named after the value rather than a guessed classification.
     */
    public static readonly USER_CLASSIFICATION_1: number = 1;

    // AS3: .../userclassification/UserClassificationData.as::NEW_USER_CLASSIFICATION
    public static readonly NEW_USER_CLASSIFICATION: number = 2;

    /**
     * AS3: .../userclassification/UserClassificationData.as::_SafeStr_11577
     *
     * **Derived name**, for the same reason as {@link USER_CLASSIFICATION_1}.
     */
    public static readonly USER_CLASSIFICATION_3: number = 3;

    // AS3: .../userclassification/UserClassificationData.as::PAYING_USER_CLASSIFICATION
    public static readonly PAYING_USER_CLASSIFICATION: number = 4;

    // AS3: .../userclassification/UserClassificationData.as::_SafeStr_5971
    private _userId: number;

    // AS3: .../userclassification/UserClassificationData.as::_username
    private _username: string;

    // AS3: .../userclassification/UserClassificationData.as::_SafeStr_8501
    private _classType: string;

    // AS3: .../userclassification/UserClassificationData.as::UserClassificationData()
    constructor(userId: number, username: string, classType: string)
    {
        this._userId = userId;
        this._username = username;
        this._classType = classType;
    }

    // AS3: .../userclassification/UserClassificationData.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../userclassification/UserClassificationData.as::get username()
    get username(): string
    {
        return this._username;
    }

    // AS3: .../userclassification/UserClassificationData.as::get classType()
    get classType(): string
    {
        return this._classType;
    }

    // AS3: .../userclassification/UserClassificationData.as::toString()
    toString(): string
    {
        return '[' + this._userId + ', ' + this._username + '] [' + this._classType + ']';
    }
}
