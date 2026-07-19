/**
 * Talent track types
 * Based on AS3 com.sulake.habbo.session.talent.TalentEnum
 */
export const TalentEnum = {
    HELPER: 'helper',
    CITIZENSHIP: 'citizenship',
} as const;

export type TalentType = typeof TalentEnum[keyof typeof TalentEnum];

export function getTalentTypes(): TalentType[]
{
    return [TalentEnum.HELPER, TalentEnum.CITIZENSHIP];
}
