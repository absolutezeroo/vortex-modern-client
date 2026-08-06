/**
 * The server's view of a phone number: the `phoneStatusCode` of the collection-state message, and
 * the `resultCode` of both the number and the verification-code answers.
 *
 * Class name recovered from PRODUCTION (`PhoneNumberStatusEnum.as`); the constant names come from
 * the primary tree, where all eleven are readable and PRODUCTION's are not.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/phonenumber/_SafeCls_3859.as
 */
export class PhoneNumberStatusEnum
{
    // AS3: .../phonenumber/_SafeCls_3859.as::NON_EXISTING
    public static readonly NON_EXISTING: number = 0;

    // AS3: .../phonenumber/_SafeCls_3859.as::TOKEN_SENT
    public static readonly TOKEN_SENT: number = 1;

    // AS3: .../phonenumber/_SafeCls_3859.as::VERIFIED
    public static readonly VERIFIED: number = 2;

    // AS3: .../phonenumber/_SafeCls_3859.as::OK
    public static readonly OK: number = 3;

    // AS3: .../phonenumber/_SafeCls_3859.as::ERROR
    public static readonly ERROR: number = 4;

    // AS3: .../phonenumber/_SafeCls_3859.as::RATE_LIMIT
    public static readonly RATE_LIMIT: number = 5;

    // AS3: .../phonenumber/_SafeCls_3859.as::NUMBER_MISTYPED
    public static readonly NUMBER_MISTYPED: number = 6;

    // AS3: .../phonenumber/_SafeCls_3859.as::TOKEN_MISMATCH
    public static readonly TOKEN_MISMATCH: number = 7;

    // AS3: .../phonenumber/_SafeCls_3859.as::NOT_FOUND
    public static readonly NOT_FOUND: number = 8;

    // AS3: .../phonenumber/_SafeCls_3859.as::NON_VERIFIED
    public static readonly NON_VERIFIED: number = 9;

    // AS3: .../phonenumber/_SafeCls_3859.as::NUMBER_ALREADY_VERIFIED
    public static readonly NUMBER_ALREADY_VERIFIED: number = 10;
}
