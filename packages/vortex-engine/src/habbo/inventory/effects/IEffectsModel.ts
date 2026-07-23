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
	 * Mark effect as activated (server-confirmed; timer started)
	 */
    setEffectActivated(type: number): Effect | null;

    /**
	 * Send the enable/activate composer (3022) for an owned effect.
	 */
    requestEffectActivated(type: number): void;

    /**
	 * Use an effect: activate it if needed, then wear it (sends the select
	 * composer 2362).
	 */
    useEffect(type: number): void;

    /**
	 * Stop using a specific effect; when sendStop is true also sends the
	 * select-stop composer (2362 with -1).
	 */
    stopUsingEffect(type: number, sendStop?: boolean): void;

    /**
	 * Stop using all effects. sendStop sends the select-stop composer (2362,-1),
	 * clearLastActivated resets the last-activated tracker.
	 */
    stopUsingAllEffects(sendStop?: boolean, refresh?: boolean, clearLastActivated?: boolean): void;

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
	 * Reactivate the last used effect (re-sends select via useEffect).
	 */
    reactivateLastEffect(): void;
}
