/**
 * Who may breed with a pet: its owner only, or anyone. Class name DERIVED — obfuscated in every tree.
 *
 * **Nothing in any source tree reads this class** — its values are written as literals wherever
 * they are needed, in AS3 and here alike. Transcribed because it is the only place these names are
 * recorded, not because anything dispatches on it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/_SafeCls_4201.as
 */
export const PetBreedingPermissionEnum = {
    // AS3: _SafeCls_4201.as::OWNER_ONLY
    OWNER_ONLY: 0,

    /** Derived name — `_SafeStr_11309`; there is no readable code to recover it from. */
    // AS3: _SafeCls_4201.as::_SafeStr_11309
    ANYONE: 1,
} as const;

export type PetBreedingPermissionEnum = typeof PetBreedingPermissionEnum[keyof typeof PetBreedingPermissionEnum];
