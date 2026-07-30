/**
 * IFriend
 *
 * The read-only face of a friend entry — what every view and the messenger are
 * allowed to see. `Friend` implements it; the mutable setters live on the class.
 *
 * The primary tree obfuscates this interface to `_SafeCls_1760`. The name is
 * recovered, not derived: `PRODUCTION-201601012205-226667486/.../friendlist/IFriend.as`
 * declares the same member set unobfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_1760.as
 */
export interface IFriend
{
    // AS3: .../_SafeCls_1760.as::get id()
    readonly id: number;

    // AS3: .../_SafeCls_1760.as::get name()
    readonly name: string;

    // AS3: .../_SafeCls_1760.as::get gender()
    readonly gender: number;

    // AS3: .../_SafeCls_1760.as::get online()
    readonly online: boolean;

    // AS3: .../_SafeCls_1760.as::get followingAllowed()
    readonly followingAllowed: boolean;

    // AS3: .../_SafeCls_1760.as::get figure()
    readonly figure: string;

    // AS3: .../_SafeCls_1760.as::get realName()
    readonly realName: string;

    // AS3: .../_SafeCls_1760.as::get persistedMessageUser()
    readonly persistedMessageUser: boolean;

    // AS3: .../_SafeCls_1760.as::get pocketHabboUser()
    readonly pocketHabboUser: boolean;

    // AS3: .../_SafeCls_1760.as::get relationshipStatus()
    readonly relationshipStatus: number;
}
