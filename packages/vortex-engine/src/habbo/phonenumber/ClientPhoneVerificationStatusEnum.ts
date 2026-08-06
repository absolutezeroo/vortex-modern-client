/**
 * The `collectionStatusCode` of `PhoneCollectionStateMessageEventParser` — how far the *client*
 * has got in asking for a phone number, as opposed to what the server knows about the number
 * itself ({@link PhoneNumberStatusEnum}).
 *
 * Class name recovered from PRODUCTION (`ClientPhoneVerificationStatusEnum.as`, unobfuscated
 * there); the constant names come from the primary tree, where PRODUCTION's are obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/phonenumber/_SafeCls_3725.as
 */
export class ClientPhoneVerificationStatusEnum
{
    // AS3: .../phonenumber/_SafeCls_3725.as::NON_EXISTING
    public static readonly NON_EXISTING: number = 0;

    /**
     * AS3: .../phonenumber/_SafeCls_3725.as::_SafeStr_10412
     *
     * **Derived name.** Obfuscated in both trees that have the class (`_Str_6027` in PRODUCTION)
     * and referenced nowhere, so only its value is known. `HabboPhoneNumber.onStateMessage()`
     * compares `collectionStatusCode` against a literal `1` in a branch that opens the minimized
     * verify view — but that branch is unreachable (see the note there), so even the call site
     * says nothing about the name.
     */
    public static readonly CLIENT_PHONE_VERIFICATION_STATUS_1: number = 1;

    // AS3: .../phonenumber/_SafeCls_3725.as::NEVER_AGAIN
    public static readonly NEVER_AGAIN: number = 2;

    // AS3: .../phonenumber/_SafeCls_3725.as::TOKEN_INPUT
    public static readonly TOKEN_INPUT: number = 3;
}
