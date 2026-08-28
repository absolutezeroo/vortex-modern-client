/**
 * The two pet supplements, matching the `GiveSupplementToPet` composer's second field. Class name DERIVED — obfuscated in every tree.
 *
 * **Nothing in any source tree reads this class** — its values are written as literals wherever
 * they are needed, in AS3 and here alike. Transcribed because it is the only place these names are
 * recorded, not because anything dispatches on it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/enums/_SafeCls_4440.as
 */
export const PetSupplementTypeEnum = {
    // AS3: _SafeCls_4440.as::WATER
    WATER: 0,

    // AS3: _SafeCls_4440.as::LIGHT
    LIGHT: 1,
} as const;

export type PetSupplementTypeEnum = typeof PetSupplementTypeEnum[keyof typeof PetSupplementTypeEnum];
