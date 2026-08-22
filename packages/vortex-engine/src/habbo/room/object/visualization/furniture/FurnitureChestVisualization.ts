/**
 * FurnitureChestVisualization
 *
 * Base visualization of the two chest furnis: hides the `wired_emblem` sprite unless the model
 * says the chest is wired.
 *
 * Name DERIVED: `_SafeCls_1801` in the primary tree and absent from the 2016 one — named for
 * the two chest visualizations that extend it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/visualization/furniture/_SafeCls_1801.as
 */
import {AnimatedFurnitureVisualization} from './AnimatedFurnitureVisualization';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureChestVisualization extends AnimatedFurnitureVisualization
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/visualization/furniture/_SafeCls_1801.as::WIRED_EMBLEM_SPRITE_TAG
    private static readonly WIRED_EMBLEM_SPRITE_TAG: string = 'wired_emblem';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/visualization/furniture/_SafeCls_1801.as::_SafeStr_8630
    private _isWiredEnabled: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/visualization/furniture/_SafeCls_1801.as::updateModel()
    protected override updateModel(scale: number): boolean
    {
        let changed = super.updateModel(scale);

        const enabled = this.object?.getModel()?.getNumber(RoomObjectVariableEnum.FURNITURE_CHEST_IS_WIRED_ENABLED) === 1;

        if(enabled !== this._isWiredEnabled)
        {
            this._isWiredEnabled = enabled;
            changed = true;
        }

        return changed;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/visualization/furniture/_SafeCls_1801.as::getSpriteAlpha()
    protected override getSpriteAlpha(scale: number, direction: number, layerIndex: number): number
    {
        const tag = this.getSpriteTag(scale, direction, layerIndex);

        if(!this._isWiredEnabled && tag === FurnitureChestVisualization.WIRED_EMBLEM_SPRITE_TAG) return 0;

        return super.getSpriteAlpha(scale, direction, layerIndex);
    }
}
