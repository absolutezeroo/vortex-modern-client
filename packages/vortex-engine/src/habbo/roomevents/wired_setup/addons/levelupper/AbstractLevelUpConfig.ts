/**
 * AbstractLevelUpConfig — base for the level→XP curve simulators (LinearLevelUpper,
 * ExponentialLevelUpper, InterpolateLevelUpper) that drive VariableLevelUp's preview. The base returns
 * neutral values; subclasses override.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/levelupper/AbstractLevelUpConfig.as
 */
export class AbstractLevelUpConfig
{
    // AS3: AbstractLevelUpConfig.as::get maxLevel()
    get maxLevel(): number
    {
        return 0;
    }

    // AS3: AbstractLevelUpConfig.as::xpForLevel()
    xpForLevel(_level: number): number
    {
        return 0;
    }
}
