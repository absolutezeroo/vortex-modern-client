import {AbstractLevelUpConfig} from './AbstractLevelUpConfig';

/**
 * LinearLevelUpper — a linear level→XP curve: each level past the first costs a fixed step of XP.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/levelupper/LinearLevelUpper.as
 */
export class LinearLevelUpper extends AbstractLevelUpConfig
{
    // AS3: LinearLevelUpper.as::_SafeStr_10199 (name derived: the per-level step)
    private readonly _stepSize: number;

    // AS3: LinearLevelUpper.as::_SafeStr_8797 (name derived: the max level)
    private readonly _maxLevel: number;

    // AS3: LinearLevelUpper.as::LinearLevelUpper()
    constructor(stepSize: number, maxLevel: number)
    {
        super();
        this._stepSize = stepSize;
        this._maxLevel = maxLevel;
    }

    // AS3: LinearLevelUpper.as::get maxLevel()
    override get maxLevel(): number
    {
        return this._maxLevel;
    }

    // AS3: LinearLevelUpper.as::xpForLevel()
    override xpForLevel(level: number): number
    {
        if(level <= 1)
        {
            return 0;
        }

        return this._stepSize * (level - 1);
    }
}
