import type {IDisposable} from '@core/runtime/IDisposable';
import type {Pet} from './Pet';

/**
 * Interface for PetsModel
 *
 * Based on AS3 com.sulake.habbo.inventory.pets.PetsModel (ENGINE only)
 */
export interface IPetsModel extends IDisposable
{
    readonly isListInitialized: boolean;
    readonly pets: Map<number, Pet>;

    /**
	 * Add a single pet
	 * Returns true if added (new), false if already exists
	 */
    addPet(pet: Pet): boolean;

    /**
	 * Update pets from full list
	 * Returns info about what changed
	 */
    updatePets(pets: Map<number, Pet>): {
        added: number[];
        removed: number[];
    };

    /**
	 * Remove a pet by ID
	 * Returns the removed pet or null
	 */
    removePet(id: number): Pet | null;

    /**
	 * Get pet by ID
	 */
    getPetById(id: number): Pet | null;

    /**
	 * Get all pets as array
	 */
    getPetsArray(): Pet[];

    /**
	 * Get selected pet
	 */
    getSelectedPet(): Pet | null;

    /**
	 * Select pet by ID
	 */
    selectPet(id: number): void;

    /**
	 * Remove all selections
	 */
    removeSelections(): void;

    /**
	 * Reset unseen flags
	 * Returns IDs that were marked as unseen
	 */
    resetUnseenItems(): number[];

    /**
	 * Mark pets as unseen based on IDs
	 */
    updateUnseenItems(unseenIds: number[]): void;

    /**
	 * Check if pet is unseen
	 */
    isUnseen(id: number): boolean;

    // AS3: sources/win63_version/habbo/inventory/pets/PetsModel.as::updateView()
    updateView(): void;
}
