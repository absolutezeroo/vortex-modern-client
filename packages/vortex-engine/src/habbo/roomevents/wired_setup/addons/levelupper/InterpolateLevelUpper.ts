import {OrderedMap} from '@core/utils/OrderedMap';

import {AbstractLevelUpConfig} from './AbstractLevelUpConfig';

/**
 * InterpolateLevelUpper — a manual level→XP curve defined by explicit "level=xp" anchor points, linearly
 * interpolating XP for levels between anchors. Internally it flips the anchor map to xp→level (prefixed
 * with 0→1) so lookups walk the XP axis.
 *
 * `_SafeCls_481` (the AS3 core.utils insertion-ordered Map) is represented here by OrderedMap.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/levelupper/InterpolateLevelUpper.as
 */
export class InterpolateLevelUpper extends AbstractLevelUpConfig
{
    // AS3: InterpolateLevelUpper.as::_SafeStr_7230 (name derived: the xp -> level tree)
    private readonly _tree: OrderedMap<number, number>;

    // AS3: InterpolateLevelUpper.as::InterpolateLevelUpper()
    constructor(levelToXp: OrderedMap<number, number>)
    {
        super();
        this._tree = InterpolateLevelUpper.generateTree(levelToXp);
    }

    // AS3: InterpolateLevelUpper.as::generateTree()
    private static generateTree(levelToXp: OrderedMap<number, number>): OrderedMap<number, number>
    {
        const tree = new OrderedMap<number, number>();
        tree.add(0, 1);

        for(const level of levelToXp.getKeys())
        {
            const xp = levelToXp.getValue(level)!;
            tree.add(xp, level);
        }

        return tree;
    }

    // AS3: InterpolateLevelUpper.as::xpForLevel()
    override xpForLevel(level: number): number
    {
        if(level <= 1)
        {
            return 0;
        }

        let last = 0;

        for(const xpKey of this._tree.getKeys())
        {
            const levelAtKey = this._tree.getValue(xpKey)!;

            if(levelAtKey === level)
            {
                return xpKey;
            }

            if(levelAtKey > level)
            {
                const lowerXp = this.getLowerEntryKey(xpKey)!;
                const lowerLevel = this._tree.getValue(lowerXp)!;
                const levelDelta = levelAtKey - lowerLevel;
                const xpDelta = xpKey - lowerXp;
                const xpPerLevel = xpDelta / levelDelta;
                const levelsAbove = level - lowerLevel;
                return lowerXp + Math.trunc(xpPerLevel * levelsAbove);
            }

            last = xpKey;
        }

        return last;
    }

    // AS3: InterpolateLevelUpper.as::get maxLevel()
    override get maxLevel(): number
    {
        const key = this.getLowerEntryKey(2147483647);
        return this._tree.getValue(key === null ? 0 : key) ?? 0;
    }

    // AS3: InterpolateLevelUpper.as::getLowerEntryKey()
    private getLowerEntryKey(threshold: number): number | null
    {
        let result: number | null = null;

        for(const key of this._tree.getKeys())
        {
            if(key < threshold && (result === null || key > result))
            {
                result = key;
            }
        }

        return result;
    }
}
