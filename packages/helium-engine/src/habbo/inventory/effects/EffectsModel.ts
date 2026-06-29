import type {EffectFilterType, IEffectsModel} from './IEffectsModel';
import {EffectFilter} from './IEffectsModel';
import {Effect} from './Effect';

/**
 * Manages avatar effects inventory data
 *
 * Based on AS3 com.sulake.habbo.inventory.effects.EffectsModel (ENGINE only)
 */
export class EffectsModel implements IEffectsModel
{
	private _effects: Effect[] = [];

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	private _lastActivatedEffect: number = -1;

	get lastActivatedEffect(): number
	{
		return this._lastActivatedEffect;
	}

	dispose(): void
	{
		if (this._disposed) return;

		for (const effect of this._effects)
		{
			effect.dispose();
		}

		this._effects = [];
		this._disposed = true;
	}

	addEffect(effect: Effect): boolean
	{
		const existing = this.getEffect(effect.type);

		if (existing)
		{
			existing.amountInInventory++;

			return false;
		}

		this._effects.push(effect);

		return true;
	}

	getEffect(type: number): Effect | null
	{
		for (const effect of this._effects)
		{
			if (effect.type === type)
			{
				return effect;
			}
		}

		return null;
	}

	getEffects(filter: EffectFilterType = EffectFilter.ALL): Effect[]
	{
		if (filter === EffectFilter.ALL)
		{
			return [...this._effects];
		}

		return this._effects.filter(e =>
		{
			if (filter === EffectFilter.ACTIVE)
			{
				return e.isActive;
			}

			return !e.isActive;
		});
	}

	getItemInIndex(index: number, filter: EffectFilterType = EffectFilter.ALL): Effect | null
	{
		const effects = this.getEffects(filter);

		if (index < 0 || index >= effects.length)
		{
			return null;
		}

		return effects[index];
	}

	setEffectActivated(type: number): Effect | null
	{
		const effect = this.getEffect(type);

		if (!effect) return null;

		this.stopUsingAllEffects();
		effect.isActive = true;
		effect.isInUse = true;

		return effect;
	}

	useEffect(type: number): number
	{
		this.stopUsingAllEffectsInternal(false);

		const effect = this.getEffect(type);

		if (!effect) return -1;

		// If not active, need to activate first
		if (!effect.isActive)
		{
			// Return type for caller to send activation message
			return effect.type;
		}

		// Already active, just mark as in use
		if (!effect.isInUse)
		{
			effect.isInUse = true;
			this._lastActivatedEffect = type;

			return type;
		}

		return -1;
	}

	stopUsingEffect(type: number): boolean
	{
		const effect = this.getEffect(type);

		if (!effect) return false;

		if (effect.isInUse)
		{
			effect.isInUse = false;

			return true;
		}

		return false;
	}

	stopUsingAllEffects(): void
	{
		this.stopUsingAllEffectsInternal(true);
	}

	toggleEffectSelected(type: number): Effect | null
	{
		const effect = this.getEffect(type);

		if (!effect) return null;

		if (effect.isSelected)
		{
			effect.isSelected = false;
		}
		else
		{
			this.setAllEffectsDeselected();
			effect.isSelected = true;
		}

		return effect;
	}

	setEffectSelected(type: number): void
	{
		const effect = this.getEffect(type);

		if (!effect) return;

		this.setAllEffectsDeselected();
		effect.isSelected = true;
	}

	setEffectDeselected(type: number): void
	{
		const effect = this.getEffect(type);

		if (effect)
		{
			effect.isSelected = false;
		}
	}

	setAllEffectsDeselected(): void
	{
		for (const effect of this._effects)
		{
			effect.isSelected = false;
		}
	}

	getSelectedEffect(filter: EffectFilterType = EffectFilter.ALL): Effect | null
	{
		const effects = this.getEffects(filter);

		for (const effect of effects)
		{
			if (effect.isSelected)
			{
				return effect;
			}
		}

		return null;
	}

	setEffectExpired(type: number): boolean
	{
		this._lastActivatedEffect = -1;

		const effect = this.getEffect(type);

		if (!effect) return false;

		if (effect.amountInInventory > 1)
		{
			effect.setOneEffectExpired();

			return false;
		}

		// Remove effect entirely
		this.removeEffect(type);

		return true;
	}

	reactivateLastEffect(): number
	{
		if (this._lastActivatedEffect !== -1)
		{
			return this.useEffect(this._lastActivatedEffect);
		}

		return -1;
	}

	private stopUsingAllEffectsInternal(clearLastActivated: boolean): void
	{
		for (const effect of this._effects)
		{
			effect.isInUse = false;
		}

		if (clearLastActivated)
		{
			this._lastActivatedEffect = -1;
		}
	}

	private removeEffect(type: number): void
	{
		for (let i = 0; i < this._effects.length; i++)
		{
			if (this._effects[i].type === type)
			{
				const effect = this._effects.splice(i, 1)[0];

				effect.dispose();

				return;
			}
		}
	}
}
