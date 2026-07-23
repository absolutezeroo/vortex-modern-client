import {AbstractLevelUpConfig} from './AbstractLevelUpConfig';

/**
 * ExponentialLevelUpper — an exponential level→XP curve: XP for level n grows geometrically from a
 * first-level cost by an increase factor (given as a percentage, converted to a 0..1 strength). The
 * 1e-9 nudge matches the AS3 rounding behaviour.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/levelupper/ExponentialLevelUpper.as
 */
export class ExponentialLevelUpper extends AbstractLevelUpConfig
{
    // AS3: ExponentialLevelUpper.as::_SafeStr_8977 (name derived: the first-level XP)
    private readonly _firstLevelXp: number;

    // AS3: ExponentialLevelUpper.as::_strength
    private readonly _strength: number;

    // AS3: ExponentialLevelUpper.as::_SafeStr_8797 (name derived: the max level)
    private readonly _maxLevel: number;

    // AS3: ExponentialLevelUpper.as::ExponentialLevelUpper()
    constructor(firstLevelXp: number, increaseFactor: number, maxLevel: number)
    {
        super();
        this._firstLevelXp = firstLevelXp;
        this._strength = increaseFactor / 100;
        this._maxLevel = maxLevel;
    }

    // AS3: ExponentialLevelUpper.as::get maxLevel()
    override get maxLevel(): number
    {
        return this._maxLevel;
    }

    // AS3: ExponentialLevelUpper.as::xpForLevel()
    override xpForLevel(level: number): number
    {
        if(level < 1)
        {
            return 0;
        }

        return this._firstLevelXp * ((Math.pow(1 + this._strength, level - 1) - 1 + 1e-9) / this._strength);
    }
}
