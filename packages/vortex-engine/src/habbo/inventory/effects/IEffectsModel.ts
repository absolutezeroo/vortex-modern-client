import type {Effect} from './Effect';

/**
 * Effect filter types
 */
export const EffectFilter = {
    ALL: -1,
    INACTIVE: 0,
    ACTIVE: 1,
} as const;

export type EffectFilterType = typeof EffectFilter[keyof typeof EffectFilter];

/**
 * Interface for EffectsModel
 *
 * Based on AS3 com.sulake.habbo.inventory.effects.EffectsModel (ENGINE only)
 */
export interface IEffectsModel
{
    readonly disposed: boolean;
    readonly lastActivatedEffect: number;

    dispose(): void;

    /**
	 * Add an effect to inventory
	 * Returns true if added as new, false if incremented existing
	 */
    addEffect(effect: Effect): boolean;

    /**
	 * Get effect by type
	 */
    getEffect(type: number): Effect | null;

    /**
	 * Get effects by filter
	 */
    getEffects(filter?: EffectFilterType): Effect[];

    /**
	 * Get effect at index with optional filter
	 */
    getItemInIndex(index: number, filter?: EffectFilterType): Effect | null;

    /**
	 * Mark effect as activated (timer started)
	 */
    setEffectActivated(type: number): Effect | null;

    /**
	 * Use an effect (activate if needed, mark as in use)
	 * Returns type of effect to send to server, or -1 if already in use
	 */
    useEffect(type: number): number;

    /**
	 * Stop using a specific effect
	 * Returns true if effect was being used
	 */
    stopUsingEffect(type: number): boolean;

    /**
	 * Stop using all effects
	 */
    stopUsingAllEffects(): void;

    /**
	 * Toggle effect selection
	 */
    toggleEffectSelected(type: number): Effect | null;

    /**
	 * Select effect by type
	 */
    setEffectSelected(type: number): void;

    /**
	 * Deselect effect by type
	 */
    setEffectDeselected(type: number): void;

    /**
	 * Deselect all effects
	 */
    setAllEffectsDeselected(): void;

    /**
	 * Get currently selected effect
	 */
    getSelectedEffect(filter?: EffectFilterType): Effect | null;

    /**
	 * Mark effect as expired
	 * Returns true if effect was removed entirely
	 */
    setEffectExpired(type: number): boolean;

    /**
	 * Reactivate last used effect
	 * Returns type to send to server, or -1 if none
	 */
    reactivateLastEffect(): number;
}
