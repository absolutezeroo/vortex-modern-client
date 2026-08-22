import type {IThumbListDataProvider} from '../common/IThumbListDataProvider';
import type {IThumbListDrawableItem} from '../IThumbListDrawableItem';
import type {EffectsModel} from './EffectsModel';
import type {EffectFilterType} from './IEffectsModel';

/**
 * Hands one filtered slice of the effects list to a `ThumbListManager` — the active strip and
 * the inactive strip each get their own proxy.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectListProxy.as
 */
export class EffectListProxy implements IThumbListDataProvider
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectListProxy.as::_model
    private _model: EffectsModel | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectListProxy.as::_filter
    // Derived name: obfuscated in the primary tree.
    private _filter: EffectFilterType;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectListProxy.as::EffectListProxy()
    constructor(model: EffectsModel, filter: EffectFilterType)
    {
        this._model = model;
        this._filter = filter;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectListProxy.as::getDrawableList()
    getDrawableList(): IThumbListDrawableItem[]
    {
        return this._model?.getEffects(this._filter) ?? [];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectListProxy.as::dispose()
    dispose(): void
    {
        this._model = null;
    }
}
